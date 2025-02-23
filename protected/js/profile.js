window.onload = () => {
  // isLogin();
  handleWindowResize();
  getUserProfile();
  loadDefaultRecord();
};

//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

// Profile content
const profilePicDiv = document.querySelector(".profile-image");
const userNameDiv = document.querySelector("#user-name");
const userEmailDiv = document.querySelector("#user-email");
const userDesDiv = document.querySelector("#user-description");
const totalScoreDiv = document.querySelector("#total_score");
const winLossDiv = document.querySelector("#win_loss_number");
const checkInNumber = document.querySelector("#check_in_number");
let params = new URLSearchParams(location.search);
async function getUserProfile() {
  let id = params.get("id");
  if (id) {
    document.querySelector(".fa-user-edit").classList.add("hidden");
    document.querySelector("#score-record-btn").classList.add("hidden");
    document.querySelector("#award-record-btn").classList.add("hidden");
    document.querySelector("#like-record-btn").classList.add("hidden");
    document.querySelector("#dislike-record-btn").classList.add("hidden");
  }

  const res = id ? await fetch(`/user?id=${id}`) : await fetch("/user");
  const result = await res.json();

  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  let user = result.data.user;

  profilePicDiv.src = user.profile_image
    ? `/${user.profile_image}`
    : "/anonymous.jpg";

  userNameDiv.value = user.name;
  userEmailDiv.value = user.email;
  userDesDiv.value = user.description;
  totalScoreDiv.textContent = user.total_score;
  winLossDiv.textContent = `${user.win_number}勝${user.loss_number}敗`;
  checkInNumber.textContent = user.check_in_number;
}

//preview new profile pic:
let result = document.querySelector(".profile-image");
let uploadField = document.querySelector(".file-upload-field");

// on change show image with crop options
uploadField.addEventListener("change", (e) => {
  if (e.target.files.length) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.result) {
        result.src = `${e.target.result}`;
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

document.querySelector(".save").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData();
  formData.append("image", form.image.files[0]);
  formData.append("name", form.name.value);
  formData.append("description", form.description.value);

  const res = await fetch("/profile", {
    method: "PUT",
    body: formData,
  });
  const result = await res.json();
  if (result.success) {
    await getUserProfile();
  }
});

document.querySelector(".discard").addEventListener("click", () => {
  window.location = "/profile.html";
});

let editIcon = document.querySelector(".fa-user-edit");
let editBtnContainer = document.querySelector("#sd-btn-container");
let uploadPicContainer = document.querySelector(".file-upload-wrapper");
editIcon.addEventListener("click", () => {
  uploadPicContainer.classList.toggle("hidden");
  editIcon.classList.toggle("hidden");
  editBtnContainer.classList.toggle("hidden");
  userNameDiv.classList.toggle("not-edit");
  userDesDiv.toggleAttribute("readonly");
  userDesDiv.classList.toggle("not-edit");
});

let editForm = document.querySelector("#edit-profile-form");
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let formData = new FormData(editForm);
  let res = await fetch("/profile", { method: "PUT", body: formData });
  let result = await res.json();

  if (res.ok) {
    uploadPicContainer.classList.toggle("hidden");
    editIcon.classList.toggle("hidden");
    editBtnContainer.classList.toggle("hidden");
    userNameDiv.toggleAttribute("readonly");
    userNameDiv.classList.toggle("not-edit");
    userDesDiv.toggleAttribute("readonly");
    userDesDiv.classList.toggle("not-edit");
  }
});
//---------------------------------------------------------------------record part-------------------------------------------------------------
let recordAreaContainer = document.querySelector("#record-area");
let scoreRecordBtn = document.querySelector("#score-record-btn");
let redeemRecordBtn = document.querySelector("#award-record-btn");
let createdRecordBtn = document.querySelector("#create-game-record-btn");
function loadDefaultRecord() {
  let record = params.get("record");
  let id = params.get("id");

  if (record == undefined && !id) {
    getScoreRecords();
    scoreRecordBtn.classList.add("clicked");
  } else {
    getGameRecords("create");
    createdRecordBtn.classList.add("clicked");
  }
}

