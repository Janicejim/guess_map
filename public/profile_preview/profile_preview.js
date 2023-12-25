//load navbar
$(function () {
  $("#navbar").load("/navigation/navigation.html");
});

let params = new URLSearchParams(location.search);
let id = params.get("id");

async function getCurrentUser() {
  const res = await fetch("/user");
  const result = await res.json();
  // console.log('result', result);
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

async function previewUserInfo() {
  const res = await fetch(`/profile/${id}`);
  const result = (await res.json()).user;
  // console.log('preview result ===>', result);

  //format date
  let createdDate = result.created_at.split("T")[0];
  let createdTime = result.created_at.split("T")[1].split(".")[0];

  // Profile content
  const profilePicDiv = document.querySelector(".profile-image");
  const userLevelDiv = document.querySelector("#user-level");
  const userNameDiv = document.querySelector("#user-name");
  const userEmailDiv = document.querySelector("#user-email");
  const userDesDiv = document.querySelector("#user-description");
  const userCreDiv = document.querySelector("#user-created-at");
  const userScoreDiv = document.querySelector("#user-score-record");
  console.log({ result });
  // Profile content
  if (result.profile_image) {
    profilePicDiv.outerHTML = `<img id="profile-resize" class="profile-image" src="../${result.profile_image}"/>`;
    userNameDiv.outerHTML = `<input readonly id="user-name" type="text" name="name" placeholder="${result.name}"  maxlength="30" size="30"/>`;
    userEmailDiv.outerHTML = `<input  readonly id="user-email" placeholder="${result.email}" />`;
    userDesDiv.outerHTML = `<textarea readonly id="user-description" name="description"  type="text" placeholder="${result.description}" maxlength="300" size="300">`;
    userCreDiv.innerHTML = "Created_at: " + createdDate + " " + createdTime;
    userScoreDiv.innerHTML = "Total_score: " + result.total_score;
    userLevelDiv.innerHTML = "Level: " + result.level;
  } else {
    userNameDiv.outerHTML = `<input readonly id="user-name" type="text" name="name" placeholder="${result.name}"  maxlength="30" size="30"/>`;
    userEmailDiv.outerHTML = `<input  readonly id="user-email" placeholder="${result.email}" />`;
    userDesDiv.outerHTML = `<textarea readonly id="user-description" name="description"  type="text" placeholder="${result.description}" maxlength="300" size="300">`;
    userCreDiv.innerHTML = "Created_at: " + createdDate + " " + createdTime;
    userScoreDiv.innerHTML = "Total_score: " + result.total_score;
    userLevelDiv.innerHTML = "Level: " + result.level;
  }
}

window.onload = () => {
  getCurrentUser();
  previewUserInfo();
};

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
    const res = await fetch("/logout", { method: "POST" });
    const result = await res.json();
    if (result.success) {
      window.location = "/";
    }
  });
//^^^^^^^^^^^ signin signout logout btn DOM

// ---------- upload button required javascript

$("form").on("change", ".file-upload-field", function () {
  $(this)
    .parent(".file-upload-wrapper")
    .attr(
      "data-text",
      $(this)
        .val()
        .replace(/.*(\/|\\)/, "")
    );
});
//^^^^^^^^^^^^ upload button required javascript
