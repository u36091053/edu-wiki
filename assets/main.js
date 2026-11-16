// 教育名詞小百科：全站唯一腳本
// 資料來源：data/terms.js（window.TERMS、window.CATEGORIES）
(function () {
  "use strict";

  var TERMS = window.TERMS || [];
  var CATEGORIES = window.CATEGORIES || [];
  var body = document.body;
  var ROOT = body.dataset.root || "";
  var PAGE = body.dataset.page;

  var byZh = {};
  TERMS.forEach(function (t) { byZh[t.zh] = t; });

  function catColor(name) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].name === name) return CATEGORIES[i].color;
    }
    return "";
  }

  function termUrl(t) { return ROOT + "terms/" + t.slug + ".html"; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // 依分類上色：任何帶 data-cat 的元素都會拿到 --cat 變數
  function paintCategories(scope) {
    (scope || document).querySelectorAll("[data-cat]").forEach(function (el) {
      var c = catColor(el.dataset.cat);
      if (c) el.style.setProperty("--cat", c);
    });
  }

  // 尚未收錄、但被其他名詞提到的名詞，依被提到次數排序
  function wantedTerms() {
    var counts = {};
    TERMS.forEach(function (t) {
      (t.related || []).forEach(function (r) {
        if (!byZh[r]) counts[r] = (counts[r] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .map(function (k) { return { zh: k, count: counts[k] }; })
      .sort(function (a, b) { return b.count - a.count || a.zh.localeCompare(b.zh, "zh-Hant"); });
  }

  /* ---------------- 首頁 ---------------- */
  function initIndex() {
    var grid = document.getElementById("card-grid");
    var search = document.getElementById("search");
    var chipBox = document.getElementById("category-chips");
    var wantedBox = document.getElementById("wanted-list");
    var wanted = wantedTerms();
    var state = { q: "", cat: "全部" };

    var hash = decodeURIComponent(location.hash || "");
    var m = hash.match(/cat=([^&]+)/);
    if (m) state.cat = m[1];

    document.getElementById("stat-terms").textContent = TERMS.length;
    document.getElementById("stat-cats").textContent = CATEGORIES.length;
    document.getElementById("stat-wanted").textContent = wanted.length;

    function renderChips() {
      var cats = [{ name: "全部", color: "" }].concat(CATEGORIES);
      chipBox.innerHTML = cats.map(function (c) {
        var n = c.name === "全部" ? TERMS.length : TERMS.filter(function (t) { return t.category === c.name; }).length;
        var dot = c.color ? '<span class="dot" style="background:' + c.color + '"></span>' : "";
        return '<button type="button" class="chip' + (state.cat === c.name ? " is-active" : "") +
          '" data-name="' + esc(c.name) + '" title="' + esc(c.desc || "") + '">' + dot + esc(c.name) + " " + n + "</button>";
      }).join("");
    }

    function matches(t) {
      if (state.cat !== "全部" && t.category !== state.cat) return false;
      if (!state.q) return true;
      var hay = [t.zh, t.en, t.summary, t.proposer, t.category].concat(t.related || []).join(" ").toLowerCase();
      return hay.indexOf(state.q) !== -1;
    }

    function renderCards() {
      var list = TERMS.filter(matches);
      if (!list.length) {
        grid.innerHTML = '<p class="empty">找不到符合的名詞。也許它還在「待撰寫名詞」清單裡？</p>';
        return;
      }
      grid.innerHTML = list.map(function (t) {
        return '<a class="term-card" href="' + termUrl(t) + '" data-cat="' + esc(t.category) + '">' +
          '<span><span class="badge" data-cat="' + esc(t.category) + '">' + esc(t.category) + "</span></span>" +
          "<h3>" + esc(t.zh) + "</h3>" +
          '<span class="en">' + esc(t.en) + "</span>" +
          "<p>" + esc(t.summary) + "</p>" +
          '<span class="meta">' + esc(t.proposer) + "・" + esc(t.year) + "</span></a>";
      }).join("");
      paintCategories(grid);
    }

    function renderWanted() {
      if (!wanted.length) { wantedBox.innerHTML = '<li>目前沒有待撰寫名詞 🎉</li>'; return; }
      wantedBox.innerHTML = wanted.map(function (w) {
        return '<li title="被 ' + w.count + ' 個名詞提到">' + esc(w.zh) + '<span class="count">×' + w.count + "</span></li>";
      }).join("");
    }

    chipBox.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      state.cat = btn.dataset.name;
      history.replaceState(null, "", state.cat === "全部" ? location.pathname : "#cat=" + encodeURIComponent(state.cat));
      renderChips(); renderCards();
    });
    search.addEventListener("input", function () {
      state.q = search.value.trim().toLowerCase();
      renderCards();
    });

    renderChips(); renderCards(); renderWanted();
  }

  /* ---------------- 名詞頁 ---------------- */
  function initTerm() {
    var slug = body.dataset.slug;
    var me = TERMS.filter(function (t) { return t.slug === slug; })[0];

    // 相關名詞：已收錄 → 連結；未收錄 → 虛線標示
    var relatedBox = document.querySelector('[data-auto="related"]');
    if (relatedBox && me) {
      relatedBox.innerHTML = (me.related || []).map(function (zh) {
        var t = byZh[zh];
        return t
          ? '<li><a href="' + termUrl(t) + '">' + esc(zh) + "</a></li>"
          : '<li><span class="missing" title="尚未收錄">' + esc(zh) + "</span></li>";
      }).join("");
    }

    // 反向連結：哪些名詞的 related 提到本頁
    var backBox = document.querySelector('[data-auto="backlinks"]');
    if (backBox && me) {
      var backs = TERMS.filter(function (t) { return t.slug !== slug && (t.related || []).indexOf(me.zh) !== -1; });
      backBox.innerHTML = backs.length
        ? backs.map(function (t) { return '<li><a href="' + termUrl(t) + '">' + esc(t.zh) + "</a></li>"; }).join("")
        : '<li><span class="missing">目前還沒有</span></li>';
    }

    // 目錄：依各區塊的 h2 自動產生
    var toc = document.querySelector('[data-auto="toc"]');
    if (toc) {
      toc.innerHTML = Array.prototype.map.call(document.querySelectorAll(".content section[id] > h2"), function (h) {
        return '<a href="#' + h.parentElement.id + '">' + esc(h.textContent) + "</a>";
      }).join("");
    }
  }

  paintCategories();
  if (PAGE === "index") initIndex();
  if (PAGE === "term") initTerm();
})();
