//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

//login form
document
  .querySelector("#login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const form = event.target;
      const body = {
        email: form.email.value,
        password: form.password.value,
      };
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.error) {
        if (result.error == "Email doesn't exist") {
          document.querySelector("#Alert").innerHTML = "Email doesn't exist";
        } else {
          document.querySelector("#Alert").innerHTML = "Password Incorrect";
        }
      }
      if (result.role && result.role == "admin") {
        window.location = "/admin.html";
      } else if (result.role && result.role == "user") {
        window.location = "/";
      }
    } catch (error) {
      console.log("error: ", error);
    }
  });

document.querySelector("#sign-up").addEventListener("click", () => {
  window.location = "/register.html";
});
