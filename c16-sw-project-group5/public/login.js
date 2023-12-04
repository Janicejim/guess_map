


//login form
document.querySelector("#login-form").addEventListener("submit", async (event) => {
    
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
            body: JSON.stringify(body)
        });
        
        const result = await res.json();
        if (result.error){
            if(result.error == "Email doesn't exist"){
                document.querySelector("#Alert").innerHTML="Email doesn't exist"
            }else{
                document.querySelector("#Alert").innerHTML="Password Incorrect"
            }
        }
        if (result.user) {
            // console.log("login success");
            window.location = "/";
            // window.history.go(-1);
        }
    } catch (error) {
        console.log("error: ",error)

    }

});

document.querySelector("#index-signin").addEventListener("click", () => { window.location = "/login.html"; })

document.querySelector("#index-signup").addEventListener("click", () => { window.location = "/register.html"; })



document.querySelector("#index-logout").addEventListener("click", async (event) => {
    const res = await fetch("/logout");
    const result = await res.json();
    if (result.success) {
        window.location = "/";
    }
});