//------------------------------ score record:---------------------
addClickEffectOfBtn(scoreRecordBtn, getScoreRecords);

async function getScoreRecords() {
  let res = await fetch(`/score/record`);
  let result = await res.json();
  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  let records = result.data;
  recordAreaContainer.innerHTML = ``;
  for (let record of records) {
    let scoreTemplate = document
      .querySelector("#score-record")
      .content.cloneNode(true);

    scoreTemplate.querySelector("#score_created_at").textContent = formatDate(
      record.created_at
    );
    scoreTemplate.querySelector(".score-image").src = `/${record.image}`;
    scoreTemplate.querySelector("#description").textContent =
      record.description;
    let scoreChange;

    let mainDiv = scoreTemplate.querySelector(".main-content");

    if (record.score_change >= 0) {
      scoreChange = `+${record.score_change}分`;
      mainDiv.classList.add("green-border");
    } else {
      scoreChange = `${record.score_change}分`;
      mainDiv.classList.add("orange-border");
    }

    scoreTemplate.querySelector("#score-change").textContent = scoreChange;
    recordAreaContainer.appendChild(scoreTemplate);
    recordAreaContainer.classList.remove("record-flex");
  }
}
//------------------ award redeem record :-------------------------------
addClickEffectOfBtn(redeemRecordBtn, getRedeemRecord);
async function getRedeemRecord() {
  let res = await fetch(`/award/record`);
  let result = await res.json();
  if (result.success) {
    let records = result.data;
    recordAreaContainer.innerHTML = ``;
    if (records.length < 1) {
      recordAreaContainer.innerHTML = `<div class="no-record"><div >未有紀錄</div><div>`;
      return;
    }

    for (let record of records) {
      let awardTemplate = document
        .querySelector("#award-record")
        .content.cloneNode(true);
      awardTemplate.querySelector("#award-img").src = `/${record.image}`;
      awardTemplate.querySelector("#award-name").textContent = record.name;
      awardTemplate.querySelector("#award-score").textContent = record.score;
      recordAreaContainer.appendChild(awardTemplate);
    }
  } else {
    Swal.fire("", result.msg, result.success ? "success" : "error");
  }
}

//--------------- created game record --------------------------------------------:

