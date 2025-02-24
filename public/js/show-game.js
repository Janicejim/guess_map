let games = [];

export async function loadGames() {
  const res = await fetch("/allGames");
  games = await res.json();
  const gameBoardDiv = document.querySelector(".game-board");
  gameBoardDiv.innerHTML = "";
  let idx = 0;
  for (let game of games) {
    updateGameDiv(game, gameBoardDiv);
    idx++; 
  }
}

function updateGameDiv(game, gameBoardDiv) {
  gameBoardDiv.innerHTML += `
        <div class='game'>
        ${game.content}
    </div>
        `;
}
