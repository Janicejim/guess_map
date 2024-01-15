//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

//get err
const err = new URL(window.location.href).searchParams.get("err");
if (err) {
  alert(err);
}

window.onload = () => {
  loadAllGames();
};

async function loadAllGames() {
  const res = await fetch("/games");
  let games = await res.json();
  const gameBoardDiv = document.querySelector(".all-game-board");

  gameBoardDiv.innerHTML = "";

  for (let game of games) {
    createEachGameDiv(game, gameBoardDiv);
  }
}

function createEachGameDiv(game, gameBoardDiv) {
  const gameTemplate = document
    .querySelector("template")
    .content.cloneNode(true);
  if (game.profile_image == null) {
    game.profile_image = `anonymous.jpg`;
  }

  let gameMediaDiv = gameTemplate.querySelector(".game_container");
  console.log(gameMediaDiv);
  gameMediaDiv.src = `/${game.media}`;
  let userProfilePigDiv = gameTemplate.querySelector(".profile_picture");
  console.log(userProfilePigDiv);
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
    if (targetElement.classList.contains(`clicked-icon-${preference}`)) {
      numberElm.textContent = +numberElm.textContent - 1;
    } else {
      numberElm.textContent = +numberElm.textContent + 1;
    }
    targetElement.classList.toggle(`clicked-icon-${preference}`);
  });
}

function loginGuard(targetElement) {
  targetElement.addEventListener("click", () => {
    alert("login first");
  });
}
