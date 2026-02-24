// ===== TEAM NAMES =====
const TEAM_RED_NAME = "The Bash Brothers";
const TEAM_BLUE_NAME = "The Other Guys";

// ===== MATCH NAMES BY FORMAT =====
const MATCH_NAMES_BY_FORMAT = {
  "Scramble - TPC Palmer Hills": ["BUBBAEARL_2/PXM426 v AJM787/BONES", "BGROTHUS3/KIZE v JOSASSO/TSW3318"],
  "Foursomes - Royal Kent": ["Foursomes Match 1", "Foursomes Match 2"],
  "Shamble - Tobacco Road": ["Shamble Match 1", "Shamble Match 2"],
  "Four-Ball": ["Four-Ball Match 1", "Four-ball Match 2"],
  "4v4 Scramble": ["4v4 Scramble"],
  singles: ["Singles 1", "Singles 2", "Singles 3", "Singles 4"]
};

// ===== FORMAT CONFIG =====
const formats = [
  { type: "Scramble - TPC Palmer Hills", matches: 2 },
  { type: "Foursomes - Royal Kent", matches: 2 },
  { type: "Shamble - Tobacco Road", matches: 2 },
  { type: "Four-Ball", matches: 2 },
  { type: "4v4 Scramble", matches: 1 },
  { type: "singles", matches: 4 }
];

const HOLES_PER_MATCH = 18;
const TOTAL_POINTS = formats.reduce((sum, f) => sum + (f.matches * HOLES_PER_MATCH), 0); // 234
const WIN_NUMBER = TOTAL_POINTS / 2; // 117

document.addEventListener("DOMContentLoaded", function () {
  // Scoreboard team names
  const redNameEl = document.getElementById("redName");
  const blueNameEl = document.getElementById("blueName");
  if (redNameEl) redNameEl.textContent = TEAM_RED_NAME;
  if (blueNameEl) blueNameEl.textContent = TEAM_BLUE_NAME;

  const formatsContainer = document.getElementById("formatsContainer");
  if (!formatsContainer) return;

  // Load scores (persisted)
  let scores = JSON.parse(localStorage.getItem("cupScores")) || [];
  let index = 0;

  // Render formats & matches
  formats.forEach((format) => {
    const section = document.createElement("div");
    section.className = "format-section";

    const title = document.createElement("h2");
    title.textContent = format.type.toUpperCase();
    section.appendChild(title);

    const table = document.createElement("table");
    table.className = "match-table";

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    section.appendChild(table);
    formatsContainer.appendChild(section);

    for (let m = 1; m <= format.matches; m++) {
      const matchNames = MATCH_NAMES_BY_FORMAT[format.type] || [];
      const matchLabel = matchNames[m - 1] || `Match ${m}`;

      // Match header row (clickable)
      const matchHeaderRow = document.createElement("tr");
      matchHeaderRow.className = "match-toggle";
      matchHeaderRow.innerHTML = `
        <td colspan="3" class="match-toggle-cell">
          <span class="toggle-arrow">▶</span>
          <span class="toggle-title">${matchLabel}</span>
        </td>
      `;
      tbody.appendChild(matchHeaderRow);

      // Rows to toggle
      const matchRows = [];

      for (let h = 1; h <= HOLES_PER_MATCH; h++) {
        if (!scores[index]) scores[index] = { red: 0, blue: 0 };

        const row = document.createElement("tr");
        row.classList.add("match-detail-row");
        row.style.display = "none"; // collapsed by default

        row.innerHTML = `
          <td class="hole-cell">H${h}</td>
          <td>
            <select data-index="${index}">
              <option value="0,0">--</option>
              <option value="1,0">${TEAM_RED_NAME}</option>
              <option value="0,1">${TEAM_BLUE_NAME}</option>
              <option value="0.5,0.5">Halved</option>
            </select>
          </td>
          <td class="match-mini-note"></td>
        `;

        const select = row.querySelector("select");
        select.value = `${scores[index].red},${scores[index].blue}`;

        select.onchange = function () {
          const [r, b] = this.value.split(",").map(Number);
          const i = Number(this.dataset.index);
          scores[i] = { red: r, blue: b };
          localStorage.setItem("cupScores", JSON.stringify(scores));
          calculate(scores);
        };

        matchRows.push(row);
        tbody.appendChild(row);
        index++;
      }

      // Divider
      const divider = document.createElement("tr");
      divider.innerHTML = `<td colspan="3" class="match-divider"></td>`;
      tbody.appendChild(divider);

      // Toggle behavior
      matchHeaderRow.addEventListener("click", () => {
        const isCollapsed = matchRows[0].style.display === "none";
        matchRows.forEach((r) => (r.style.display = isCollapsed ? "table-row" : "none"));
        const arrow = matchHeaderRow.querySelector(".toggle-arrow");
        arrow.textContent = isCollapsed ? "▼" : "▶";
      });
    }
  });

  // Save + initial calc
  localStorage.setItem("cupScores", JSON.stringify(scores));
  calculate(scores);
});

