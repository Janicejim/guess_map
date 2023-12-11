window.onload = () => {
  getUserProfile();
};

async function getUserProfile() {
  const res = await fetch("/user");
  const result = (await res.json()).user[0];
  // console.log("result", result);

  // const userInfoDiv = document.querySelector('#current-user')

  // Profile content
  const profilePicDiv = document.querySelector(".profile-image");
  const userLevelDiv = document.querySelector("#user-level");
  const userNameDiv = document.querySelector("#user-name");
  const userEmailDiv = document.querySelector("#user-email");
  const userDesDiv = document.querySelector("#user-description");
  //load navbar
  $(function () {
    $("#navbar").load("/navigation/navigation.html");
  });

  const userCreDiv = document.querySelector("#user-created-at");
  const userScoreDiv = document.querySelector("#user-score-record");

  // console.log(JSON.stringify(result.user))

  if (result) {
    console.log("have user", result.user, result.user);
    if (result.profile_image) {
      profilePicDiv.outerHTML = `<img id="profile-resize" class="profile-image" src="${result.profile_image}"/>`;
      userNameDiv.outerHTML = `<input id="user-name" type="text" name="name" placeholder="${result.name}"  maxlength="30" size="30"/>`;
      userEmailDiv.outerHTML = `<input  readonly id="user-email" placeholder="${result.email}" />`;
      userDesDiv.outerHTML = `<textarea id="user-description" name="description"  type="text" placeholder="${result.description}" maxlength="300" size="300">`;
      // userScoreDiv.innerHTML = "Total_score: " + result.user.total_score;
      // userLevelDiv.innerHTML = "Level: " + result.user.level;
    } else {
      userNameDiv.outerHTML = `<input id="user-name" type="text" name="name" placeholder="${result.name}"  maxlength="30" size="30"/>`;
      userEmailDiv.outerHTML = `<input  readonly id="user-email" placeholder="${result.email}" />`;
      userDesDiv.outerHTML = `<textarea id="user-description" name="description"  type="text" placeholder="${result.description}" maxlength="300" size="300">`;
      // userCreDiv.innerHTML = "Created_at: " + createdDate + " " + createdTime;
      // userScoreDiv.innerHTML = "Total_score: " + result.user.total_score;
      // userLevelDiv.innerHTML = "Level: " + result.user.level;
    }
  } else {
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

//----------  signin signout logout btn DOM

// document.querySelector("#index-signin").addEventListener("click", () => {
//   window.location = "/login.html";
// });

// document.querySelector("#index-signup").addEventListener("click", () => {
//   window.location = "/register.html";
// });

// document
//   .querySelector("#index-logout")
//   .addEventListener("click", async (event) => {
//     const res = await fetch("/logout");
//     const result = await res.json();
//     if (result.success) {
//       window.location = "/";
//     }
//   });
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
