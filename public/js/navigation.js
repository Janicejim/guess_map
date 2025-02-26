getUserInfo();
// Menu
const overlay = document.getElementById("overlay");
const closeMenu = document.getElementById("close-menu");

document.getElementById("open-menu").addEventListener("click", function () {
  overlay.classList.add("show-menu");
});

document.getElementById("close-menu").addEventListener("click", function () {
  overlay.classList.remove("show-menu");
});

//Back to top button
var toTopButton = document.getElementById("back_to_top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    toTopButton.style.display = "block";
  } else {
    toTopButton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $("header").outerHeight();

$(window).scroll(function (event) {
  didScroll = true;
});

setInterval(function () {
  if (didScroll) {
    hasScrolled();
    didScroll = false;
  }
}, 250);

function hasScrolled() {
  var st = $(this).scrollTop();
  if (Math.abs(lastScrollTop - st) <= delta) return;

  if (st > lastScrollTop && st > navbarHeight) {
    // scroll Down
    $("header").removeClass("nav-down").addClass("nav-up");
  } else {
    // scroll Up
    if (st + $(window).height() < $(document).height()) {
      $("header").removeClass("nav-up").addClass("nav-down");
    }
  }

  lastScrollTop = st;
}

// ----------- get current user
async function getUserInfo() {
  const res = await fetch("/user");
  const result = await res.json();

  const signinDiv = document.querySelector("#signin-btn");
  const logoutDiv = document.querySelector("#logout-btn");
  const profileDiv = document.querySelector("#profile-btn");
  const adminDiv = document.querySelector("#admin-btn");
  const userInfoDiv = document.querySelector("#current-user");

  if (result.success) {
    let user = result.data.user;
    signinDiv.classList.remove("show");
    signinDiv.classList.add("hide");

    profileDiv.classList.remove("hide");
    profileDiv.classList.add("show");
    logoutDiv.classList.remove("hide");
    logoutDiv.classList.add("show");

    userInfoDiv.innerHTML = `<div>你好 ${
      user.name || result.user.email
    }</div>     <div id="user_score">積分：${user.total_score}</div>`;

    if (user.role == "admin") {
      adminDiv.classList.remove("hide");
      adminDiv.classList.add("show");
    } else {
      adminDiv.classList.remove("show");
      adminDiv.classList.add("hide");
    }
  } else {
    signinDiv.classList.remove("hide");
    signinDiv.classList.add("show");

    profileDiv.classList.remove("show");
    profileDiv.classList.add("hide");
    logoutDiv.classList.remove("show");
    logoutDiv.classList.add("hide");

    userInfoDiv.innerHTML = "";
  }
}

//----------  logout btn DOM ------------//
document
  .querySelector("#logout-btn")
  .addEventListener("click", async (event) => {
    const res = await fetch("/logout", { method: "POST" });
    const result = await res.json();
    if (result.success) {
      window.location = "/";
    } else {
      Swal.fire("", result.msg, result.success ? "success" : "error");
    }
  });
const socket = io.connect();

socket.on("update user score", () => {
  getUserInfo();
});
