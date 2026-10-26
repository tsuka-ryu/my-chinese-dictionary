const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
const nav = document.getElementById("nav");
let words = [];
let activeUnit = null; // null = すべて

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
  // iOS Safari: 消音モードでも鳴らすため、再生扱いのオーディオセッションにする(非対応ブラウザでは何もしない)
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch {}
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
    const key = unitOf(w);
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

const unitOf = w => w.unit || "その他";

function renderNav() {
  const names = groupByUnit(words).map(([name]) => name);
  nav.hidden = names.length < 2;
  nav.innerHTML = [null, ...names].map(name => `
    <button type="button" data-unit="${name === null ? "" : esc(name)}"
      class="${name === activeUnit ? "active" : ""}"
      aria-pressed="${name === activeUnit}">${name === null ? "すべて" : esc(name)}</button>`).join("");
}

function render(items) {
  count.textContent = `${items.length} 語`;
  list.innerHTML = groupByUnit(items).map(([name, ws]) => `
    <section>
      <h2>${esc(name)} <small>${ws.length}語</small></h2>
      ${ws.map(card).join("")}
    </section>`).join("");
}

function filter() {
  const q = search.value.trim().toLowerCase();
  render(words.filter(w =>
    (activeUnit === null || unitOf(w) === activeUnit) &&
    (!q || JSON.stringify(w).toLowerCase().includes(q))));
}

fetch("data/words.json", { cache: "no-cache" })
  .then(r => r.json())
  .then(data => { words = data; renderNav(); filter(); })
  .catch(() => { list.textContent = "データを読み込めませんでした。"; });

search.addEventListener("input", filter);

list.addEventListener("click", e => {
  const b = e.target.closest(".speak");
  if (b) speak(b.dataset.text, Number(b.dataset.rate));
});

// 音声一覧は非同期に読み込まれるブラウザがあるため、先に取得を促しておく
if ("speechSynthesis" in window) speechSynthesis.getVoices();

nav.addEventListener("click", e => {
  const b = e.target.closest("button[data-unit]");
  if (!b) return;
  activeUnit = b.dataset.unit || null;
  renderNav();
  filter();
  window.scrollTo({ top: 0 });
});
