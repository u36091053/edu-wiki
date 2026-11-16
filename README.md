# 教育名詞小百科

一個用 `CLAUDE.md` 規則與 AI 協作建立的繁體中文教育學名詞 Wiki。
每個名詞一頁，固定回答：**它是什麼、誰提出的、在課堂上長什麼樣子、常見誤解、相關名詞**。

🔗 網站：https://u36091053.github.io/edu-wiki/

## 特色

- **固定格式**：每頁都有 7 個區塊（定義、提出者與背景、核心概念、課堂上的例子、常見誤解、相關名詞、參考資料）
- **名詞互相連結**：相關名詞已收錄就自動變連結，並顯示「哪些名詞提到本頁」
- **會自己長大的待辦清單**：還沒寫的相關名詞會自動列在首頁「待撰寫名詞」，依被提到次數排序
- **自動檢查**：`scripts/check_terms.py` 檢查每一頁是否遵守規則
- 純 HTML / CSS / JavaScript，不需要安裝任何套件

## 用 AI 新增名詞

在 Claude Code 中：

```
/add-term 建構主義
```

或對任何 AI 說：「請先讀 CLAUDE.md，再依照規則新增名詞：建構主義」。

## 本機預覽

```bash
python3 -m http.server 8000   # 開啟 http://localhost:8000
python3 scripts/check_terms.py
```

也可以直接雙擊 `index.html` 開啟。

## 專案結構

詳見 [`CLAUDE.md`](./CLAUDE.md) 第 2 節。
