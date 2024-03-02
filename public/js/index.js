//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
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
  let res = await fetch(`/award?limited=5`);
  let awards = await res.json();
  let awardArea = document.querySelector(".award-container");
  for (let award of awards) {
    createAwardDiv(award, awardArea);
  }
}

getAward();

function createAwardDiv(award, awardArea) {
  let element = document.createElement("img");
  element.classList.add("award-image");
  element.src = `/${award.image}`;
  element.alt = "";
  awardArea.appendChild(element);
}
//load game
async function loadGames() {
  const res = await fetch("/games?limit=true");
  let games = await res.json();
  let newGamesDiv = document.querySelector("#new-game");
  newGamesDiv.innerHTML = ``;
  if (games.length == 0) {
    return;
  }
  for (let game of games) {
    createEachGameDiv(game, newGamesDiv);
  }

  if ("preferences" in games[0]) {
    let inProgressDiv = document.querySelector("#in-progress");
    inProgressDiv.classList.remove("hidden");
    let processRes = await fetch("/game/record/in_progress?limit=true");
    let progressGames = await processRes.json();
    let progressGameDiv = document.querySelector("#progress-game-container");
    if (progressGames.length < 1) {
      progressGameDiv.innerHTML = `<div>未有進行中的記錄</div>`;
    }
    progressGameDiv.innerHTML = ``;
    for (let progressGame of progressGames) {
      createEachGameDiv(progressGame, progressGameDiv);
    }
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
  let likeNumberElm = gameTemplate.querySelector(".like_number");
  likeNumberElm.textContent = game.like_number;
  let dislikeNumberElm = gameTemplate.querySelector(".dislike_number");
  dislikeNumberElm.textContent = game.dislike_number;
  gameTemplate.querySelector(".fa-piggy-bank").textContent = game.store_amount;
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
    //   if (targetElement.classList.contains(`clicked-icon-${preference}`)) {
    //     numberElm.textContent = +numberElm.textContent - 1;
    //   } else {
    //     numberElm.textContent = +numberElm.textContent + 1;
    //   }
    //   targetElement.classList.toggle(`clicked-icon-${preference}`);
  });
}

function loginGuard(targetElement) {
  targetElement.addEventListener("click", () => {
    alert("請先登入");
  });
}

let swiper = new Swiper(".mySwiper", {
  effect: "cards",
  grabCursor: true,
});
