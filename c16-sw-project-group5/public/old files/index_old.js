import { loadAllGames } from "./show-game.js";
const err = new URL(window.location.href).searchParams.get("err");
if (err) {
  alert(err);
}

async function getCurrentUser() {
  const res = await fetch("/user");
  const result = await res.json();
  const signinDiv = document.querySelector("#index-signin");
  const signoutDiv = document.querySelector("#index-signup");
  const logoutDiv = document.querySelector("#index-logout");
  const userInfoDiv = document.querySelector("#current-user");

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

window.onload = () => {
  loadAllGames();
  getCurrentUser();
};