addClickEffectOfBtn(createdRecordBtn, () => getGameRecords("create"));
//--------------------------------win record:----------------------------
let winRecordBtn = document.querySelector("#win-record-btn");
addClickEffectOfBtn(winRecordBtn, () => getGameRecords("game", "", "win"));
//--------------------------------loss record:----------------------------
let lossRecordBtn = document.querySelector("#loss-record-btn");
addClickEffectOfBtn(lossRecordBtn, () => getGameRecords("game", "", "loss"));
//--------------------------------like record:----------------------------
let likeRecordBtn = document.querySelector("#like-record-btn");
addClickEffectOfBtn(likeRecordBtn, () =>
  getGameRecords("reaction", "like", "")
);
let dislikeRecordBtn = document.querySelector("#dislike-record-btn");
addClickEffectOfBtn(dislikeRecordBtn, () =>
  getGameRecords("reaction", "dislike", "")
);
async function getGameRecords(type, preferences, status) {
  let id = params.get("id");
  let res;
  if (type == "game") {
    res = id
      ? await fetch(`/game/record/${status}?id=${id}`)
      : await fetch(`/game/record/${status}`);
  } else if (type == "create") {
    res = id
      ? await fetch(`/creator/games?id=${id}`)
      : await fetch("/creator/games");
  } else {
    res = await fetch(`/game/like_dislike?preferences=${preferences}`);
  }
  let result = await res.json();
  if (!result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    return;
  }
  let records = result.data;
  recordAreaContainer.innerHTML = ``;
  if (records.length == 0) {
    recordAreaContainer.innerHTML = `<div class="no-record"><div >未有紀錄</div><div>`;
    return;
  }

  for (let record of records) {
    let gameTemplate;

    if (record.status == "active") {
      gameTemplate = document
        .querySelector("#active-game-template")
        .content.cloneNode(true);

      gameTemplate.querySelector(".fa-piggy-bank").textContent =
        record.store_amount;
    } else {
      gameTemplate = document
        .querySelector("#completed-game-template")
        .content.cloneNode(true);

      gameTemplate.querySelector(".fa-user-ninja").textContent =
        record.check_in_number;
    }

    if (!record.profile_image) {
      record.profile_image = "anonymous.jpg";
    }

    gameTemplate.querySelector("a").href = `/play-game.html?id=${record.id}`;
    gameTemplate.querySelector(".game_container").src = `/${record.media}`;
    gameTemplate.querySelector(".profile_picture").src = `/${record.profile_image}`;
    gameTemplate.querySelector(".username").textContent = record.name;
    let likeNumberElm = gameTemplate.querySelector(".like_number");
    likeNumberElm.textContent = record.like_number;

    let dislikeNumberElm = gameTemplate.querySelector(".dislike_number");
    dislikeNumberElm.textContent = record.dislike_number;
    let likeIcon = gameTemplate.querySelector(".fa-thumbs-up");
    let dislikeIcon = gameTemplate.querySelector(".fa-thumbs-down");

    if (record.preferences == "like") {
      likeIcon.classList.toggle(`clicked-icon-like`);
    } else if (record.preferences == "dislike") {
      dislikeIcon.classList.toggle(`clicked-icon-dislike`);
    }
    clickPreferenceEvent(
      type,
      record.id,
      likeIcon,
      "like",
      dislikeIcon,
      "dislike",
      likeNumberElm
    );
    clickPreferenceEvent(
      type,
      record.id,
      dislikeIcon,
      "dislike",
      likeIcon,
      "like",
      dislikeNumberElm
    );

    recordAreaContainer.appendChild(gameTemplate);
    recordAreaContainer.classList.add("record-flex");
  }
}

