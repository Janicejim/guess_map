//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
  $("#footer").load("/footer.html");
});
socket = io.connect();
socket.on("update reaction", () => {
  loadGames();
});
socket.on("update game store", () => {
  console.log("update game store");
  loadGames();
});
socket.on("update game status", () => {
  console.log("update game status");
  loadGames();
});

async function getAward() {
  let res = await fetch(`/award?sorting=score desc &limited=4`);
  let result = await res.json();
  let awardArea = document.querySelector("#award-area");

  if (result.success) {
    let awards = result.data;

    for (let award of awards) {
      createAwardDiv(award, awardArea);
    }
  } else {
    Swal.fire("", result.msg, result.success ? "success" : "error");
  }
}

getAward();

function createAwardDiv(award, awardArea) {
  const awardTemplate = document
    .querySelector("#award-template")
    .content.cloneNode(true);
  let element = awardTemplate.querySelector(".award-image");
  element.src = `/${award.image}`;
  awardArea.appendChild(awardTemplate);
}
//load game
async function loadGames() {
  //new game
  const res = await fetch("/games?limit=12");
  let result = await res.json();
  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  let games = result.data;
  let newGamesDiv = document.querySelector("#new-game");
  newGamesDiv.innerHTML = ``;
  if (games.length == 0) {
    return;
  }
  for (let game of games) {
    createEachGameDiv(game, newGamesDiv);
  }
  //in progress
  if ("preferences" in games[0]) {
    let inProgressDiv = document.querySelector("#in-progress");
    inProgressDiv.classList.remove("hidden");
    let res = await fetch("/game/record/in_progress?limit=true");
    let result = await res.json();
    if (!result.success) {
      Swal.fire("", result.msg, result.success ? "success" : "error");
      return;
    }
    let progressGames = result.data;
    let progressGameDiv = document.querySelector(
      ".in-progress-swiper .swiper-wrapper"
    );
    if (progressGames.length < 1) {
      progressGameDiv.innerHTML = `<div class="no-record-container"><div class="no-record-elm"><div>未有進行中的記錄</div><a href="/game.html?type=new"><button class="btn btn-warning">按此參加遊戲！</button></a></div></div>`;
    } else {
      progressGameDiv.innerHTML = ``;
      for (let progressGame of progressGames) {
        createEachGameDiv(progressGame, progressGameDiv);
      }
    }
  } else {
    document
      .querySelector("#check-in")
      .classList.remove("col-md-6", "col-sm-12");
  }
}
loadGames();

function createEachGameDiv(game, gameBoardDiv) {
  const gameTemplate = document
    .querySelector("#game-template")
    .content.cloneNode(true);
  if (game.profile_image == null) {
    game.profile_image = `anonymous.jpg`;
  }

  let gameMediaDiv = gameTemplate.querySelector(".game_container");

  gameMediaDiv.src = `/${game.media}`;
  let userProfilePigDiv = gameTemplate.querySelector(".profile_picture");
  userProfilePigDiv.src = `/${game.profile_image}`;
  gameTemplate.querySelector(
    ".profile_href"
  ).href = `/profile.html?id=${game.user_id}`;
  gameTemplate.querySelector(".username").textContent = game.name;
  let likeNumberElm = gameTemplate.querySelector(".like_number");
  likeNumberElm.textContent = game.like_number;
  let dislikeNumberElm = gameTemplate.querySelector(".dislike_number");
  dislikeNumberElm.textContent = game.dislike_number;
  gameTemplate.querySelector(".fa-piggy-bank span").textContent =
    game.store_amount;
  let likeIcon = gameTemplate.querySelector(".fa-thumbs-up");
  let dislikeIcon = gameTemplate.querySelector(".fa-thumbs-down");
  if ("preferences" in game) {
    gameTemplate.querySelector("a").href = `/play-game.html?id=${game.id}`;

    if (game.preferences == "like") {
      likeIcon.classList.toggle(`clicked-icon-like`);
    } else if (game.preferences == "dislike") {
      dislikeIcon.classList.toggle(`clicked-icon-dislike`);
    }
    clickPreferenceEvent(
      game.id,
      likeIcon,
      "like",
      dislikeIcon,
      "dislike",
      likeNumberElm
    );
    clickPreferenceEvent(
      game.id,
      dislikeIcon,
      "dislike",
      likeIcon,
      "like",
      dislikeNumberElm
    );
  } else {
    gameTemplate.querySelector("a").href = `/login.html`;
    loginGuard(likeIcon);
    loginGuard(dislikeIcon);
  }

  gameBoardDiv.appendChild(gameTemplate);
}

