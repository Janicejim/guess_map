//------------swiper menu ------------------
let userRoleContainer = document.querySelector(".filter-user-layout");
let createAwardContainer = document.querySelector("#createAwardForm");
let editAwardContainer = document.querySelector("#awardArea");
let sortContainer = document.querySelector(".sort-container");
let type = "role";

let typeElements = document.querySelectorAll(".swiper-slide");
for (let typeElement of typeElements) {
  typeElement.addEventListener("click", () => {
    clickedStyle(typeElement);
    type = typeElement.getAttribute("data-type");
    if (type == "role") {
      userRoleContainer.classList.remove("hidden");
      createAwardContainer.classList.add("hidden");
      editAwardContainer.classList.add("hidden");
    } else if (type == "upload") {
      userRoleContainer.classList.add("hidden");
      createAwardContainer.classList.remove("hidden");
      editAwardContainer.classList.add("hidden");
    } else {
      userRoleContainer.classList.add("hidden");
      createAwardContainer.classList.add("hidden");
      sortContainer.classList.remove("hidden");
      editAwardContainer.classList.remove("hidden");

      getAward();
    }
  });

  function clickedStyle(element) {
    let typeElements = document.querySelectorAll(".swiper-slide");
    for (let typeElement of typeElements) {
      typeElement.classList.remove("clicked");
    }
    element.classList.add("clicked");
  }
}

/*----------------get award:-----------------------------*/
async function getAward() {
  let sorting = document.querySelector(".sort-select").value;
  let res = await fetch(`/award?sorting=${sorting}`);
  let result = await res.json();
  if (result.success) {
    let awards = result.data;
    if (awards.length < 1) {
      awardArea.innerHTML = `沒有紀錄`;
      return;
    }
    awardArea.innerHTML = ``;
    for (let award of awards) {
      createAwardDiv(award);
    }
  } else {
    Swal.fire("", result.msg, result.success ? "success" : "error");
  }
}

function createAwardDiv(award) {
  let awardTemplate = document
    .querySelector("#awardTemplate")
    .content.cloneNode(true);
  awardTemplate.querySelector("#image").src = `https://guessmap.image.bonbony.one/${award.image}`;
  awardTemplate.querySelector("#title").textContent = award.name;
  awardTemplate.querySelector("#score").textContent = award.score;
  awardTemplate.querySelector("#quantity").textContent = award.quantity;
  awardTemplate.querySelector("#quota").textContent = award.quota;
  let nonEditElm = awardTemplate.querySelector("#non-edit");
  let editElm = awardTemplate.querySelector("#edit");
  awardTemplate.querySelector(".fa-edit").addEventListener("click", () => {
    nonEditElm.classList.toggle("hidden");
    editElm.classList.toggle("hidden");
    let cards = document.querySelectorAll(".card-body");
    for (let card of cards) {
      card.style = " height: 18rem";
    }
  });

  awardTemplate
    .querySelector(".fa-trash-alt")
    .addEventListener("click", async () => {
      let res = await fetch(`/award?awardId=${award.id}`, {
        method: "DELETE",
      });
      let result = await res.json();

      if (result.success) {
        Swal.fire("", result.msg, result.success ? "success" : "error");
        getAward();
      }
    });
  awardTemplate.querySelector("#edit-image").src = `https://guessmap.image.bonbony.one/${award.image}`;
  awardTemplate.querySelector("#edit-name").value = award.name;
  awardTemplate.querySelector("#edit-score").value = award.score;
  awardTemplate.querySelector("#edit-quantity").value = award.quantity;
  let editForm = awardTemplate.querySelector("#edit-award-form");

  let result = awardTemplate.querySelector("#edit-image");
  let uploadField = awardTemplate.querySelector(".upload-btn-wrapper");

  // on change show image with crop options
  uploadField.addEventListener("change", (e) => {
    if (e.target.files.length) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target.result) {
          result.src = e.target.result;
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();


    let formData = new FormData(editForm);
    if (!formData.get("image").name) {
      formData.delete("image");
  }
    let res = await fetch(`/award?awardId=${award.id}`, {
      method: "PUT",
      body: formData,
    });
    let result = await res.json();

    if (result.success) {
      Swal.fire("", "變更成功", result.success ? "success" : "error");
      setTimeout(() => {
        getAward();
    }, 1000);
    }
  });

  awardTemplate.querySelector("#cancel-btn").addEventListener("click", () => {
    nonEditElm.classList.toggle("hidden");
    editElm.classList.toggle("hidden");
  });

  awardArea.appendChild(awardTemplate);
}