// ===== CALCULATE + UPDATE UI =====
function calculate(scores) {
  let red = 0;
  let blue = 0;

  for (const s of scores) {
    red += Number(s.red || 0);
    blue += Number(s.blue || 0);
  }

  const played = red + blue;
  const remaining = TOTAL_POINTS - played;
  const differential = red - blue;

  setText("redTotal", red.toFixed(1));
  setText("blueTotal", blue.toFixed(1));

  const clinchLine = WIN_NUMBER + 0.5;
  const redMagic = Math.max(0, clinchLine - red);
  const blueMagic = Math.max(0, clinchLine - blue);
  setText("redMagic", redMagic.toFixed(1));
  setText("blueMagic", blueMagic.toFixed(1));

  const diffEl = document.getElementById("differential");
  if (diffEl) {
    if (differential > 0) diffEl.textContent = `${TEAM_RED_NAME} +${differential.toFixed(1)}`;
    else if (differential < 0) diffEl.textContent = `${TEAM_BLUE_NAME} +${Math.abs(differential).toFixed(1)}`;
    else diffEl.textContent = "TIED";
  }

  const redBar = document.getElementById("redBar");
  const blueBar = document.getElementById("blueBar");
  if (redBar) redBar.style.width = `${Math.min(100, (red / clinchLine) * 100)}%`;
  if (blueBar) blueBar.style.width = `${Math.min(100, (blue / clinchLine) * 100)}%`;

  // Clinch text: only show when clinched
  const clinchEl = document.getElementById("clinchText");
  if (clinchEl) {
    if (red >= clinchLine) clinchEl.textContent = `🔥 ${TEAM_RED_NAME} CLINCHES THE CUP 🔥`;
    else if (blue >= clinchLine) clinchEl.textContent = `🔥 ${TEAM_BLUE_NAME} CLINCHES THE CUP 🔥`;
    else clinchEl.textContent = "";
  }

  // Momentum (last 10 played holes)
  const momentumEl = document.getElementById("momentum");
  if (momentumEl) {
    const playedScores = scores.filter(s => (s.red || 0) !== 0 || (s.blue || 0) !== 0);
    const lastTen = playedScores.slice(-10);
    let momentum = 0;
    lastTen.forEach(s => momentum += (Number(s.red || 0) - Number(s.blue || 0)));

    if (momentum > 2) momentumEl.textContent = `🔥 ${TEAM_RED_NAME} HEATER +${momentum.toFixed(1)}`;
    else if (momentum < -2) momentumEl.textContent = `🔥 ${TEAM_BLUE_NAME} HEATER +${Math.abs(momentum).toFixed(1)}`;
    else momentumEl.textContent = "🧊 Ice Cold / Even";
  }

  // Ticker
  const tickerEl = document.getElementById("ticker");
  if (tickerEl) {
    tickerEl.textContent = `⚡ ${TEAM_RED_NAME} ${red.toFixed(1)} - ${TEAM_BLUE_NAME} ${blue.toFixed(1)} | Remaining ${remaining.toFixed(1)} ⚡`;
  }

  // ✅ Lead Timeline (fix)
  drawLeadChart(scores);
}

// ===== LEAD TIMELINE (no flatline) =====
function drawLeadChart(scores) {
  const canvas = document.getElementById("leadChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Only plot holes that have been entered
  const played = scores.filter(s => (Number(s.red || 0) !== 0) || (Number(s.blue || 0) !== 0));
  if (played.length === 0) return;

  // Cumulative lead series
  let cum = 0;
  const leads = played.map(s => {
    cum += (Number(s.red || 0) - Number(s.blue || 0));
    return cum;
  });

  const w = canvas.width;
  const h = canvas.height;
  const centerY = h / 2;
  const pad = 20;

  const maxLead = Math.max(...leads, 3);
  const minLead = Math.min(...leads, -3);
  const range = Math.max(Math.abs(maxLead), Math.abs(minLead));

  // Midline
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(w, centerY);
  ctx.stroke();

  // X step uses ONLY played points -> no trailing flatline
  const xStep = (leads.length <= 1) ? 0 : (w - pad * 2) / (leads.length - 1);

  // Lead line
  ctx.beginPath();
  ctx.lineWidth = 2;

  leads.forEach((lead, i) => {
    const x = pad + i * xStep;
    const y = centerY - (lead / range) * (centerY - pad);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  const finalLead = leads[leads.length - 1];
  ctx.strokeStyle = finalLead >= 0 ? "#ff4d4d" : "#4da6ff";
  ctx.stroke();

  // End dot
  const lastX = pad + (leads.length - 1) * xStep;
  const lastY = centerY - (finalLead / range) * (centerY - pad);
  ctx.fillStyle = finalLead >= 0 ? "#ff4d4d" : "#4da6ff";
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  ctx.fill();
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}