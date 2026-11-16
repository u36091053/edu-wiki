# AGENTS.md

本專案的完整規則寫在 [`CLAUDE.md`](./CLAUDE.md)，所有 AI 工具（Codex、Cursor、Gemini CLI 等）都請**先完整閱讀 `CLAUDE.md`** 再開始工作。

最重要的三件事：

1. 新增名詞時，從 `templates/term-template.html` 複製，並在 `data/terms.js` 登錄。
2. 每頁必須依序包含 7 個區塊：`definition`、`origin`、`key-ideas`、`classroom`、`misconceptions`、`related`、`references`。
3. 修改完畢執行 `python3 scripts/check_terms.py`，必須全部通過。