function clickPreferenceEvent(
  gameId,
  targetElement,
  preference,
  oppositeElement,
  oppositePreference,
  numberElm
) {
  targetElement.addEventListener("click", async () => {
    await fetch(
      `/game/like-dislike?preferences=${preference}&gameId=${gameId}`,
      { method: "POST" }
    );

    if (
      oppositeElement.classList.contains(`clicked-icon-${oppositePreference}`)
    ) {
      return;
    }
  });
}
//new game swiper:
let gameSwiper = new Swiper(".game-swiper", {
  slidesPerView: 2,
  spaceBetween: 30,
});

function loginGuard(targetElement) {
  targetElement.addEventListener("click", () => {
    Swal.fire({
      title: "請登入先",
      icon: "error",
      showConfirmButton: false,
      showCancelButton: true,
      confirmButtonText: "關閉",
    });
  });
}

//rank:

async function loadRank() {
  const res = await fetch(`/rank?period=all&type=score`);
  let result = await res.json();
  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  let records = result.data;
  const rankDiv = document.querySelector("table");
  let i = 0;
  for (let record of records) {
    i++;
    updateRankDiv(record, rankDiv, i);
  }
}
function updateRankDiv(record, rankDiv, number) {
  let rankTemplate = document
    .querySelector("#ranking-template")
    .content.cloneNode(true);

  rankTemplate.querySelector(".rank-number").textContent = number;

  rankTemplate.querySelector("img").src = record.profile_image
    ? `/${record.profile_image}`
    : "/anonymous.jpg";
  rankTemplate.querySelector(".rank-user").textContent = `${record.name}`;
  rankTemplate.querySelector(".rank-score").textContent = `${record.score}`;
  rankTemplate.querySelector("a").href = `/profile.html?id=${record.user_id}`;
  rankDiv.appendChild(rankTemplate);
}
loadRank();

async function loadCompletedGameForCheckIn() {
  let res = await fetch("/game/completed?limit=10");
  let result = await res.json();
  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  let games = result.data;
  let checkInDiv = document.querySelector(".checkInSwiper .swiper-wrapper");
  checkInDiv.innerHTML = ``;
  for (let game of games) {
    createCheckInElm(checkInDiv, game);
  }
  //load completed game for check in, need to append the game first:
  let checkInSwiper = new Swiper(".checkInSwiper", {
    effect: "cards",
    grabCursor: true,
  });
}

function createCheckInElm(mainDiv, game) {
  let checkInTemplate = document
    .querySelector("#check-in-template")
    .content.cloneNode(true);
  checkInTemplate.querySelector("a").href = `/play-game.html?id=${game.id}`;
  checkInTemplate.querySelector("img").src = `/${game.media}`;
  checkInTemplate.querySelector(".check-in-number").textContent =
    game.check_in_number;

  mainDiv.appendChild(checkInTemplate);
}

loadCompletedGameForCheckIn();

//in progress game swiper:
let inProgressSwiper = new Swiper(".in-progress-swiper", {
  pagination: {
    el: ".in-progress-swiper .swiper-pagination",
    clickable: true,
    renderBullet: function (index, className) {
      return '<span class="' + className + '">' + (index + 1) + "</span>";
    },
  },
});
