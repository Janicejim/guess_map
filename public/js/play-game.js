//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

const params = new URLSearchParams(location.search);
const id = params.get("id");

// ---------   basic socket config in js   ---------- //
const socket = io.connect();

window.onload = () => {
  loadSingleGame(id);
};

async function loadSingleGame(id) {
  const res = await fetch(`/game?id=${id}`);
  const gameInfo = await res.json();
  if (gameInfo == "login first") {
    window.location = "/login.html";
    return;
  }

  if (gameInfo.status == "inactive") {
    alert("遊戲已下架");
    return;
  }

  const playGameBoardDiv = document.querySelector("#gameInfo-container");
  playGameBoardDiv.innerHTML = ``;

  createDifferentGameStatusElm(gameInfo.status, playGameBoardDiv, gameInfo);
  initMap();
}

function createDifferentGameStatusElm(status, appendElm, gameInfo) {
  const node =
    status == "creator"
      ? document.querySelector(`#completed-template`).content.cloneNode(true)
      : document.querySelector(`#${status}-template`).content.cloneNode(true);
  node.querySelector(".question-media").src = gameInfo.data[0].media;
  if (status == "new") {
    node.querySelector("#store_amount").textContent =
      gameInfo.data[0].store_amount;
    node.querySelector("#join-game-btn").addEventListener("click", async () => {
      let res = await fetch(`/game/join/${gameInfo.data[0].id}`, {
        method: "POST",
      });
      let result = await res.json();
      if (result.err) {
        alert("系統故障，等陣先再入嚟la");
      } else if (!result.success) {
        alert(result.msg);
      } else if (result.success) {
        loadSingleGame(id);
      }
    });
  } else if (status == "joined") {
    node.querySelector("#store_amount").textContent =
      gameInfo.data[0].store_amount;
    node.querySelector("#attempts").textContent = gameInfo.attempts;
    node.querySelector("#hints_1").textContent = gameInfo.data[0].hints_1;
    node.querySelector("#hints_2").textContent = gameInfo.data[0].hints_2;
    if (gameInfo.attempts == 2) {
      node.querySelector(".hints_1_container").toggleAttribute("hidden");
    } else if (gameInfo.attempts == 1 || gameInfo.attempts == 0) {
      node.querySelector(".hints_1_container").toggleAttribute("hidden");
      node.querySelector(".hints_2_container").toggleAttribute("hidden");
    }
    node
      .querySelector("#current-answer")
      .addEventListener("click", async () => {
        submitAnswer(currentLocationMarker, true);
      });
    node.querySelector("#map-answer").addEventListener("click", () => {
      submitAnswer(marker, false);
    });
  } else if (status == "completed" || status == "creator") {
    if (status == "creator") {
      document.querySelector("#chatroom-container").toggleAttribute("hidden");
    }
    node.querySelector("#winner").textContent = gameInfo.data[0].winner;
    node.querySelector("#address").textContent =
      gameInfo.data[0].answer_address;
    node.querySelector("#answer").textContent = gameInfo.data[0].answer_name;
    node.querySelector("#description").textContent =
      gameInfo.data[0].answer_description;
  }

  appendElm.appendChild(node);
}

