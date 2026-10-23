const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const nav = document.getElementById("nav");
let words = [];

const esc = (s = "") => s.replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

const speakBtns = text => `
  <button class="speak" data-text="${esc(text)}" data-rate="1" aria-label="読み上げ">🔊</button>
  <button class="speak" data-text="${esc(text)}" data-rate="0.6" aria-label="ゆっくり読み上げ">🐢</button>`;

function speak(text, rate) {
  if (!("speechSynthesis" in window)) return alert("このブラウザは読み上げに対応していません。");
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.replace("_", "-") === "zh-CN") ||
    voices.find(v => v.lang.toLowerCase().startsWith("zh"));
  if (voices.length && !voice) return alert("この端末では中国語の音声が使えません。");
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  if (voice) u.voice = voice;
  u.rate = rate;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

const card = w => `
  <article class="card">
    <span class="hanzi">${esc(w.hanzi)}</span>
    <span class="pinyin">${esc(w.pinyin)}</span>
    ${speakBtns(w.hanzi)}
    <div class="meaning">${esc(w.meaning)}</div>
    ${(w.examples || []).map(e => `
      <div class="ex">
        <div class="zh">${esc(e.zh)} ${speakBtns(e.zh)}</div>
        <div class="py">${esc(e.pinyin)}</div>
        <div class="ja">${esc(e.ja)}</div>
      </div>`).join("")}
  </article>`;

// unit ごとにまとめる(初出順。unit が無い単語は最後の「その他」)
function groupByUnit(items) {
  const groups = new Map();
  for (const w of items) {
    const key = w.unit || "その他";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  if (groups.has("その他")) {
    const other = groups.get("その他");
    groups.delete("その他");
    groups.set("その他", other);
  }
  return [...groups];
}

function render(items) {
  count.textContent = `${items.length} 語`;
  const groups = groupByUnit(items);
  nav.hidden = groups.length < 2;
  nav.innerHTML = groups.map(([name], i) =>
    `<button type="button" data-target="unit-${i}">${esc(name)}</button>`).join("");
  list.innerHTML = groups.map(([name, ws], i) => `
    <section>
      <h2 id="unit-${i}">${esc(name)} <small>${ws.length}語</small></h2>
      ${ws.map(card).join("")}
    </section>`).join("");
}

function filter() {
  const q = search.value.trim().toLowerCase();
  render(!q ? words : words.filter(w =>
    JSON.stringify(w).toLowerCase().includes(q)));
}

fetch("data/words.json", { cache: "no-cache" })
  .then(r => r.json())
  .then(data => { words = data; filter(); })
  .catch(() => { list.textContent = "データを読み込めませんでした。"; });

search.addEventListener("input", filter);

list.addEventListener("click", e => {
  const b = e.target.closest(".speak");
  if (b) speak(b.dataset.text, Number(b.dataset.rate));
});

// 音声一覧は非同期に読み込まれるブラウザがあるため、先に取得を促しておく
if ("speechSynthesis" in window) speechSynthesis.getVoices();

nav.addEventListener("click", e => {
  const b = e.target.closest("button[data-target]");
  if (b) document.getElementById(b.dataset.target)
    .scrollIntoView({ behavior: "smooth", block: "start" });
});
