const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
let words = [];

const esc = (s = "") => s.replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

function render(items) {
  count.textContent = `${items.length} 語`;
  list.innerHTML = items.map(w => `
    <article class="card">
      <span class="hanzi">${esc(w.hanzi)}</span>
      <span class="pinyin">${esc(w.pinyin)}</span>
      ${w.unit ? `<span class="unit">${esc(w.unit)}</span>` : ""}
      <div class="meaning">${esc(w.meaning)}</div>
      ${(w.examples || []).map(e => `
        <div class="ex">
          <div class="zh">${esc(e.zh)}</div>
          <div class="py">${esc(e.pinyin)}</div>
          <div class="ja">${esc(e.ja)}</div>
        </div>`).join("")}
    </article>`).join("");
}

function filter() {
  const q = search.value.trim().toLowerCase();
  render(!q ? words : words.filter(w =>
    JSON.stringify(w).toLowerCase().includes(q)));
}

fetch("data/words.json")
  .then(r => r.json())
  .then(data => { words = data; filter(); })
  .catch(() => { list.textContent = "データを読み込めませんでした。"; });

search.addEventListener("input", filter);
