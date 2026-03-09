// ===== TEAM NAMES =====
const TEAM_RED_NAME = "The Bash Brothers";
const TEAM_BLUE_NAME = "The Other Guys";

// ===== MATCH NAMES BY FORMAT =====
const MATCH_NAMES_BY_FORMAT = {
  "Scramble - TPC Palmer Hills": [
    "KIZE/PXM426 v AJM787/JLOSASSO",
    "BGROTHUS3/BUBBAEARL_2 v BONES/TSW3318"
  ],
  "Foursomes - Royal Kent": ["KIZE/BUBBAEARL_2 v BONES/TSW3318", "BGROTHUS3/PXM426 v AJM787/JLOSASSO"],
  "Shamble - Tobacco Road": ["PXM426/BUBBAEARL_2 v BONES/TSW3318", "BGROTHUS3/KIZE v AJM787/JLOSASSO"],
  "Four-Ball - Quail Hollow": ["Four-Ball Match 1", "Four-Ball Match 2"],
  "4v4 Scramble": ["4v4 Scramble"],
  "singles": ["Singles 1", "Singles 2", "Singles 3", "Singles 4"]
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

const MATCH_POINTS = 18;
const TOTAL_POINTS = formats.reduce((sum, f) => sum + (f.matches * MATCH_POINTS), 0); // 234
const WIN_NUMBER = TOTAL_POINTS / 2;

document.addEventListener("DOMContentLoaded", function () {

  const formatsContainer = document.getElementById("formatsContainer");

  let scores = JSON.parse(localStorage.getItem("cupScores")) || [];
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

      if (!scores[index]) scores[index] = { red: 0, blue: 0 };

      const matchName = MATCH_NAMES_BY_FORMAT[format.type]?.[m] || `Match ${m+1}`;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="match-name">${matchName}</td>
        <td>
          <input type="number" min="0" max="${MATCH_POINTS}"
            value="${scores[index].red}"
            data-team="red"
            data-index="${index}" class="score-input red-input">
        </td>
        <td>
          <input type="number" min="0" max="${MATCH_POINTS}"
            value="${scores[index].blue}"
            data-team="blue"
            data-index="${index}" class="score-input blue-input">
        </td>
      `;

      tbody.appendChild(row);
      index++;
    }
  });

  // Listen for score changes
  document.addEventListener("input", function (e) {
    if (!e.target.classList.contains("score-input")) return;

    const idx = Number(e.target.dataset.index);
    const team = e.target.dataset.team;

    scores[idx][team] = Number(e.target.value || 0);

    localStorage.setItem("cupScores", JSON.stringify(scores));
    calculate(scores);
  });

  calculate(scores);
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
  if (differential > 0) diffEl.textContent = `${TEAM_RED_NAME} +${differential}`;
  else if (differential < 0) diffEl.textContent = `${TEAM_BLUE_NAME} +${Math.abs(differential)}`;
  else diffEl.textContent = "TIED";

  document.getElementById("redBar").style.width =
    `${Math.min(100, (red / clinchLine) * 100)}%`;

  document.getElementById("blueBar").style.width =
    `${Math.min(100, (blue / clinchLine) * 100)}%`;

  drawLeadChart(scores);
}

// ===== LEAD CHART (per match now) =====
function drawLeadChart(scores) {

  const canvas = document.getElementById("leadChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let cumulative = 0;
  const leads = scores.map(s => {
    cumulative += (s.red - s.blue);
    return cumulative;
  });

  if (leads.length === 0) return;

  const w = canvas.width;
  const h = canvas.height;
  const centerY = h/2;
  const pad = 20;

  const maxLead = Math.max(...leads, 5);
  const minLead = Math.min(...leads, -5);
  const range = Math.max(Math.abs(maxLead), Math.abs(minLead));

  const xStep = (w - pad*2) / (leads.length - 1 || 1);

  // midline
  ctx.strokeStyle = "#444";
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(w, centerY);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 2;

  leads.forEach((lead,i) => {
    const x = pad + i*xStep;
    const y = centerY - (lead/range)*(centerY-pad);
    if (i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.strokeStyle = leads[leads.length-1] >= 0 ? "#ff4d4d" : "#4da6ff";
  ctx.stroke();
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}
