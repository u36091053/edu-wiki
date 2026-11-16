// 教育名詞小百科：名詞索引與分類設定
// 規則見 CLAUDE.md 第 4 節。陣列內容必須是合法 JSON（雙引號、無結尾逗號）。
// 新名詞一律加在 window.TERMS 的最後。

window.CATEGORIES = [
  { "name": "學習理論", "color": "#7b4fa0", "desc": "解釋「人如何學習」的理論與概念" },
  { "name": "評量", "color": "#c25a2e", "desc": "評量的類型、方法與工具" },
  { "name": "教學法", "color": "#24806b", "desc": "教師可以實際採用的教學模式與策略" },
  { "name": "課程與政策", "color": "#3a64a8", "desc": "課程設計、課綱與教育政策相關名詞" }
];

window.TERMS = [
  {
    "slug": "scaffolding",
    "zh": "鷹架理論",
    "en": "Scaffolding",
    "category": "學習理論",
    "summary": "在學習者能力還不足時，由較有能力的人提供暫時性支持，並隨能力提升逐步撤除。",
    "proposer": "Wood、Bruner、Ross",
    "year": "1976",
    "related": ["近側發展區", "建構主義", "形成性評量", "差異化教學", "合作學習"],
    "added": "2026-11-16"
  },
  {
    "slug": "zone-of-proximal-development",
    "zh": "近側發展區",
    "en": "Zone of Proximal Development",
    "category": "學習理論",
    "summary": "學習者「獨立能做到的程度」與「在他人協助下能做到的程度」之間的差距。",
    "proposer": "Lev Vygotsky（維高斯基）",
    "year": "1930 年代",
    "related": ["鷹架理論", "社會文化理論", "建構主義", "動態評量"],
    "added": "2026-11-16"
  },
  {
    "slug": "formative-assessment",
    "zh": "形成性評量",
    "en": "Formative Assessment",
    "category": "評量",
    "summary": "在教學過程中蒐集學生的學習證據，用來即時調整教學並給學生回饋的評量。",
    "proposer": "Michael Scriven；Benjamin Bloom",
    "year": "1967",
    "related": ["總結性評量", "回饋", "精熟學習", "自我評量", "鷹架理論"],
    "added": "2026-11-16"
  },
  {
    "slug": "summative-assessment",
    "zh": "總結性評量",
    "en": "Summative Assessment",
    "category": "評量",
    "summary": "在一段學習結束時，判斷學生達成學習目標程度、並據以給成績或做決定的評量。",
    "proposer": "Michael Scriven",
    "year": "1967",
    "related": ["形成性評量", "評分規準", "素養導向評量", "信度與效度"],
    "added": "2026-11-16"
  },
  {
    "slug": "flipped-classroom",
    "zh": "翻轉教室",
    "en": "Flipped Classroom",
    "category": "教學法",
    "summary": "把講述內容移到課前讓學生自學，課堂時間改用來討論、練習與解決問題的教學模式。",
    "proposer": "Jonathan Bergmann、Aaron Sams",
    "year": "2007",
    "related": ["主動學習", "同儕教學", "混成學習", "形成性評量", "自主學習"],
    "added": "2026-11-16"
  }
];
