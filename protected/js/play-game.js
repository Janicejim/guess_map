//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
  $("#footer").load("/footer.html");
});

const params = new URLSearchParams(location.search);
const id = params.get("id");

let isChecked;
window.onload = () => {
  checkCheckedInOrNot(id);
  loadSingleGame(id);
};

let gameStatus;
let answerLocation;
let answerMarker;
let checkInId;

async function loadSingleGame(id) {
  const res = await fetch(`/game?id=${id}`);
  let result = await res.json();
  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  const gameInfo = result.data;

  const playGameBoardDiv = document.querySelector("#gameInfo-container");
  playGameBoardDiv.innerHTML = ``;

  createDifferentGameStatusElm(gameInfo.status, playGameBoardDiv, gameInfo);
  await initMap();
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
      if (!result.success) {
        Swal.fire("", result.msg, result.success ? "success" : "error");
        return;
      }
      loadSingleGame(id);
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
    } else {
      gameStatus = "completed";
    }
    answerLocation = gameInfo.data[0].target_location;
    getCheckInRecordOfGame(id);
    //--------------------check in ----------------------------
    if (!isChecked) {
      node.querySelector("#completed-map-container").removeAttribute("hidden");
      node.querySelector("#check-in-button").removeAttribute("hidden");
      node
        .querySelector("#check-in-button")
        .addEventListener("click", async () => {
          let location = getLocationByMarker(currentLocationMarker);
          if (!location) {
            Swal.fire("", "請等待地圖出現人形圖案再提交", "error");
            return;
          }
          let result = await checkIn(location, gameInfo.data[0].id);

          if (result.success) {
            checkInId = result.data;

            Swal.fire({
              title: "打卡成功",
              text: "留下更多足跡吧！",
              html: `    <div class="container">
              <div>留言： </div>
              <input type="text" id="check-in-message"></input>
              <div>合照：</div>
              <input type="file" id="file"></input>
              <div>
                <button class="submit-btn"  onClick="submitCheckInData()">提交</button>
                <button   class="cancel-btn" onClick="closeSweetAlert()">取消</button>
              </div>
        
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

            getCheckInRecordOfGame(id);
          } else {
            Swal.fire({
              title: result.msg,
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
    swal.fire(
      "",
      "請確保已開啟位置分享，以及上方地圖出現人形標示再提交",
      "error"
    );
    return;
  }
  if (!location && !isUsePlayerLocation) {
    swal.fire("", "請確保已在上方地圖選取位置，出現圖釘標示再提交", "error");
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
  Swal.fire("", result.msg, result.success ? "success" : "error");

  if (result.success) {
    loadSingleGame(id);
  } else if (!result.success && result.reduceAttempts) {
    let attemptElm = document.querySelector("#attempts");
    let perviousAttempt = +attemptElm.textContent;
    console.log({ perviousAttempt });
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
async function initMap() {
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
  let res = await fetch(`/check-in/status?gameId=${gameId}`);
  let result = await res.json();
  if (result.success) {
    isChecked = result.data;
  }
}

async function getCheckInRecordOfGame(gameId) {
  let res = await fetch(`/check-in/game?gameId=${gameId}`);
  let result = await res.json();

  let checkInElm = document.querySelector(".check-in-record-container");
  checkInElm.innerHTML = ``;
  if (result.success) {
    let records = result.data;
    document.querySelector(
      ".check-in-number"
    ).textContent = `(打卡數：${records.length})`;

    if (records.length == 0) {
      checkInElm.innerHTML = `<div class="flex no-record">没有記錄</div>`;
      return;
    }
    for (let record of records) {
      createCheckInRecordDiv(record, checkInElm);
    }
  }
}
function createCheckInRecordDiv(record, mainElm) {
  let recordTemplate = document
    .querySelector("#check-in-record-template")
    .content.cloneNode(true);

  recordTemplate.querySelector(".profile-image").src = record.profile_image
    ? `/${record.profile_image}`
    : "/anonymous.jpg";
  recordTemplate.querySelector(".username").textContent = record.name;
  recordTemplate.querySelector(".check-in-date").textContent = formatDate(
    record.created_at
  );
  recordTemplate.querySelector(".check-in-message").textContent = record.message
    ? record.message
    : `打卡成功！`;
  recordTemplate.querySelector(".check-in-image").src = record.image
    ? `/${record.image}`
    : `/check_in_no_photo.jpg`;

  if (record.image) {
    recordTemplate.querySelector("a").href = `/photo-review.html?id=${id}`;
  }

  mainElm.appendChild(recordTemplate);
}
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
  return formattedDate;
}

async function submitCheckInData() {
  let formData = new FormData();
  formData.append("message", document.querySelector("#check-in-message").value);
  formData.append("image", document.querySelector("#file").files[0]);

  let res = await fetch(`/check-in?id=${checkInId}`, {
    method: "PATCH",
    body: formData,
  });
  let result = await res.json();
  if (result.success) {
    Swal.close();
    Swal.fire("", result.msg, result.success ? "success" : "error");
    getCheckInRecordOfGame(id);
  }
}
function closeSweetAlert() {
  Swal.close();
}

// ---------   basic socket config in js   ---------- //
socket = io.connect();
socket.emit("join-room", id);
socket.on("update room store", () => {
  loadSingleGame(id);
});
socket.on("update room status", () => {
  loadSingleGame(id);
});
