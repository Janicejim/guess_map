//load navbar
$(function () {
  $("#navbar").load("/navigation/navigation.html");
});

// let playGame;
// let attempt = 1;
// let closedGame = [];
const params = new URLSearchParams(location.search);
const id = params.get("id");
const err = new URL(window.location.href).searchParams.get("err");
if (err) {
  alert(err);
}

// ---------   basic socket config in js   ---------- //
const socket = io.connect();

window.onload = () => {
  loadSingleGame(id);
  checkGameAttempt();
};

//fetch("/game/?id=xxxx")
async function loadSingleGame(id) {
  const res = await fetch(`/game/?id=${id}`);
  const playGames = await res.json();
  let playGame = playGames[0];
  // console.log(playGame);
  const playGameBoardDiv = document.querySelector(".play-game-board");
  const chatRoomDiv = document.querySelector("#chatroom-container");
  // <div class="col-md-8"></div>
  playGameBoardDiv.innerHTML = `
  <img src="${playGame.media}" alt="game_media" class="question-media game_container img-fluid" />

  

  <div class="row">
  
  <div id="game-hints-chance-cont" class="col-6 col-md-4">
  <div class="user-hints hints_1 final_text"></div> 
  <div class="user-hints hints_2 final_text"></div> 
          
             
             <br>
             <div class="guess-chance final_text">機會: 3</div>
            <button type="submit" class="btn-warning answer-submit submitId-${id}">提交</button>

          </div>
       </div>
    </form> 
  `;

  // getCompletedGame()
  chatRoomDiv.innerHTML = `
  <ul id="messages"></ul>
  <form id="chat-form" action ="">
      <input id="chat-input" autocomplete="off"  /><button>Send</button>
  </form>`;
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
    getImg.src = "anonymous.png";
  }
  item.textContent = msg;
  msgContainer.classList.add("msgContainer");

  // console.log("getImg.src", getImg);
  // console.log("item", item);

  msgContainer.appendChild(getImg);
  msgContainer.appendChild(item);

  messages.appendChild(msgContainer);

  //scroll to button
  messages.scrollTop = messages.scrollHeight;
});

