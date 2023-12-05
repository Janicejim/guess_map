const err = new URL(window.location.href).searchParams.get("err");
if (err) {
  alert(err);
}

// let totalScores = [];

window.onload = () => {
  loadDailyRank();
  document.querySelector("#form-select").onchange = changeRankPeriod;
};

function changeRankPeriod() {
  let value = this.value;

  if (value == "Daily Rank") {
    loadDailyRank();
  } else if (value == "Weekly Rank") {
    loadWeeklyRank();
  } else if (value == "Monthly Rank") {
    loadMonthlyRank();
  } else if (value == "Monthly Rank") {
  } else {
    loadTotalRank();
  }
}

//for load daily rank table
async function loadDailyRank() {
  const res = await fetch("/rank/daily");
  dailyScores = await res.json();
  const dailyRankDiv = document.querySelector(".rank-table");
  dailyRankDiv.innerHTML = "";
  let i=0
  for (let dailyScore of dailyScores) {
    i++
    if(i<=10){

    updateDailyRankDiv(dailyScore, dailyRankDiv);
  }
    }

  }


function updateDailyRankDiv(dailyScore, dailyRankDiv) {

  dailyRankDiv.innerHTML += `
  <tr>
      <th class="rank-different-period"scope="row">${
        dailyScores.length++ -10
      }</th>
      <td class="player-name">${dailyScore.name}</td>
      <td class="score-different-period">${dailyScore.score_change}</td>
     </tr>
      `;
}

//for load weekly rank table
async function loadWeeklyRank() {
  const res = await fetch("/rank/weekly");
  weeklyScores = await res.json();
  const weeklyRankDiv = document.querySelector(".rank-table");
  weeklyRankDiv.innerHTML = "";
  let i=0
  for (let weeklyScore of weeklyScores) {
    i++
    if(i<=10){
    updateWeeklyRankDiv(weeklyScore, weeklyRankDiv);
    }
}
}

function updateWeeklyRankDiv(weeklyScore, weeklyRankDiv) {
  weeklyRankDiv.innerHTML += `
  <tr>
      <th class="rank-different-period"scope="row">${
        weeklyScores.length++ - 10
      }</th>
      <td class="player-name">${weeklyScore.name}</td>
      <td class="score-different-period">${weeklyScore.score_change}</td>
     </tr>
      `;
}

//for load monthly rank table
async function loadMonthlyRank() {
  const res = await fetch("/rank/monthly");
  monthlyScores = await res.json();
  const monthlyRankDiv = document.querySelector(".rank-table");
  monthlyRankDiv.innerHTML = "";
  let i=0
  for (let monthlyScore of monthlyScores) {
    i++
    if(i<=10){
    updateMonthlyRankDiv(monthlyScore, monthlyRankDiv);
  }
}
}

function updateMonthlyRankDiv(monthlyScore, monthlyRankDiv) {
  monthlyRankDiv.innerHTML += `
  <tr>
      <th class="rank-different-period"scope="row">${
        monthlyScores.length++ - 10
      }</th>
      <td class="player-name">${monthlyScore.name}</td>
      <td class="score-different-period">${monthlyScore.score_change}</td>
     </tr>
      `;
}

//for load total rank table
async function loadTotalRank() {
  const res = await fetch("/rank/total");
  totalScores = await res.json();
  const totalRankDiv = document.querySelector(".rank-table");
  totalRankDiv.innerHTML = "";
  let i=0
  for (let totalScore of totalScores) {
    i++
    if(i<=10){
    updateTotalRankDiv(totalScore, totalRankDiv);
  }
}
}

function updateTotalRankDiv(totalScore, totalRankDiv) {
  totalRankDiv.innerHTML += `
<tr>
    <th class="rank-different-period"scope="row">${
      totalScores.length++ - 10
    }</th>
    <td class="player-name">${totalScore.name}</td>
    <td class="score-different-period">${totalScore.score_change}</td>
   </tr>
    `;
}
