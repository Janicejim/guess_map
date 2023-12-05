let editGameId = -1;
let games = [];

export async function loadGames() {
  const res = await fetch("/allGames");
  games = await res.json();
  const gameBoardDiv = document.querySelector(".game-board");
  gameBoardDiv.innerHTML = "";
  let idx = 0;
  for (let game of games) {
    updateGameDiv(game, gameBoardDiv);
    idx++; //idx = idx + 1;
  }

  //   for (idx = 0; idx < games.length; idx++) {
  //     updateGameEvent(games[idx]);
  //   }
}

function updateGameDiv(game, gameBoardDiv) {
  gameBoardDiv.innerHTML += `
        <div class='game'>
        ${game.content}
    </div>
        `;
}

// function updateGameEvent(game) {
//   document
//     .querySelector(`#edit-${game.id}`)
//     .addEventListener("click", (event) => {
//       const id = event.target.id.split("-")[1];
//       const editForm = document.querySelector("#edit-game-form");
//       const newForm = document.querySelector("#game-form");
//       const editContent = document.querySelector("#edit-content");

//       newForm.classList.remove("show");
//       newForm.classList.add("hide");

//       editForm.classList.remove("hide");
//       editForm.classList.add("show");
//       editContent.value = games.filter((game) => game.id == id)[0].content;
//       editGameId = id;
//     });

//   document
//     .querySelector(`#del-${game.id}`)
//     .addEventListener("click", async (event) => {
//       const id = event.target.id.split("-")[1];
//       const res = fetch(`/game/${id}`, {
//         method: "Delete",
//       });
//       await loadGames();
//     });
//   document
//     .querySelector(`#like-${game.id}`)
//     .addEventListener("click", async (event) => {
//       const id = event.target.id.split("-")[1];
//       const res = fetch(`/like/game/${id}`, {
//         method: "POST",
//       });
//       // await loadGames();
//     });
// }