document
  .querySelector("#play-game-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    let body;

    if (distance < 500 && attempt < 3) {
      body = {
        attempts: attempt,
        targeted_location: getMarkerLocation(),
        completion: true,
        score_completion: 100,
      };
      socket.emit("chat win message");
      alert("叻叻豬，你估中左，加你100分！");
      window.location = "/";
    } else if (distance > 500 && attempt == 1) {
      body = {
        attempts: attempt,
        targeted_location: getMarkerLocation(),
        completion: false,
        score_completion: 0,
      };

      socket.emit("chat miss message");
      alert(`唔啱喎，黎多次啦！仲爭${distance}米！`);

      let hintsDev1 = document.querySelector(".hints_1");
      hintsDev1.innerHTML = `提示 1:${playGame.hints_1}`;

      document.querySelector(".guess-chance").innerHTML = "機會:2";

      //
    } else if (distance > 500 && attempt == 2) {
      body = {
        attempts: attempt,
        targeted_location: getMarkerLocation(),
        completion: false,
        score_completion: 0,
      };

      socket.emit("chat miss message");
      alert(`你又估錯左啦，黎多次啦！仲爭${distance}米！`);

      let hintsDev2 = document.querySelector(".hints_2");
      hintsDev2.innerHTML = `提示 2:${playGame.hints_2}`;

      document.querySelector(".guess-chance").innerHTML = "機會:1";
    } else if (distance > 500 && attempt == 3) {
      body = {
        attempts: attempt,
        targeted_location: getMarkerLocation(),
        completion: true,
        score_completion: 0,
      };
      socket.emit("chat lose message");
      alert(`唔好意思，你輸左啦！正確答案同你爭${distance}米！`);
      document.querySelector(".guess-chance").innerHTML = "機會:0";
    } else {
      alert("玩夠啦.V.");
    }

    // console.log(body);
    const res = await fetch(`/game/play/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    ``;
    const result = await res.json();

    // console.log(result);
    form.reset();
    // window.location = "/";
    if (result.success) {
      // console.log("success");
      // await loadGames();
    }
    attempt += 1;
    // console.log(attempt);
  });

var marker;
let selected_location;
let currentLocation;
let currentLocationForMarker;
// Get current location

function checkGameAttempt() {
  distance = checkDistance();
  if (distance < 500 && attempt == 0) {
    // console.log("一野中");
    socket.emit("chat win message");
  } else if (distance < 500 && attempt == 1) {
    // console.log("兩野中");
  } else if (distance > 500 && attempt == 0) {
    // console.log("唔中");
  } else if (distance > 500 && attempt == 1) {
    // console.log("bye 9 bye");
  }
}

const getCurrentLocation = navigator.geolocation.watchPosition((position) => {
  const { latitude, longitude } = position.coords;
  currentLocation = position;
  // console.log(currentLocation.coords.latitude);
  // console.log(currentLocation.coords.longitude);
  // Show a map centered at latitude / longitude.
  currentLocationForMarker = new google.maps.LatLng(
    currentLocation.coords.latitude,
    currentLocation.coords.longitude
  );
});

function stopCurrentLocation() {
  // Cancel the updates when the user clicks a button.
  navigator.geolocation.clearWatch(watchId);
}

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
    document.querySelector("#reset-map").addEventListener("click", () => {
      // console.log(marker.getMap());
      marker.setMap(null);
    });
  }
}
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function initMap() {
  myLatLng = new google.maps.LatLng(22.28780558413936, 114.14833128874676);
  // Create a new StyledMapType object, passing it an array of styles,
  // and the name to be displayed on the map type control.
  const styledMapType = new google.maps.StyledMapType(
    [
      {
        elementType: "geometry",
        stylers: [
          {
            color: "#f5f5f5",
          },
        ],
      },
      {
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#616161",
          },
        ],
      },
      {
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#f5f5f5",
          },
        ],
      },
      {
        featureType: "administrative.land_parcel",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#bdbdbd",
          },
        ],
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [
          {
            color: "#eeeeee",
          },
        ],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#757575",
          },
        ],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [
          {
            color: "#e5e5e5",
          },
        ],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#9e9e9e",
          },
        ],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [
          {
            color: "#ffffff",
          },
        ],
      },
      {
        featureType: "road.arterial",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#757575",
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [
          {
            color: "#dadada",
          },
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#616161",
          },
        ],
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#9e9e9e",
          },
        ],
      },
      {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [
          {
            color: "#e5e5e5",
          },
        ],
      },
      {
        featureType: "transit.station",
        elementType: "geometry",
        stylers: [
          {
            color: "#eeeeee",
          },
        ],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          {
            color: "#ffde03",
          },
        ],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#9e9e9e",
          },
        ],
      },
    ],
    { name: "Styled Map" }
  );

  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  const map = new google.maps.Map(document.getElementById("map"), {
    center: myLatLng,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    // mapTypeControlOptions: {
    //   mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain", "styled_map"],
    // },
  });
  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set("styled_map", styledMapType);
  map.setMapTypeId("styled_map");

  google.maps.event.addListener(map, "click", function (mapsMouseEvent) {
    guessLatLng = new google.maps.LatLng(
      mapsMouseEvent.latLng.lat(),
      mapsMouseEvent.latLng.lng()
    );
    placeMarker(mapsMouseEvent.latLng);

    // To add the marker to the map, call setMap();
    marker.setMap(map);
    distance = checkDistance();
    // console.log(`You are ${distance} m away from the destination!`);
  });
}

// Check distance from original location
function checkDistance() {
  var lat1 = marker.position.lat();
  var lng1 = marker.position.lng();
  var lat2 = playGame.targeted_location.x;
  var lng2 = playGame.targeted_location.y;

  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLng = deg2rad(lng2 - lng1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c; // Distance in km
  return Math.floor(distance * 1000);
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getMarkerLocation() {
  // return `${marker.position.lat()}, ${marker.position.lng()}`;
  return { x: marker.position.lat(), y: marker.position.lng() };
}