async function submitAnswer(marker, isUsePlayerLocation) {
  let location = getLocationByMarker(marker);
  if (!location && isUsePlayerLocation == true) {
    alert("請確保已開啟位置分享，以及上方地圖出現人形標示再提交");
    return;
  }
  if (!location && isUsePlayerLocation == false) {
    alert("請確保已在上方地圖選取位置，出現圖釘標示再提交");
    return;
  }
  location["isUsePlayerLocation"] = isUsePlayerLocation;
  let res = await fetch(`/game/play/${id}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(location),
  });
  let result = await res.json();
  alert(result.msg || result.err);
  if (result.success !== undefined) {
    loadSingleGame();
  } else {
    let attemptElm = document.querySelector("#attempts");
    let perviousAttempt = +attemptElm.textContent;
    perviousAttempt != 0
      ? (attemptElm.textContent = perviousAttempt -= 1)
      : (attemptElm.textContent = 0);
    console.log(
      "attemptElm.textContent:",
      perviousAttempt,
      attemptElm.textContent
    );
    let hints_1Elm = document.querySelector(".hints_1_container");
    let hints_2Elm = document.querySelector(".hints_2_container");
    if (attemptElm.textContent == 2) {
      hints_1Elm.toggleAttribute("hidden");
    } else if (attemptElm.textContent == 1 || attemptElm.textContent == 0) {
      hints_1Elm.hidden = false;
      hints_2Elm.hidden = false;
    }
  }
}

// ---------  Chat Room JS  --------------------------------------------------------------------------------------//

// >>>>>> Join Room <<<<<<< //

socket.emit("join-room", id);

// >>>>>> Leave Room <<<<<< //
// socket.emit("leave-room",id)

//  >>>>> Room setup <<<<< //
let input = document.querySelector("#chat-input");
let messages = document.querySelector("#messages");
let chatroom = document.querySelector("#chatroom-container");

// >>>>>>> submit message 上 server
document
  .querySelector("#chat-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    if (input.value) {
      socket.emit("chat message", input.value);
      input.value = "";
    }
  });
// >>>>>>> socket.on => get the message broadcasted from server = (msg)

socket.emit("userName", async (name) => {
  const res = await fetch("/user");
  const result = await res.json();
  name = result.user.name;
});

//room-Update

//message-Update
socket.on("chat message", async function (img, msg) {
  let msgContainer = document.createElement("div");
  let getImg = document.createElement("img");
  let item = document.createElement("div");
  if (img != null) {
    getImg.src = img;
  } else {
    getImg.src = "anonymous.jpg";
  }
  item.textContent = msg;
  msgContainer.classList.add("msgContainer");

  msgContainer.appendChild(getImg);
  msgContainer.appendChild(item);

  messages.appendChild(msgContainer);

  //scroll to button
  messages.scrollTop = messages.scrollHeight;
});

//---------------------------------------------------------------------------google map-------------------------------------

let marker;
let currentLocationMarker;
let currentLocation;
let map;

function placeMarker(location) {
  if (marker) {
    //if marker already was created change position
    marker.setPosition(location);
  } else {
    //create a marker
    marker = new google.maps.Marker({
      position: location,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      icon: "/push_pin_black_24dp.svg",
    });
    marker.addListener("click", toggleBounce);
  }
}

function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

//will auto call by google script
function initMap() {
  myLatLng = new google.maps.LatLng(22.28780558413936, 114.14833128874676);
  // Create a new StyledMapType object, passing it an array of styles,
  // and the name to be displayed on the map type control.
  // const styledMapType = new google.maps.StyledMapType(
  //   [
  //     {
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#f5f5f5",
  //         },
  //       ],
  //     },
  //     {
  //       elementType: "labels.icon",
  //       stylers: [
  //         {
  //           visibility: "off",
  //         },
  //       ],
  //     },
  //     {
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#616161",
  //         },
  //       ],
  //     },
  //     {
  //       elementType: "labels.text.stroke",
  //       stylers: [
  //         {
  //           color: "#f5f5f5",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "administrative.land_parcel",
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#bdbdbd",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "poi",
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#eeeeee",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "poi",
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#757575",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "poi.park",
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#e5e5e5",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "poi.park",
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#9e9e9e",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "road",
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#ffffff",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "road.arterial",
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#757575",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "road.highway",
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#dadada",
  //         },
  //         {
  //           visibility: "off",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "road.highway",
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#616161",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "road.local",
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#9e9e9e",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "transit.line",
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#e5e5e5",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "transit.station",
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#eeeeee",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "water",
  //       elementType: "geometry",
  //       stylers: [
  //         {
  //           color: "#ffde03",
  //         },
  //       ],
  //     },
  //     {
  //       featureType: "water",
  //       elementType: "labels.text.fill",
  //       stylers: [
  //         {
  //           color: "#9e9e9e",
  //         },
  //       ],
  //     },
  //   ],
  //   { name: "Styled Map" }
  // );

  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  let mapElm = document.getElementById("map") || 0;
  if (!mapElm) {
    return;
  }

  map = new google.maps.Map(mapElm, {
    center: myLatLng,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    // mapTypeControlOptions: {
    //   mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain", "styled_map"],
    // },
  });
  //Associate the styled map with the MapTypeId and set it to display.
  // map.mapTypes.set("styled_map", styledMapType);
  // map.setMapTypeId("styled_map");
  navigator.geolocation.getCurrentPosition(setCurrentPositionMarker);

  google.maps.event.addListener(map, "click", function (mapsMouseEvent) {
    guessLatLng = new google.maps.LatLng(
      mapsMouseEvent.latLng.lat(),
      mapsMouseEvent.latLng.lng()
    );
    placeMarker(mapsMouseEvent.latLng);

    // To add the marker to the map, call setMap();
    console.log({ marker });
    marker.setMap(map);

    // distance = checkDistance();
    // console.log(`You are ${distance} m away from the destination!`);
  });
}

// // Check distance from original location
// function checkDistance() {
//   var lat1 = marker.position.lat();
//   var lng1 = marker.position.lng();
//   var lat2 = playGame.targeted_location.x;
//   var lng2 = playGame.targeted_location.y;

//   var R = 6371; // Radius of the earth in km
//   var dLat = deg2rad(lat2 - lat1); // deg2rad below
//   var dLng = deg2rad(lng2 - lng1);
//   var a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(deg2rad(lat1)) *
//       Math.cos(deg2rad(lat2)) *
//       Math.sin(dLng / 2) *
//       Math.sin(dLng / 2);
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   var distance = R * c; // Distance in km
//   return Math.floor(distance * 1000);
// }
// function deg2rad(deg) {
//   return deg * (Math.PI / 180);
// }

function getLocationByMarker(marker) {
  // return `${marker.position.lat()}, ${marker.position.lng()}`;
  return {
    targeted_location_x: marker.position.lat(),
    targeted_location_y: marker.position.lng(),
  };
}

function setCurrentPositionMarker(position) {
  const { latitude, longitude } = position.coords;
  currentLocation = new google.maps.LatLng(latitude, longitude);

  currentLocationMarker = new google.maps.Marker({
    position: currentLocation,
    map: map,
    draggable: false,
    icon: {
      url: "/user.png",
      scaledSize: new google.maps.Size(40, 40),
    },
  });
  currentLocationMarker.setMap(map);
}