document.querySelector(".sort-select").addEventListener("change", () => {
  getAward();
});

// ******** create award ********************************************************** //
//-------------review upload-----------------
let fileInput = document.querySelector(".upload-btn-wrapper input");
let reviewDiv = document.querySelector(".image-review");
fileInput.addEventListener("change", (e) => {
  document.querySelector(".image-review").innerHTML = ``;
  if (e.target.files.length) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.result) {
        reviewDiv.style.backgroundImage = `url(${e.target.result})`;
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});
/*----------------submit create award-----------------------------*/
createAwardForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let formData = new FormData(createAwardForm);
  let res = await fetch(`/award`, { method: "POST", body: formData });
  let result = await res.json();
  if (result.success) {
    Swal.fire("", result.msg, result.success ? "success" : "error");
    createAwardForm.reset();
    document.querySelector(".image-review").style.backgroundImage = ``;
    document.querySelector(
      ".image-review"
    ).innerHTML = `<i class="fas fa-plus"></i>`;
  }
});

// ******** Search User ********************************************************** //

//----- Search and Show user-----//
const searchUserForm = document.querySelector("#search-user");
const searchUserInfo = document.querySelector("#searchUserInput");
const showUserInfo = document.querySelector("#show-user-info");

searchUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showUserInfo.innerText = "";
  const form = event.target;
  const userObj = { searchText: form.searchUserInput.value };

  const res = await fetch("/search/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userObj),
  });
  const result = await res.json();

  for (let user of result.data) {
    let userTemplate = document
      .querySelector("#user-template")
      .content.cloneNode(true);
    userTemplate.querySelector("img").src = user.profile_image
      ? `https://guessmap.image.bonbony.one/${user.profile_image}`
      : "https://guessmap.image.bonbony.one/anonymous.jpg";
    userTemplate.querySelector(".nameDiv span").textContent = user.name;
    userTemplate.querySelector(".emailDiv span").textContent = user.email;
    userTemplate.querySelector(".roleDiv span").textContent =
      user.role == "user" ? "玩家" : "管理員";
    userTemplate
      .querySelector(".userContainer")
      .addEventListener("click", (e) => {
        e.currentTarget.classList.toggle("userSelected");
      });
    showUserInfo.appendChild(userTemplate);
  }
});

// ---------- Upgrade User --------- //
document.querySelector("#upgradeUser").addEventListener("click", async () => {
  const selectedUserElms = document.querySelectorAll(".userSelected");

  let allEmailArray = [];
  for (let elms of selectedUserElms) {
    allEmailArray.push(elms.querySelector(".emailDiv span").textContent);
  }

  const res = await fetch("/user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ allEmailArray }),
  });

  let result = await res.json();
  if (result.success) {
    showUserInfo.innerText = "";
  }
  Swal.fire("", result.msg, result.success ? "success" : "error");
});
//----------logout------------
document
  .querySelector("#logout-btn")
  .addEventListener("click", async (event) => {
    const res = await fetch("/logout", { method: "POST" });
    const result = await res.json();
    if (result.success) {
      window.location = "/login.html";
    } else {
      Swal.fire("", result.msg, result.success ? "success" : "error");
    }
  });
