//load navbar
$(function () {
  $("#navbar").load("/navigation/navigation.html");
});
//get err
const err = new URL(window.location.href).searchParams.get("err");
if (err) {
  alert(err);
}
//* socket io config
const socket = io.connect();

let games = [];

window.onload = () => {
  loadAllGames();
};

async function loadAllGames() {
  const res = await fetch("/games");
  games = await res.json();
  const gameBoardDiv = document.querySelector(".all-game-board");
  gameBoardDiv.innerHTML = "";
  // let idx = 0;
  for (let game of games) {
    // console.log(game);
    updateGameDiv(game, gameBoardDiv);
    // console.log('game', game);
    // idx++; //idx = idx + 1;
  }
  for (let idx = 0; idx < games.length; idx++) {
    updateGameEvent(games[idx]);
  }
  // link to profile
  // getUserDisliked();
  // getUserLiked();
  // getCompletedGame();

  setTimeout(function () {
    $(".game-status").addClass("loaded");
  }, 500);
}

function updateGameDiv(game, gameBoardDiv) {
  // <a href="/play-game.html?id=${game.id}" style='text-decoration: none' class="col-2 col-xl-4 col-sm-12 game-board" id="play-${game.id}">
  // <a href="/play-game.html?id=${game.id}"><img src="${game.media}" alt="game_media" class="game_container img-fluid" >
  gameBoardDiv.innerHTML += `
  <div class="col-2 col-xl-4 col-sm-12 game-board" id="play-${game.id}">
  <a href="/play-game.html?id=${game.id}"><img src="${game.media}" alt="game_media" class="game_container img-fluid" /></a>
  <div class="game_info">
  <div class="game-status">
  <div data-foo="新遊戲" id="game-status-id-${game.id}"class="game-status-str" ></div>
  </div>
  <div class="user_info">
  <img src="${game.profile_image}" alt="profile_image" class="profile_picture  uID-${game.user_id}" />
  <div class="user_name uID-${game.user_id}" >${game.name}</div>
  </div>
  <div class="reaction-icon">
  <div class="reaction "><i id="like-${game.id}" class="far fa-thumbs-up like-tag"><span class="reaction_number">${game.total_likes}</span></i></div>
  <div class="reaction "><i id="dislike-${game.id}"class="far fa-thumbs-down dislike-tag"><span class="reaction_number">${game.total_dislikes}</span></i></div>
    </div>
  </div> 
  </div>
  `;

  //
  const proPics = document.querySelectorAll(".profile_picture");
  const userNames = document.querySelectorAll(".user_name");
  for (let i = 0; i < proPics.length; i++) {
    if (proPics[i]) {
      proPics[i].addEventListener("click", async (event) => {
        event.preventDefault();
        const id = event.target.classList[1].split("-")[1];
        window.location.href = `/profile_preview/?id=${id}`;
      });
    }
  }
  for (let j = 0; j < userNames.length; j++) {
    if (userNames[j]) {
      userNames[j].addEventListener("click", async (event) => {
        event.preventDefault();
        const id = event.target.classList[1].split("-")[1];
        window.location.href = `/profile_preview/?id=${id}`;
      });
    }
  }
  // link to profile
}

function updateGameEvent(game) {
  //like click event
  document
    .querySelector(`#like-${game.id}`)
    .addEventListener("click", async (event) => {
      const id = event.target.id.split("-")[1];
      const res = await fetch(`/game/like/${id}`, {
        method: "POST",
      });
      // console.log("clicked")
    });

  //dislike click event
  document
    .querySelector(`#dislike-${game.id}`)
    .addEventListener("click", async (event) => {
      const id = event.target.id.split("-")[1];
      const res = await fetch(`/game/dislike/${id}`, {
        method: "POST",
      });
      //  console.log("clicked")
    });
}

//get user like record
async function getUserLiked() {
  const res = await fetch("/game/like");
  const likeRecords = await res.json();

  // for (let likeRecord of likeRecords) {
  //   console.log(likeRecord);
  //   let likeDiv = document.querySelector(`#like-${likeRecord.game_id}`);
  //   // console.log(likeDiv)
  //   console.log(likeRecord.game_id);
  //   // if (likeRecord.user_id) {
  //   //   likeDiv.classList.add("clicked-icon-like");
  //   // }
  // }

  // let likeArray = [];
  for (let likeRecord of likeRecords) {
    // likeArray.push(likeRecord.game_id);
    // if (likeArray.includes(likeRecord.game_id)) {
    document
      .querySelector(`#like-${likeRecord.game_id}`)
      .classList.add("clicked-icon-like");
    // }
  }
  // console.log(likeArray)
}
//get user like record
async function getUserDisliked() {
  const res = await fetch("/game/dislike");
  const dislikeRecords = await res.json();
  for (let dislikeRecord of dislikeRecords) {
    let dislikeDiv = document.querySelector(
      `#dislike-${dislikeRecord.game_id}`
    );
    if (dislikeRecord.user_id) {
      dislikeDiv.classList.add("clicked-icon-dislike");
    }
  }
}

async function getCompletedGame() {
  const res = await fetch("/game/completed");
  const results = await res.json();
  let closedGame = [];
  for (let result of results) {
    closedGame.push(result.game_id);

    if (closedGame.includes(result.game_id)) {
      document.querySelector(`#play-${result.game_id}`).classList.add("hide");
    }
  }
}

socket.on("updateGame", async () => {
  // console.log("socket detect");
  await loadAllGames();
});

socket.on("updateGame", async () => {
  // console.log("socket detect");
  await loadAllGames();
});

// stamp

// setTimeout(function(){
//   $('.game-status').addClass('loaded')
// },500)
