//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

let type = "score";
let period = "all";
document.querySelector("#form-select").onchange = changeRankPeriod;
loadRank(period, type);

function changeRankPeriod() {
  let value = this.value;
  period = value;
  loadRank(period, type);
}

let typeElements = document.querySelectorAll(".swiper-slide");
for (let typeElement of typeElements) {
  typeElement.addEventListener("click", () => {
    clickedStyle(typeElement);
    type = typeElement.getAttribute("data-type");
    loadRank(period, type);
  });
}

function clickedStyle(element) {
  let typeElements = document.querySelectorAll(".swiper-slide");
  for (let typeElement of typeElements) {
    typeElement.classList.remove("clicked");
  }
  element.classList.add("clicked");
}

async function loadRank(period, type) {
  const res = await fetch(`/rank?period=${period}&type=${type}`);
  let result = await res.json();
  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  let records = result.data;
  const rankDiv = document.querySelector("table");

  let userRankThead = `<tr>
  <thead>
    <th>排名</th>
    <th>用家</th>
    <th>積分</th>
  </thead>
  </tr>`;

  let userCheckInThead = `<tr>
  <thead>
    <th>排名</th>
    <th>用家</th>
    <th>數目</th>
  </thead>
  </tr>`;

  let gameRankThead = `<tr>
  <thead>
    <th>排名</th>
    <th>遊戲</th>
    <th>數目</th>
  </thead>
  </tr>`;

  if (type == "score") {
    rankDiv.innerHTML = userRankThead;
  } else if (type == "user-check-in") {
    rankDiv.innerHTML = userCheckInThead;
  } else {
    rankDiv.innerHTML = gameRankThead;
  }

  if (records.length == 0) {
    rankDiv.innerHTML = `<div>未有任何排名成績</div>`;
    return;
  }

  let i = 0;
  for (let record of records) {
    i++;
    updateUserRankDiv(record, rankDiv, i, type);
  }
}
function updateUserRankDiv(record, rankDiv, number, type) {
  let rankTemplate = document
    .querySelector("#ranking-template")
    .content.cloneNode(true);

  rankTemplate.querySelector(".rank-number").textContent = number;

  if (type == "score" || type == "user-check-in") {
    rankTemplate.querySelector("img").src = record.profile_image
      ? `https://guessmap.image.bonbony.one/${record.profile_image}`
      : "https://guessmap.image.bonbony.one/anonymous.jpg";
    rankTemplate.querySelector("a").href = `/profile.html?id=${record.user_id}`;
    rankTemplate.querySelector(".rank-user").textContent = `${record.name}`;

    rankTemplate.querySelector(".rank-score").textContent = `${record.score}`;
  } else {
    rankTemplate.querySelector("img").src = record.media;
    rankTemplate.querySelector("img").classList.add("gamePic");
    rankTemplate.querySelector(".rank-score").textContent = `${record.number}`;
    rankTemplate.querySelector(
      "a"
    ).href = `/play-game.html?id=${record.game_id}`;
  }

  rankDiv.appendChild(rankTemplate);
}

let swiper = new Swiper(".swiper-container", {
  slidesPerView: "auto",
  spaceBetween: 5,
  freeMode: true,
  scrollbar: {
    el: ".swiper-scrollbar",
    hide: true,
  },
});
