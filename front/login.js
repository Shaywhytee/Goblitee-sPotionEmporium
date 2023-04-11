// Button Variables
const createAccountButton = document.getElementById("create_account")
const loginButton = document.getElementById("login_button")

// Text Variables
const emailInput = document.getElementById("email_input")
const passwordInput = document.getElementById("password")
const shopTitle = document.getElementById("shop_name")

// Password
function validatePassword() {
    const password = passwordInput.value;
  
    if (password.length < 8) {
      document.getElementById("passwordValidation").innerHTML = "Password must be at least 8 characters long";
    } else if (!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
      document.getElementById("passwordValidation").innerHTML = "Password must contain at least one special character";
    } else if (!password.match(/[A-Z]/)) {
      document.getElementById("passwordValidation").innerHTML = "Password must contain at least one uppercase letter";
    } else if (!password.match(/[a-z]/)) {
      document.getElementById("passwordValidation").innerHTML = "Password must contain at least one lowercase letter";
    } else {
      document.getElementById("passwordValidation").innerHTML = "";
    }
  }

// Login Button Event Listener
loginButton.addEventListener("click", function() {
  const email = emailInput.value;
  const password = passwordInput.value;

  // Login Fetch
  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      player_email: email,
      player_password: password
    })
  })
  .then(response => {
    if (response.ok) {      
      window.location.href = "index.html";
    } else {
      alert("Login failed, please try again");
    }
  })
  .catch(error => {
    console.error("Error:", error);
  });
});