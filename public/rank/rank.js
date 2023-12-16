//load navbar
$(function () {
  $("#navbar").load("/navigation/navigation.html");
});
const err = new URL(window.location.href).searchParams.get("err");
if (err) {
  alert(err);
}

// let totalScores = [];

window.onload = () => {
  loadRank();
  document.querySelector("#form-select").onchange = changeRankPeriod;
};

function changeRankPeriod() {
  let value = this.value;

  loadRank(value);
}

//for load daily rank table
async function loadRank(period) {
  const res = await fetch(`/rank?period=${period}`);
  let scores = await res.json();
  const rankDiv = document.querySelector(".rank-table");
  rankDiv.innerHTML = "";
  let i = 0;
  for (let score of scores) {
    i++;
    updateRankDiv(score, rankDiv, i);
  }
}

function updateRankDiv(score, rankDiv, number) {
  rankDiv.innerHTML += `
  <tr>
      <th class="rank-different-period"scope="row">${number}</th>
      <td class="player-name">${score.name}</td>
      <td class="score-different-period">${score.score}</td>
     </tr>
      `;
}
