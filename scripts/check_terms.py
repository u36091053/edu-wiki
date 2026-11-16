#!/usr/bin/env python3
"""檢查教育名詞小百科是否遵守 CLAUDE.md 的規則。

用法：python3 scripts/check_terms.py
全部通過時結束碼為 0，有錯誤時為 1。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED_FIELDS = ["slug", "zh", "en", "category", "summary", "proposer", "year", "related", "added"]
REQUIRED_SECTIONS = ["definition", "origin", "key-ideas", "classroom", "misconceptions", "related", "references"]
SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

errors, warnings = [], []


def load_array(src, name):
    m = re.search(r"window\." + name + r"\s*=\s*(\[.*?\]);", src, re.S)
    if not m:
        errors.append(f"data/terms.js 找不到 window.{name}")
        return []
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        errors.append(f"data/terms.js 的 window.{name} 不是合法 JSON（第 {e.lineno} 行附近）：{e.msg}")
        return []


src = (ROOT / "data/terms.js").read_text(encoding="utf-8")
categories = load_array(src, "CATEGORIES")
terms = load_array(src, "TERMS")
cat_names = {c.get("name") for c in categories}

seen_slug, seen_zh = set(), set()
for i, t in enumerate(terms):
    label = t.get("zh") or t.get("slug") or f"第 {i + 1} 筆"
    missing = [f for f in REQUIRED_FIELDS if not t.get(f)]
    if missing:
        errors.append(f"[{label}] terms.js 缺少欄位：{', '.join(missing)}")
        continue
    slug = t["slug"]
    if not SLUG_RE.match(slug):
        errors.append(f"[{label}] slug「{slug}」不符合小寫連字號格式")
    expected = re.sub(r"[^a-z0-9]+", "-", t["en"].lower()).strip("-")
    if slug != expected:
        warnings.append(f"[{label}] slug「{slug}」與英文名轉換結果「{expected}」不同，請確認")
    if slug in seen_slug:
        errors.append(f"[{label}] slug 重複：{slug}")
    if t["zh"] in seen_zh:
        errors.append(f"[{label}] 中文名重複：{t['zh']}")
    seen_slug.add(slug)
    seen_zh.add(t["zh"])
    if t["category"] not in cat_names:
        errors.append(f"[{label}] 分類「{t['category']}」不在允許清單 {sorted(cat_names)}")
    n = len(t["summary"])
    if not 20 <= n <= 45:
        warnings.append(f"[{label}] summary 長度 {n} 字，建議 20～45 字")
    if not DATE_RE.match(t["added"]):
        errors.append(f"[{label}] added 日期格式應為 YYYY-MM-DD")
    rel = t["related"]
    if not isinstance(rel, list) or not 3 <= len(rel) <= 6:
        errors.append(f"[{label}] related 應為 3～6 個中文名詞")
    elif t["zh"] in rel:
        errors.append(f"[{label}] related 不可包含自己")

    # ---- 名詞頁 ----
    page_path = ROOT / "terms" / f"{slug}.html"
    if not page_path.exists():
        errors.append(f"[{label}] 找不到頁面 terms/{slug}.html")
        continue
    html = page_path.read_text(encoding="utf-8")
    if "{{" in html:
        errors.append(f"[{label}] 頁面殘留模板佔位文字：{', '.join(sorted(set(re.findall(r'{{.*?}}', html)))[:3])}")
    if f'data-slug="{slug}"' not in html or 'data-page="term"' not in html or 'data-root="../"' not in html:
        errors.append(f"[{label}] <body> 缺少 data-page / data-slug / data-root 屬性")
    title = re.search(r"<title>(.*?)</title>", html)
    want_title = f"{t['zh']} {t['en']}｜教育名詞小百科"
    if not title or title.group(1) != want_title:
        errors.append(f"[{label}] <title> 應為「{want_title}」")
    if f"<h1>{t['zh']}</h1>" not in html:
        errors.append(f"[{label}] <h1> 應為中文名「{t['zh']}」")
    if f'<p class="summary">{t["summary"]}</p>' not in html:
        errors.append(f"[{label}] 頁面的 .summary 與 terms.js 的 summary 不一致")
    if f'data-cat="{t["category"]}"' not in html:
        errors.append(f"[{label}] 頁面的分類與 terms.js 不一致")
    positions = []
    for sec in REQUIRED_SECTIONS:
        p = html.find(f'<section id="{sec}">')
        if p == -1:
            errors.append(f"[{label}] 缺少區塊 #{sec}")
        positions.append(p)
    if -1 not in positions and positions != sorted(positions):
        errors.append(f"[{label}] 區塊順序錯誤，應為：{' → '.join(REQUIRED_SECTIONS)}")
    if 'class="infobox"' not in html:
        errors.append(f"[{label}] 缺少 .infobox 資訊框")
    if 'class="example-meta"' not in html:
        errors.append(f"[{label}] 課堂例子缺少 .example-meta（年級・科目）")
    refs = re.search(r'<ol class="refs">(.*?)</ol>', html, re.S)
    if not refs or "<li>" not in refs.group(1):
        errors.append(f"[{label}] 參考資料至少需要 1 筆")
    if re.search(r"<style|style=\"", html):
        errors.append(f"[{label}] 名詞頁不可使用 <style> 或 inline style")
    if re.search(r"<script>(?!</script>)", html):
        errors.append(f"[{label}] 名詞頁不可寫內嵌 <script>")
    if not re.search(r'<p class="updated">最後更新：\d{4}-\d{2}-\d{2}</p>', html):
        errors.append(f"[{label}] 缺少頁尾「最後更新：YYYY-MM-DD」")
    if re.search(r'(href|src)="/', html):
        errors.append(f"[{label}] 使用了絕對路徑，GitHub Pages 上會失效，請改相對路徑")

# ---- 沒登錄的孤兒頁面 ----
for f in sorted((ROOT / "terms").glob("*.html")):
    if f.stem not in seen_slug:
        errors.append(f"terms/{f.name} 沒有登錄在 data/terms.js")

# ---- 報告 ----
wanted = sorted({r for t in terms for r in t.get("related", []) if r not in seen_zh})
print(f"已收錄名詞：{len(terms)}　分類：{len(categories)}　待撰寫名詞：{len(wanted)}")
for w in warnings:
    print("⚠️ ", w)
for e in errors:
    print("❌ ", e)
if errors:
    print(f"\n共 {len(errors)} 個錯誤，請依 CLAUDE.md 修正。")
    sys.exit(1)
print("✅ 全部通過")
