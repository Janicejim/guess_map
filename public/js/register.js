//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

//register

document
  .querySelector("#register-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const form = event.target;
      const userForm = {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
      };

      const res = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      });
      const result = await res.json();
      if (result == false) {
        form.reset();
        document.querySelector("#register-failure").innerHTML =
          "Name or Email have been used.";
      } else {
        alert("注冊成功");
        window.location = "/login.html";
      }
      // console.log('result', result);
    } catch (error) {
      console.log("error", error);
    }
  });

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
