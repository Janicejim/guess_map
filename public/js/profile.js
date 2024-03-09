window.onload = () => {
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

function loadDefaultRecord() {
  let record = params.get("record");

  if (record == undefined) {
    getScoreRecords();
  }
}
let recordAreaContainer = document.querySelector("#record-area");

//click score record:
let scoreRecordBtn = document.querySelector("#score-record-btn");
scoreRecordBtn.addEventListener("click", () => {
  getScoreRecords();
});

async function getScoreRecords() {
  let res = await fetch(`/score/record`);
  let records = await res.json();
  recordAreaContainer.innerHTML = ``;
  for (let record of records) {
    let scoreTemplate = document
      .querySelector("#score-record")
      .content.cloneNode(true);
    scoreTemplate.querySelector("#description").textContent =
      record.description;
    let scoreChange;

    if (record.score_change >= 0) {
      scoreChange = `+${record.score_change}分`;
    } else {
      scoreChange = `${record.score_change}分`;
    }

    scoreTemplate.querySelector("#score-change").textContent = scoreChange;
    recordAreaContainer.appendChild(scoreTemplate);
  }
}
//click award redeem record btn:
let redeemRecordBtn = document.querySelector("#award-record-btn");
redeemRecordBtn.addEventListener("click", () => {
  getRedeemRecord();
});

async function getRedeemRecord() {
  let res = await fetch(`/award/record`);
  let records = await res.json();
  recordAreaContainer.innerHTML = ``;
  if (records.length < 1) {
    recordAreaContainer.innerHTML = `<div>未有記錄</div>`;
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

//click my created game:

let createdRecordBtn = document.querySelector("#create-game-record-btn");
createdRecordBtn.addEventListener("click", () => {
  getGameRecords("create");
});

//click win/loss record:
let winRecordBtn = document.querySelector("#win-record-btn");
winRecordBtn.addEventListener("click", () => {
  getGameRecords("game", "", "win");
});
let lossRecordBtn = document.querySelector("#loss-record-btn");
lossRecordBtn.addEventListener("click", () => {
  getGameRecords("game", "", "loss");
});
let reactionRecordBtn = document.querySelector("#reaction-record-btn");
reactionRecordBtn.addEventListener("click", () => {
  getGameRecords("reaction", "like", "");
});
async function getGameRecords(type, preferences, status) {
  let res;
  if (type == "game") {
    res = await fetch(`/game/record/${status}`);
  } else if ((type = "create")) {
    res = await fetch("/creator/games");
  } else {
    res = await fetch(`/game/like_dislike?preferences=${preferences}`);
  }

  let records = await res.json();
  recordAreaContainer.innerHTML = ``;
  if (records.length == 0) {
    recordAreaContainer.innerHTML = `<div class="container">没有紀錄</div>`;
    return;
  }
  // let containerDiv = document
  //   .createElement("div")
  //   .classList.toggle("record-container");
  for (let record of records) {
    let gameTemplate = document
      .querySelector("#game-record")
      .content.cloneNode(true);

    if (!record.profile_image) {
      record.profile_image = "/anonymous.jpg";
    }

    gameTemplate.querySelector(".fa-piggy-bank").textContent =
      record.store_amount;
    gameTemplate.querySelector("a").href = `/play-game.html?id=${record.id}`;
    gameTemplate.querySelector(".game_container").src = record.media;
    gameTemplate.querySelector(".profile_picture").src = record.profile_image;
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
      record.id,
      likeIcon,
      "like",
      dislikeIcon,
      "dislike",
      likeNumberElm
    );
    clickPreferenceEvent(
      record.id,
      dislikeIcon,
      "dislike",
      likeIcon,
      "like",
      dislikeNumberElm
    );

    recordAreaContainer.appendChild(gameTemplate);
  }
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
    if (targetElement.classList.contains(`clicked-icon-${preference}`)) {
      numberElm.textContent = +numberElm.textContent - 1;
    } else {
      numberElm.textContent = +numberElm.textContent + 1;
    }
    targetElement.classList.toggle(`clicked-icon-${preference}`);
  });
}

let swiper = new Swiper(".mySwiper", {
  effect: "cards",
  grabCursor: true,
});
