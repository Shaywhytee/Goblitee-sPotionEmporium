document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById("login");
  loginBtn.addEventListener("click", function() {
    window.location.href = "login.html"
  });
});
const form = document.querySelector('.account_creation_wrapper');
const emailInput = document.querySelector('#email_input');
const passwordInput = document.querySelector('#password_input');
const vpasswordInput = document.querySelector('#vpassword_input');
const createAccountButton = document.querySelector('#create_account')
createAccountButton.addEventListener('click', () => {
  if (passwordInput.value !== vpasswordInput.value) {
    alert('Passwords do not match');
    return;    
  }if (emailInput.value === "" || passwordInput.value === "" || vpasswordInput.value === "") {
    alert("All fields are required")
    return;
  }
  const xhr = new XMLHttpRequest
  xhr.open('POST', 'http://127.0.0.1:5000/account/create')
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = () => {
    if (xhr.status === 200) {
      alert('Account created successfully');
      window.location.href = '/login';
    } else if (xhr.status === 400) {
      alert('Email already exists');
    } else {
      alert('Error creating account');
    };
  };
  xhr.send(JSON.stringify({
    player_email: emailInput.value,
    player_password: passwordInput.value,
    account_creation_date: new Date().toISOString(),
    account_status: true
  }));
});

function validatePassword() {
  if (passwordInput.value !== vpasswordInput.value) {
    vpasswordInput.setCustomValidity('Passwords do not match');
  } else {
    vpasswordInput.setCustomValidity('');
  }
}
