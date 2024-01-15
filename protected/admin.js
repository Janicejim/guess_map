//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

// ******** Search Game ******** //

const searchGameForm = document.querySelector("#search-game");
const searchGameInput = document.querySelector("#searchGameInput");
const showGameInfo = document.querySelector("#show-game-info");

searchGameForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showGameInfo.innerText = "";
  const form = event.target;
  const gameObj = { searchText: form.searchGameInput.value };
  // console.log("mark-client-1")

  const res = await fetch("/search/game", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gameObj),
  });
  const result = await res.json();

  for (let i = 0; i < result.length; i++) {
    let gameContainer = document.createElement("div");
    let getUserImg = document.createElement("img");
    let userName = document.createElement("div");
    let gameID = document.createElement("div");
    let gameMedia = document.createElement("img");
    let gameCreatedDate = document.createElement("div");

    gameContainer.classList.add("gameContainer");
    gameContainer.classList.add(`game_id-${i}`);
    userName.classList.add("nameDiv");
    gameID.classList.add("gameIdDiv");
    gameMedia.classList.add("mediaDiv");
    gameCreatedDate.classList.add("game-Created-Date-Div");

    let createdDate = result[i].created_at.split("T")[0];
    let createdTime = result[i].created_at.split("T")[1].split(".")[0];

    if (result[i].profile_image != null) {
      getUserImg.src = result[i].profile_image;
      gameMedia.src = result[i].media;
      userName.innerHTML = `<b>Name:</b>\n ${result[i].name}`;
      gameID.innerHTML = `<b>GameID:</b>\n ${result[i].id}`;
      gameMedia.innerHTML = `${result[i].media}`;
      gameCreatedDate.innerHTML = `<b>Created_at:</b>\n ${createdDate}\n ${createdTime}`;
    } else {
      getUserImg.src = "anonymous.png";
      gameMedia.src = result[i].media;
      userName.innerHTML = `<b>Name:</b>\n ${result[i].name}`;
      gameID.innerHTML = `<b>GameID:</b>\n ${result[i].id}`;
      gameMedia.innerHTML = `${result[i].media}`;
      gameCreatedDate.innerHTML = `<b>Created_at:</b>\n ${result[i].created_at}`;
    }
    gameContainer.appendChild(getUserImg);
    gameContainer.appendChild(userName);
    gameContainer.appendChild(gameID);
    gameContainer.appendChild(gameMedia);
    gameContainer.appendChild(gameCreatedDate);

    showGameInfo.appendChild(gameContainer);
    showGameInfo.scrollTop = showGameInfo.scrollHeight;
  }
  // --------- Select Game ---------- //
  if (showGameInfo.querySelector("*")) {
    const allGamesDiv = showGameInfo.children;
    // console.log('allUsersDiv', allUsersDiv);

    for (let j = 0; j < allGamesDiv.length; j++) {
      const selectGame = document.querySelector(`.game_id-${j}`);
      selectGame.addEventListener("click", (event) => {
        event.preventDefault();
        if (!event.currentTarget.classList.contains("gameSelected")) {
          event.currentTarget.classList.add("gameSelected");
          const selectedUser = document.querySelector(".gameSelected");
          // console.log('selectedUser', selectedUser);
        } else {
          event.currentTarget.classList.remove("gameSelected");
          const selectedUser = document.querySelector(".gameSelected");
          // console.log('selectedUser', selectedUser);
        }
      });
    }
    // ---------- Delete Game --------- //
    // ---------- Delete Game --------- //
    const deleteGame = document.querySelector("#deleteGame");
    deleteGame.addEventListener("click", async (event) => {
      event.preventDefault();
      const selectedGameDivs = document.querySelectorAll(".gameSelected");
      // console.log('selectedGameDivs', selectedGameDivs);
      let allGameIDArray = [];
      for (let x = 0; x < selectedGameDivs.length; x++) {
        //get gameID
        allGameIDArray.push(
          selectedGameDivs[x]
            .querySelector(".gameIdDiv")
            .innerText.split("\n")[1]
        );
        // console.log('allGameIDArray', allGameIDArray);
      }

      const res = await fetch("/game", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allGameIDArray),
      });
      // init-box
      showGameInfo.innerText = "";
    });
    // ---------- Delete Game --------- //
    // ---------- Delete Game --------- //
  }
});

// ******** Search Game ******** //

// ******** Search User ******** //

//----- Search and Show -----//
const searchUserForm = document.querySelector("#search-user");
const searchUserInfo = document.querySelector("#searchUserInput");
const showUserInfo = document.querySelector("#show-user-info");

searchUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showUserInfo.innerText = "";
  const form = event.target;
  const userObj = { searchText: form.searchUserInput.value };
  // console.log('userObj = ', userObj);

  const res = await fetch("/search/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userObj),
  });
  const result = await res.json();

  for (let i = 0; i < result.length; i++) {
    let userContainer = document.createElement("div");
    let getUserImg = document.createElement("img");
    let userName = document.createElement("div");
    let userEmail = document.createElement("div");
    let userRole = document.createElement("div");

    userContainer.classList.add("userContainer");
    userContainer.classList.add(`id-${i}`);
    userName.classList.add("nameDiv");
    userEmail.classList.add("emailDiv");
    userRole.classList.add("roleDiv");

    // change role number the string
    var userRoleStr;
    if (result[i].role == 0) {
      userRoleStr = "Member";
    } else if (result[i].role == 9) {
      userRoleStr = "Admin";
    } else {
      userRoleStr = result[i].role;
    }

    if (result[i].profile_image != null) {
      getUserImg.src = result[i].profile_image;
      userName.innerHTML = `<b>Name:</b>\n ${result[i].name}`;
      userEmail.innerHTML = `<b>Email:</b>\n ${result[i].email}`;
      userRole.innerHTML = `<b>Role:</b>\n ${userRoleStr}`;
    } else {
      getUserImg.src = "anonymous.png";
      userName.innerHTML = `<b>Name:</b>\n ${result[i].name}`;
      userEmail.innerHTML = `<b>Email:</b>\n ${result[i].email}`;
      userRole.innerHTML = `<b>Role:</b>\n ${userRoleStr}`;
    }
    userContainer.appendChild(getUserImg);
    userContainer.appendChild(userName);
    userContainer.appendChild(userEmail);
    userContainer.appendChild(userRole);

    showUserInfo.appendChild(userContainer);
    showUserInfo.scrollTop = showUserInfo.scrollHeight;
  }
  // --------- Select User ---------- //
  if (showUserInfo.querySelector("*")) {
    const allUsersDiv = showUserInfo.children;
    // console.log('allUsersDiv', allUsersDiv);

    for (let j = 0; j < allUsersDiv.length; j++) {
      const selectUser = document.querySelector(`.id-${j}`);
      selectUser.addEventListener("click", (event) => {
        event.preventDefault();
        if (!event.currentTarget.classList.contains("userSelected")) {
          event.currentTarget.classList.add("userSelected");
          const selectedUser = document.querySelector(".userSelected");
          // console.log('selectedUser', selectedUser);
        } else {
          event.currentTarget.classList.remove("userSelected");
          const selectedUser = document.querySelector(".userSelected");
          // console.log('selectedUser', selectedUser);
        }
      });
    }

    // ---------- Delete User --------- //
    // ---------- Delete User --------- //
    const deleteUser = document.querySelector("#deleteUser");
    deleteUser.addEventListener("click", async (event) => {
      event.preventDefault();
      const selectedUserDivs = document.querySelectorAll(".userSelected");
      // console.log("selectedUserDivs", selectedUserDivs);
      let allEmailArray = [];
      for (let x = 0; x < selectedUserDivs.length; x++) {
        //get email
        // const allSelectedEmail =   selectedUserDivs[x].querySelector(".emailDiv").innerText.split("\n")[1];
        allEmailArray.push(
          selectedUserDivs[x]
            .querySelector(".emailDiv")
            .innerText.split("\n")[1]
        );
      }
      // console.log('allEmailArray', allEmailArray);
      const res = await fetch("/user", {
        method: "Delete",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allEmailArray),
      });
      // init-box
      showUserInfo.innerText = "";

      // const selectedUserEmail = selectedUserDivs.querySelector(".userEmail");
    });
    // ---------- Delete User --------- //
    // ---------- Delete User --------- //

    // ---------- Upgrade User --------- //
    // ---------- Upgrade User --------- //
    const upgradeUser = document.querySelector("#upgradeUser");
    upgradeUser.addEventListener("click", async (event) => {
      event.preventDefault();
      const selectedUserDivs = document.querySelectorAll(".userSelected");
      // console.log("selectedUserDivs", selectedUserDivs);
      let allEmailArray = [];
      for (let x = 0; x < selectedUserDivs.length; x++) {
        //get email
        // const allSelectedEmail =   selectedUserDivs[x].querySelector(".emailDiv").innerText.split("\n")[1];
        allEmailArray.push(
          selectedUserDivs[x]
            .querySelector(".emailDiv")
            .innerText.split("\n")[1]
        );
      }
      const res = await fetch("/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allEmailArray }),
      });
      // init-box
      showUserInfo.innerText = "";
      window.location = "/admin.html";
    });

    // ---------- Upgrade User --------- //
    // ---------- Upgrade User --------- //
  }
});

// ******** Search User ******** //

// ******** Game Report & Messages Required js ******** //

let coll = document.getElementsByClassName("collapsible");
let i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

// ******** Game Report & Messages Required js ******** //

/* loading */

// $(window).on('load', function () {
//   $('#loading').fadeOut;
// }) ;
