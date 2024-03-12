window.onload = () => {
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
let params = new URLSearchParams(location.search);
async function getUserProfile() {
  let id = params.get("id");

  const res = id ? await fetch(`/user?id=${id}`) : await fetch("/user");
  const result = await res.json();

  profilePicDiv.style.backgroundImage = result.user.profile_image
    ? `url(/${result.user.profile_image})`
    : "url('anonymous.jpg')";

  userNameDiv.value = result.user.name;
  userEmailDiv.value = result.user.email;
  userDesDiv.value = result.user.description;
}

//preview new profile pic:
let result = document.querySelector(".profile-image");
let uploadField = document.querySelector(".file-upload-field");

// on change show image with crop options
uploadField.addEventListener("change", (e) => {
  if (e.target.files.length) {
    // start file reader
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.result) {
        result.style.backgroundImage = `url(${e.target.result})`;
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
  userNameDiv.toggleAttribute("readonly");
  userNameDiv.classList.toggle("not-edit");
  userDesDiv.toggleAttribute("readonly");
  userDesDiv.classList.toggle("not-edit");
});

/*
勝利過的可以在自己google map 中加入該marker
 */

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

  if (record == undefined) {
    getScoreRecords();
    scoreRecordBtn.classList.add("clicked");
  }
}

//------------------------------ score record:---------------------
addClickEffectOfBtn(scoreRecordBtn, getScoreRecords);

async function getScoreRecords() {
  let res = await fetch(`/score/record`);
  let records = await res.json();
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
  let records = await res.json();
  recordAreaContainer.innerHTML = ``;
  if (records.length < 1) {
    recordAreaContainer.innerHTML = `<div class="no-record"><div >未有紀錄</div><div>`;
    return;
  }

  for (let record of records) {
    let awardTemplate = document
      .querySelector("#award-record")
      .content.cloneNode(true);
    awardTemplate.querySelector("#award-img").src = record.image;
    awardTemplate.querySelector("#award-name").textContent = record.name;
    awardTemplate.querySelector("#award-score").textContent = record.score;
    recordAreaContainer.appendChild(awardTemplate);
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
  let res;
  if (type == "game") {
    res = await fetch(`/game/record/${status}`);
  } else if (type == "create") {
    res = await fetch("/creator/games");
  } else {
    res = await fetch(`/game/like_dislike?preferences=${preferences}`);
  }

  let records = await res.json();
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
      record.profile_image = "/anonymous.jpg";
    }

    gameTemplate.querySelector("a").href = `/play-game.html?id=${record.id}`;
    gameTemplate.querySelector(".game_container").src = record.media;
    gameTemplate.querySelector(".profile_picture").src = record.profile_image;
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

let checkInRecordBtn = document.querySelector("#check-in-record-btn");
addClickEffectOfBtn(checkInRecordBtn, () =>
  console.log("todo:check in record")
);

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
      alert("創建者不能讚好/負評自己創建的遊戲");
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
  console.log("sub menu");
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
