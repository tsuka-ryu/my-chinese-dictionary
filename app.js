const list = document.getElementById("list");
const search = document.getElementById("search");
const count = document.getElementById("count");
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

function render(items) {
  count.textContent = `${items.length} 語`;
  list.innerHTML = items.map(w => `
    <article class="card">
      <span class="hanzi">${esc(w.hanzi)}</span>
      <span class="pinyin">${esc(w.pinyin)}</span>
      ${speakBtns(w.hanzi)}
      ${w.unit ? `<span class="unit">${esc(w.unit)}</span>` : ""}
      <div class="meaning">${esc(w.meaning)}</div>
      ${(w.examples || []).map(e => `
        <div class="ex">
          <div class="zh">${esc(e.zh)} ${speakBtns(e.zh)}</div>
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

list.addEventListener("click", e => {
  const b = e.target.closest(".speak");
  if (b) speak(b.dataset.text, Number(b.dataset.rate));
});

// 音声一覧は非同期に読み込まれるブラウザがあるため、先に取得を促しておく
if ("speechSynthesis" in window) speechSynthesis.getVoices();
