const URL = "https://raw.githubusercontent.com/mybot-drair/tiers/main/tiers.json";

let RAW = [];
let DATA = {};
let modes = [];
let currentTab = "";

async function loadData() {
  const res = await fetch(URL + "?t=" + Date.now());
  const json = await res.json();

  RAW = json.players || [];

  build();
  renderTabs();
  render();
}

/* Build grouped data */
function build() {
  DATA = {};

  RAW.forEach(p => {
    const mode = p.gamemode || "unknown";
    if (!DATA[mode]) DATA[mode] = [];
    DATA[mode].push(p);
  });

  modes = Object.keys(DATA);
  if (!currentTab) currentTab = modes[0];

  // sort by tier strength
  modes.forEach(m => {
    DATA[m].sort((a, b) =>
      tierValue(b.tier_key) - tierValue(a.tier_key)
    );
  });
}

/* Tier scoring */
function tierValue(key) {
  if (!key) return 0;
  const m = key.match(/(ht|lt)(\d+)/);
  if (!m) return 0;
  return (m[1] === "ht" ? 100 : 0) + (10 - parseInt(m[2]));
}

/* Tabs */
function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";

  modes.forEach(m => {
    const t = document.createElement("div");
    t.className = "tab " + (m === currentTab ? "active" : "");
    t.textContent = m;

    t.onclick = () => {
      currentTab = m;
      renderTabs();
      render();
    };

    tabs.appendChild(t);
  });
}

/* Render leaderboard */
function render() {
  const board = document.getElementById("leaderboard");
  const search = document.getElementById("search").value.toLowerCase();

  board.innerHTML = "";

  let players = DATA[currentTab] || [];

  players = players.filter(p =>
    (p.username || "").toLowerCase().includes(search)
  );

  players.forEach((p, i) => {
    const div = document.createElement("div");

    let className = "player";
    if (i === 0) className += " top1";
    if (i === 1) className += " top2";
    if (i === 2) className += " top3";

    div.className = className;

    div.innerHTML = `
      <div class="rank">#${i + 1}</div>
      <img class="skin" src="https://mc-heads.net/avatar/${p.username}">
      <div class="name">${p.username}</div>
      <div class="tier">${p.tier}</div>
    `;

    div.onclick = () => openModal(p, i + 1);

    board.appendChild(div);
  });
}

/* Modal */
function openModal(p, rank) {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal-name").textContent = `${p.username} (#${rank})`;
  document.getElementById("modal-tier").textContent = p.tier;
  document.getElementById("modal-skin").src = `https://mc-heads.net/avatar/${p.username}`;
}

document.getElementById("close").onclick = () => {
  document.getElementById("modal").classList.add("hidden");
};

document.getElementById("search").addEventListener("input", render);

setInterval(loadData, 30000);
loadData();
