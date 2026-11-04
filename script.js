const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");
const switchText = document.getElementById("switchText");
const loginText = document.getElementById("loginText");

document.getElementById("showRegister").addEventListener("click", function (event) {
    event.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    switchText.classList.add("hidden");
    loginText.classList.remove("hidden");
    formTitle.textContent = "Create Account";
    message.textContent = "";
});

document.getElementById("showLogin").addEventListener("click", function (event) {
    event.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    loginText.classList.add("hidden");
    switchText.classList.remove("hidden");
    formTitle.textContent = "Login";
    message.textContent = "";
});

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const user = {
        name: document.getElementById("regName").value,
        email: document.getElementById("regEmail").value,
        phone: document.getElementById("regPhone").value,
        password: document.getElementById("regPassword").value
    };

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });
        const result = await response.json();
        message.textContent = result.message;

        if (response.ok) {
            registerForm.reset();
            registerForm.classList.add("hidden");
            loginForm.classList.remove("hidden");
            loginText.classList.add("hidden");
            switchText.classList.remove("hidden");
            formTitle.textContent = "Login";
        }
    } catch (error) {
        message.textContent = "Could not connect to the server";
    }
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const details = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    };

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(details)
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("loggedIn", "yes");
            window.location.href = "portfolio.html";
        } else {
            message.textContent = result.message;
        }
    } catch (error) {
        message.textContent = "Could not connect to the server";
    }
});