function clickPreferenceEvent(
  type,
  gameId,
  targetElement,
  preference,
  oppositeElement,
  oppositePreference,
  numberElm
) {
  targetElement.addEventListener("click", async () => {
    if (type == "create") {
      Swal.fire("", "創建者不能讚好/負評自己創建的遊戲", "error");
      return;
    }
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
//------------sub menu bar------------------------------
function moveClickedStyle() {
  let allBtn = document.querySelectorAll(".record-btn");
  for (let btn of allBtn) {
    btn.classList.remove("clicked");
  }
}

function addClickEffectOfBtn(element, fn) {
  element.addEventListener("click", () => {
    moveClickedStyle();
    element.classList.add("clicked");
    fn();
  });
}

window.addEventListener("resize", handleWindowResize);

function handleWindowResize() {
  let sideBar = document.querySelector("#side-bar");
  let subMenuBtn = document.querySelector("#sub-menu");
  let rightHandSideContainer = document.querySelector("#right-hand-side");
  const windowWidth = window.innerWidth;

  if (windowWidth < 901) {
    sideBar.classList.add("hidden");
    subMenuBtn.classList.remove("hidden");
    rightHandSideContainer.classList.add("hidden");
  } else if (windowWidth >= 901) {
    sideBar.classList.remove("hidden");
    subMenuBtn.classList.add("hidden");
    rightHandSideContainer.classList.remove("hidden");
  }
  // Additional actions or logic based on the window size change
}

document.querySelector("#sub-menu").addEventListener("click", () => {
  let sideBar = document.querySelector("#side-bar");
  sideBar.classList.toggle("hidden");
});

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
//-----------------------check in record-------------------------

let checkInRecordBtn = document.querySelector("#check-in-record-btn");
addClickEffectOfBtn(checkInRecordBtn, () => getUserCheckInRecord());

let checkInSwiper;
let checkInRecords;
async function getUserCheckInRecord() {
  recordAreaContainer.innerHTML = ``;
  let id = params.get("id");
  let res = id
    ? await fetch(`/check-in/record?id=${id}`)
    : await fetch("/check-in/record");
  let result = await res.json();
  if (result.success) {
    checkInRecords = result.data;
  }

  if (checkInRecords.length == 0) {
    recordAreaContainer.innerHTML = `<div class="no-record"><div >未有紀錄</div><div>`;
    return;
  }

  let checkInSwiperContainer = document
    .querySelector("#check-in-container-template")
    .content.cloneNode(true);
  let wrapperDiv = checkInSwiperContainer.querySelector(".swiper-wrapper");

  for (let record of checkInRecords) {
    let swiperSlideTemplate = document
      .querySelector("#check-in-record-template")
      .content.cloneNode(true);

    swiperSlideTemplate.querySelector(
      ".check-in-image"
    ).src = `/${record.media}`;

    swiperSlideTemplate.querySelector(
      "a"
    ).href = `/play-game.html?id=${record.game_id}`;
    wrapperDiv.appendChild(swiperSlideTemplate);
  }
  checkInSwiperContainer.querySelector(".check-in-number span").textContent =
    checkInRecords.length;
  checkInSwiperContainer.querySelector(".message").textContent =
    checkInRecords[0].message;
  checkInSwiperContainer.querySelector(".date").textContent = formatDate(
    checkInRecords[0].created_at
  );

  checkInSwiperContainer.querySelector(".check-in-content img").src =
    checkInRecords[0].image
      ? `/${checkInRecords[0].image}`
      : `/check_in_no_photo.jpg`;

  checkInSwiperContainer
    .querySelector(".fa-edit")
    .addEventListener("click", () => {
      Swal.fire({
        title: "編輯留言記錄",
        html: `<div class="edit-check-in">
        <div>留言：</div>
        <input type="text" id="check-in-message" value=${checkInRecords[0].message}></input>
        <div>合照：</div>
        <input type="file" id="file"></input>
        <div class="btn-container">        <button class="submit-btn" onClick="submitEditCheckIn(${checkInRecords[0].id})">提交</button>
        <button class="cancel-btn"  onClick="closeSweetAlert()">取消</button></div>

      </div>`,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: true,
      });
    });

  recordAreaContainer.appendChild(checkInSwiperContainer);

  checkInSwiper = new Swiper(".checkInSwiper", {
    effect: "cards",
    grabCursor: true,
  });

  checkInSwiper.on("slideChange", function () {
    updateMessageAndDate();
  });
}

function updateMessageAndDate() {
  let messageElement = document.querySelector(".message");
  let dateElement = document.querySelector(".date");
  let gameImage = document.querySelector(".check-in-content img");
  let record = checkInRecords[checkInSwiper.activeIndex];
  messageElement.textContent = record.message;
  dateElement.textContent = formatDate(record.created_at);
  gameImage.src = record.image ? `/${record.image}` : `/check_in_no_photo.jpg`;
}

//---------------edit check in ------------------------

async function submitEditCheckIn(id) {
  let formData = new FormData();
  formData.append("message", document.querySelector("#check-in-message").value);
  formData.append("image", document.querySelector("#file").files[0]);

  let res = await fetch(`/check-in?id=${id}`, {
    method: "PATCH",
    body: formData,
  });
  let result = await res.json();
  Swal.close();
  Swal.fire("", result.msg, result.success ? "success" : "error");
  setTimeout(()=>{ getUserCheckInRecord()},1000)

 
}

function closeSweetAlert() {
  Swal.close();
}
