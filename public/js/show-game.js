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
