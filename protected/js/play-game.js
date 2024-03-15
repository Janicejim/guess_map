//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

const params = new URLSearchParams(location.search);
const id = params.get("id");

// ---------   basic socket config in js   ---------- //
socket = io.connect();
let isChecked;
window.onload = () => {
  checkCheckedInOrNot(id);
  loadSingleGame(id);
};

socket.on("update room store", () => {
  loadSingleGame(id);
});
socket.on("update room status", () => {
  loadSingleGame(id);
});
let gameStatus;
let answerLocation;
let answerMarker;
let checkInId;

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
    gameStatus = "new";
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
    gameStatus = "joined";
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
      gameStatus = "creator";
      document.querySelector("#chatroom-container").toggleAttribute("hidden");
    } else {
      gameStatus = "completed";
      answerLocation = gameInfo.data[0].target_location;
    }

    // console.log({ isChecked });
    if (!isChecked) {
      node.querySelector("#completed-map-container").removeAttribute("hidden");
      node.querySelector("#check-in-button").removeAttribute("hidden");
      node
        .querySelector("#check-in-button")
        .addEventListener("click", async () => {
          let location = getLocationByMarker(currentLocationMarker);
          if (!location) {
            alert("請等待地圖出現人形圖案再提交");
            return;
          }
          let result = await checkIn(location, gameInfo.data[0].id);

          if (result.success) {
            checkInId = result.recordId;

            Swal.fire({
              title: "打卡成功",
              text: "留下更多足跡吧！",
              html: `<div  >
              <div>留言：   <input type="text" id="check-in-message"></input></div>
              <div>合照：<input type="file" id="file"></input></div>
              <button  onClick="submitCheckInData()">提交</button>
              <button   onClick="closeSweetAlert()">取消</button>
            </div>`,
              icon: "success",
              showConfirmButton: false,
              showCancelButton: false,
              allowOutsideClick: true,
            });
            document
              .querySelector("#completed-map-container")
              .toggleAttribute("hidden");
            document
              .querySelector("#check-in-button")
              .toggleAttribute("hidden");
          } else {
            Swal.fire({
              title: "提交失敗",
              text: result.msg,
              icon: "error",
              confirmButtonText: "關閉",
            });
          }
        });
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
  if (!location && isUsePlayerLocation) {
    alert("請確保已開啟位置分享，以及上方地圖出現人形標示再提交");
    return;
  }
  if (!location && !isUsePlayerLocation) {
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
    loadSingleGame(id);
  } else if (result.success == undefined && result.reduceAttempts) {
    let attemptElm = document.querySelector("#attempts");
    let perviousAttempt = +attemptElm.textContent;
    perviousAttempt != 0
      ? (attemptElm.textContent = perviousAttempt -= 1)
      : (attemptElm.textContent = 0);

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
  // myLatLng = new google.maps.LatLng(22.28780558413936, 114.14833128874676);
  myLatLng = new google.maps.LatLng(22.283047923532244, 114.15359294197071);
  let mapElm = document.getElementById("map") || 0;
  if (!mapElm) {
    return;
  }

  map = new google.maps.Map(mapElm, {
    center: myLatLng,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
  });

  navigator.geolocation.getCurrentPosition(setCurrentPositionMarker);

  if (gameStatus == "completed") {
    answerLocation = new google.maps.LatLng(answerLocation.x, answerLocation.y);

    answerMarker = new google.maps.Marker({
      position: answerLocation,
      map: map,
      draggable: false,
      icon: {
        url: "/push_pin_black_24dp.svg",
        scaledSize: new google.maps.Size(40, 40),
      },
    });
    answerMarker.setMap(map);
  }

  google.maps.event.addListener(map, "click", function (mapsMouseEvent) {
    if (gameStatus == "joined") {
      guessLatLng = new google.maps.LatLng(
        mapsMouseEvent.latLng.lat(),
        mapsMouseEvent.latLng.lng()
      );
      placeMarker(mapsMouseEvent.latLng);

      marker.setMap(map);
    }
  });
}

function getLocationByMarker(marker) {
  if (marker == undefined) {
    return;
  }

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

//------------------------------check in----------------
async function checkIn(location, gameId) {
  let res = await fetch(`/check-in?gameId=${gameId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(location),
  });
  let result = await res.json();
  return result;
}

async function checkCheckedInOrNot(gameId) {
  let res = await fetch(`/check-in/game?gameId=${gameId}`);
  let result = await res.json();
  isChecked = result.checked;
  // console.log("after fetch:", { isChecked });
}
//-----------------------gallery-----------------
let swiper = new Swiper(".mySwiper", {
  spaceBetween: 10,
  slidesPerView: 4,
  freeMode: true,
  watchSlidesProgress: true,
});
let swiper2 = new Swiper(".mySwiper2", {
  spaceBetween: 10,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  thumbs: {
    swiper: swiper,
  },
});

async function submitCheckInData() {
  let formData = new FormData();
  formData.append("message", document.querySelector("#check-in-message").value);
  formData.append("image", document.querySelector("#file").files[0]);

  let res = await fetch(`/check-in?id=${checkInId}`, {
    method: "PATCH",
    body: formData,
  });
  let result = await res.json();
  Swal.close();
  Swal.fire({
    title: "上傳成功",
    icon: "success",
    showConfirmButton: false,
    showCancelButton: true,
    confirmButtonText: "關閉",
  });
}

function closeSweetAlert() {
  Swal.close();
}
