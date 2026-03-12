// ===== TEAM NAMES =====
const TEAM_RED_NAME = "The Bash Brothers";
const TEAM_BLUE_NAME = "The Other Guys";

// ===== MATCH NAMES BY FORMAT =====
const MATCH_NAMES_BY_FORMAT = {
  "Scramble - TPC Palmer Hills": [
    "KIZE/PXM426 v AJM787/JLOSASSO",
    "BGROTHUS3/BUBBAEARL_2 v BONES/TSW3318"
  ],
  "Foursomes - Royal Kent": [
    "KIZE/BUBBAEARL_2 v BONES/TSW3318",
    "BGROTHUS3/PXM426 v AJM787/JLOSASSO"
  ],
  "Shamble - Tobacco Road": [
    "PXM426/BUBBAEARL_2 v BONES/TSW3318",
    "BGROTHUS3/KIZE v AJM787/JLOSASSO"
  ],
  "Four-Ball - Quail Hollow": [
    "Four-Ball Match 1",
    "Four-Ball Match 2"
  ],
  "4v4 Scramble": [
    "4v4 Scramble"
  ],
  "Singles": [
    "Singles 1",
    "Singles 2",
    "Singles 3",
    "Singles 4"
  ]
};

// ===== FORMAT CONFIG =====
const formats = [
  { type: "Scramble - TPC Palmer Hills", matches: 2 },
  { type: "Foursomes - Royal Kent", matches: 2 },
  { type: "Shamble - Tobacco Road", matches: 2 },
  { type: "Four-Ball - Quail Hollow", matches: 2 },
  { type: "4v4 Scramble", matches: 1 },
  { type: "Singles", matches: 4 }
];

const MATCH_POINTS = 18;
const TOTAL_POINTS = formats.reduce((sum, f) => sum + (f.matches * MATCH_POINTS), 0); // 234
const WIN_NUMBER = TOTAL_POINTS / 2; // 117

// ===== SHARED SCORES =====
// Edit these numbers in GitHub, commit, and every device will see the same scores.
const SCORES = [
  // Scramble - TPC Palmer Hills
  { red: 8.5, blue: 9.5 },
  { red: 7.5, blue: 10.5 },

  // Foursomes - Royal Kent
  { red: 6.5, blue: 11.5 },
  { red: 8.5, blue: 9.5 },

  // Shamble - Tobacco Road
  { red: 12.5, blue: 5.5 },
  { red: 0, blue: 0 },

  // Four-Ball
  { red: 0, blue: 0 },
  { red: 0, blue: 0 },

  // 4v4 Scramble
  { red: 0, blue: 0 },

  // singles
  { red: 0, blue: 0 },
  { red: 0, blue: 0 },
  { red: 0, blue: 0 },
  { red: 0, blue: 0 }
];

document.addEventListener("DOMContentLoaded", function () {
  const redNameEl = document.getElementById("redName");
  const blueNameEl = document.getElementById("blueName");
  if (redNameEl) redNameEl.textContent = TEAM_RED_NAME;
  if (blueNameEl) blueNameEl.textContent = TEAM_BLUE_NAME;

  const formatsContainer = document.getElementById("formatsContainer");
  if (!formatsContainer) return;

  let index = 0;

  formats.forEach(format => {
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

    for (let m = 0; m < format.matches; m++) {
      const matchName = MATCH_NAMES_BY_FORMAT[format.type]?.[m] || `Match ${m + 1}`;
      const score = SCORES[index] || { red: 0, blue: 0 };

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="match-name">${matchName}</td>
        <td class="score-cell team-red">${formatScore(score.red)}</td>
        <td class="score-cell team-blue">${formatScore(score.blue)}</td>
      `;

      tbody.appendChild(row);
      index++;
    }
  });

  calculate(SCORES);
});

// ===== CALCULATE =====
function calculate(scores) {
  let red = 0;
  let blue = 0;

  scores.forEach(s => {
    red += Number(s.red || 0);
    blue += Number(s.blue || 0);
  });

  const differential = red - blue;
  const clinchLine = WIN_NUMBER + 0.5;

  setText("redTotal", red.toFixed(1));
  setText("blueTotal", blue.toFixed(1));

  setText("redMagic", Math.max(0, clinchLine - red).toFixed(1));
  setText("blueMagic", Math.max(0, clinchLine - blue).toFixed(1));

  const diffEl = document.getElementById("differential");
  if (diffEl) {
    if (differential > 0) diffEl.textContent = `${TEAM_RED_NAME} +${differential.toFixed(1)}`;
    else if (differential < 0) diffEl.textContent = `${TEAM_BLUE_NAME} +${Math.abs(differential).toFixed(1)}`;
    else diffEl.textContent = "TIED";
  }

  const redBar = document.getElementById("redBar");
  const blueBar = document.getElementById("blueBar");

  if (redBar) {
    redBar.style.width = `${Math.min(100, (red / clinchLine) * 100)}%`;
  }
  if (blueBar) {
    blueBar.style.width = `${Math.min(100, (blue / clinchLine) * 100)}%`;
  }

  drawLeadChart(scores);
}

// ===== LEAD CHART (per match) =====
function drawLeadChart(scores) {
  const canvas = document.getElementById("leadChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let cumulative = 0;
  const leads = scores.map(s => {
    cumulative += (Number(s.red || 0) - Number(s.blue || 0));
    return cumulative;
  });

  if (leads.length === 0) return;

  const w = canvas.width;
  const h = canvas.height;
  const centerY = h / 2;
  const pad = 20;

  const maxLead = Math.max(...leads, 5);
  const minLead = Math.min(...leads, -5);
  const range = Math.max(Math.abs(maxLead), Math.abs(minLead));

  const xStep = (w - pad * 2) / (leads.length - 1 || 1);

  // Midline
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(w, centerY);
  ctx.stroke();

  // Lead line
  ctx.beginPath();
  ctx.lineWidth = 2;

  leads.forEach((lead, i) => {
    const x = pad + i * xStep;
    const y = centerY - (lead / range) * (centerY - pad);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = leads[leads.length - 1] >= 0 ? "#ff4d4d" : "#4da6ff";
  ctx.stroke();
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function formatScore(value) {
  const num = Number(value || 0);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}
