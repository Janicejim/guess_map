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
//google map
// function initMap() {
//   myLatLng = new google.maps.LatLng(22.28780558413936, 114.14833128874676);

//   let mapElm = document.getElementById("map") || 0;
//   if (!mapElm) {
//     return;
//   }
//   const styledMapType = new google.maps.StyledMapType(
//     [
//       {
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#f5f5f5",
//           },
//         ],
//       },
//       {
//         elementType: "labels.icon",
//         stylers: [
//           {
//             visibility: "off",
//           },
//         ],
//       },
//       {
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#616161",
//           },
//         ],
//       },
//       {
//         elementType: "labels.text.stroke",
//         stylers: [
//           {
//             color: "#f5f5f5",
//           },
//         ],
//       },
//       {
//         featureType: "administrative.land_parcel",
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#bdbdbd",
//           },
//         ],
//       },
//       {
//         featureType: "poi",
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#eeeeee",
//           },
//         ],
//       },
//       {
//         featureType: "poi",
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#757575",
//           },
//         ],
//       },
//       {
//         featureType: "poi.park",
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#e5e5e5",
//           },
//         ],
//       },
//       {
//         featureType: "poi.park",
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#9e9e9e",
//           },
//         ],
//       },
//       {
//         featureType: "road",
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#ffffff",
//           },
//         ],
//       },
//       {
//         featureType: "road.arterial",
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#757575",
//           },
//         ],
//       },
//       {
//         featureType: "road.highway",
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#dadada",
//           },
//           {
//             visibility: "off",
//           },
//         ],
//       },
//       {
//         featureType: "road.highway",
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#616161",
//           },
//         ],
//       },
//       {
//         featureType: "road.local",
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#9e9e9e",
//           },
//         ],
//       },
//       {
//         featureType: "transit.line",
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#e5e5e5",
//           },
//         ],
//       },
//       {
//         featureType: "transit.station",
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#eeeeee",
//           },
//         ],
//       },
//       {
//         featureType: "water",
//         elementType: "geometry",
//         stylers: [
//           {
//             color: "#ffde03",
//           },
//         ],
//       },
//       {
//         featureType: "water",
//         elementType: "labels.text.fill",
//         stylers: [
//           {
//             color: "#9e9e9e",
//           },
//         ],
//       },
//     ],
//     { name: "Styled Map" }
//   );
//   map = new google.maps.Map(mapElm, {
//     center: myLatLng,
//     zoom: 12,
//     mapTypeControl: false,
//     streetViewControl: false,
//   });

// map.mapTypes.set("styled_map", styledMapType);
// map.setMapTypeId("styled_map");

// navigator.geolocation.getCurrentPosition(setCurrentPositionMarker);

// google.maps.event.addListener(map, "click", function (mapsMouseEvent) {
//   guessLatLng = new google.maps.LatLng(
//     mapsMouseEvent.latLng.lat(),
//     mapsMouseEvent.latLng.lng()
//   );
//   placeMarker(mapsMouseEvent.latLng);

//   // To add the marker to the map, call setMap():
//   console.log({ marker });
//   marker.setMap(map);
// });
//}

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
