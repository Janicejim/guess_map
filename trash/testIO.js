// ---------   basic socket config in js   ---------- //
const socket = io.connect();

// socket.on("disconnect", (reason) => {
//     if (reason === "io client disconnect") {
//         // socket.connect();
//       }
//   });
// ---------   basic socket config in js   ---------- //

// ---------   socket io testing   --------- //

async function postApple() {
  const res = await fetch("/apple", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  const resData = await res.json();
  // console.log('resData', resData);
}

async function missionRec() {
  socket.emit("mission-get", `i know i am the one`);
}

// socket.on('new-apple',(msg)=>{
//     console.log(msg);
// });

socket.on("new connection", (data) => {
  const { msg, user } = data;
  //   console.log(data);
});

socket.on("secret-mission", (msg) => {
  console.log({ msg });
});

// ---------   socket io testing   --------- //

// ---------  Chat Room JS  --------- //
// ---------  Chat Room JS  --------- //
// ---------  Chat Room JS  --------- //

//  >>>>> Room setup <<<<< //
let input = document.querySelector("#input");
let messages = document.querySelector("#messages");
let chatroom = document.querySelector("#chatroom-container");

// >>>>>>> submit message 上 server
document.querySelector("#form").addEventListener("submit", function (event) {
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

  //   console.log("getImg.src", getImg);
  //   console.log("item", item);

  msgContainer.appendChild(getImg);
  msgContainer.appendChild(item);

  messages.appendChild(msgContainer);

  //scroll to button
  messages.scrollTop = messages.scrollHeight;
});

async function pushUserName() {
  event.preventDefault();
}

//  >>>>> Room setup <<<<< //

// ^^^^^^^^^  Chat Room JS  ^^^^^^^^^ //
// ^^^^^^^^^  Chat Room JS  ^^^^^^^^^ //
// ^^^^^^^^^  Chat Room JS  ^^^^^^^^^ //

//----------  signin signout logout btn DOM

document.querySelector("#index-signin").addEventListener("click", () => {
  window.location = "/login.html";
});

document.querySelector("#index-signup").addEventListener("click", () => {
  window.location = "/register.html";
});

document
  .querySelector("#index-logout")
  .addEventListener("click", async (event) => {
    const res = await fetch("/logout");
    const result = await res.json();
    if (result.success) {
      window.location = "/";
    }
  });
//^^^^^^^^^^^ signin signout logout btn DOM

//^^^^^^^^^^^ get current user
async function getCurrentUser() {
  const res = await fetch("/user");
  const result = await res.json();
  const signinDiv = document.querySelector("#index-signin");
  const signoutDiv = document.querySelector("#index-signup");
  const logoutDiv = document.querySelector("#index-logout");
  const userInfoDiv = document.querySelector("#current-user");

  // console.log(JSON.stringify(result.user))

  if (result.user) {
    signinDiv.classList.remove("show");
    signoutDiv.classList.remove("show");
    signinDiv.classList.add("hide");
    signoutDiv.classList.add("hide");

    logoutDiv.classList.remove("hide");
    logoutDiv.classList.add("show");

    userInfoDiv.innerHTML = "歡迎 " + (result.user.name || result.user.email);
  } else {
    signinDiv.classList.remove("hide");
    signoutDiv.classList.remove("hide");
    signinDiv.classList.add("show");
    signoutDiv.classList.add("show");

    logoutDiv.classList.remove("show");
    logoutDiv.classList.add("hide");

    userInfoDiv.innerHTML = "";
  }
}

window.onload = () => {
  getCurrentUser();
};
