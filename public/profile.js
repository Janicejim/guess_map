async function getCurrentUser2() {
  const res = await fetch("/user");
  const result = await res.json();
  // console.log("result", result);

  // const userInfoDiv = document.querySelector('#current-user')

  // Profile content
  const profilePicDiv = document.querySelector(".profile-image");
  const userLevelDiv = document.querySelector("#user-level");
  const userNameDiv = document.querySelector("#user-name");
  const userEmailDiv = document.querySelector("#user-email");
  const userDesDiv = document.querySelector("#user-description");
  const userCreDiv = document.querySelector("#user-created-at");
  const userScoreDiv = document.querySelector("#user-score-record");

  // console.log(JSON.stringify(result.user))

  if (result.user) {
    // signinDiv.classList.remove("show")
    // signoutDiv.classList.remove("show")
    // signinDiv.classList.add("hide")
    // signoutDiv.classList.add("hide")

    // logoutDiv.classList.remove("hide")
    // logoutDiv.classList.add("show")

    // //format date
    let createdDate = result.user.created_at.split("T")[0];
    let createdTime = result.user.created_at.split("T")[1].split(".")[0];

    // userInfoDiv.innerHTML = "歡迎 " + (result.user.name || result.user.email);

    // Profile content
    if (result.user.profile_image) {
      profilePicDiv.outerHTML = `<img id="profile-resize" class="profile-image" src="${result.user.profile_image}"/>`;
      userNameDiv.outerHTML = `<input id="user-name" type="text" name="name" placeholder="${result.user.name}"  maxlength="30" size="30"/>`;
      userEmailDiv.outerHTML = `<input  readonly id="user-email" placeholder="${result.user.email}" />`;
      userDesDiv.outerHTML = `<textarea id="user-description" name="description"  type="text" placeholder="${result.user.description}" maxlength="300" size="300">`;
      userCreDiv.innerHTML = "Created_at: " + createdDate + " " + createdTime;
      userScoreDiv.innerHTML = "Total_score: " + result.user.total_score;
      userLevelDiv.innerHTML = "Level: " + result.user.level;
    } else {
      userNameDiv.outerHTML = `<input id="user-name" type="text" name="name" placeholder="${result.user.name}"  maxlength="30" size="30"/>`;
      userEmailDiv.outerHTML = `<input  readonly id="user-email" placeholder="${result.user.email}" />`;
      userDesDiv.outerHTML = `<textarea id="user-description" name="description"  type="text" placeholder="${result.user.description}" maxlength="300" size="300">`;
      userCreDiv.innerHTML = "Created_at: " + createdDate + " " + createdTime;
      userScoreDiv.innerHTML = "Total_score: " + result.user.total_score;
      userLevelDiv.innerHTML = "Level: " + result.user.level;
    }
  } else {
    // signinDiv.classList.remove("hide")
    // signoutDiv.classList.remove("hide")
    // signinDiv.classList.add("show")
    // signoutDiv.classList.add("show")

    // logoutDiv.classList.remove("show")
    // logoutDiv.classList.add("hide")

    userInfoDiv.innerHTML = "";
    userNameDiv.innerHTML = "login first";
    userEmailDiv.innerHTML = "login first";
    userDesDiv.innerHTML = "login first";
    userScoreDiv.innerHTML = "login first";
    userLevelDiv.innerHTML = "login first";
  }
}

document
  .querySelector("#edit-profile")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData();
    // console.log("formData", formData);
    // console.log("form.name.value received  =>", form.name.value);
    // console.log("form.description.value received  =>", form.description.value);
    // console.log("form.image.files[0] received  =>", form.image.files[0]);

    formData.append("image", form.image.files[0]);
    formData.append("name", form.name.value);
    formData.append("description", form.description.value);

    const res = await fetch("/editProfile", {
      method: "PUT",
      body: formData,
    });
    const result = await res.json();
    if (result.success) {
      await getCurrentUser2();
    }
  });

window.onload = () => {
  getCurrentUser2();
};

document.querySelector(".discard").addEventListener("click", () => {
  window.location = "/profile.html";
});

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
