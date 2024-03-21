//load navbar
// $(function () {
//   $("#navbar").load("/navigation.html");
// });

//login form
document
  .querySelector("#login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

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
    if (!result.success) {
      document.querySelector("#message").textContent = result.msg;
      setTimeout(() => {
        document.querySelector("#message").textContent = "";
      }, 1000);
      return;
    }

    let role = result.data;
    if (role && role == "admin") {
      window.location = "/admin.html";
    } else if (role && role == "user") {
      window.location = "/";
    }
  });

document.querySelector("#sign-up").addEventListener("click", () => {
  window.location = "/register.html";
});
