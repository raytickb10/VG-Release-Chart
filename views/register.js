<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {
  font-family: Arial, Helvetica, sans-serif;
  background-image:url("gaming-controller-wallpaper.jpg");
  background-position: 50% 0%;
  background-attachment: fixed;
  background-blend-mode: hard-light;
  background-color: #27496d;
}

* {
  box-sizing: border-box;
}

/* Add padding to containers */
.container {
  padding: 16px;
  background-color: white;
}

/* Full-width input fields */
input[type=text], input[type=password] {
  width: 100%;
  padding: 15px;
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}

/* Overwrite default styles of hr */
hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Set a style for the submit button */
.registerbtn {
  background-color: #366492;
  color: white;
  padding: 16px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
  opacity: 0.9;
}

.registerbtn:hover {
  opacity: 1;
}

/* Add a blue text color to links */
a {
  color: dodgerblue;
}

/* Set a grey background color and center the text of the "sign in" section */
.signin {
  background-color: #f1f1f1;
  text-align: center;
}
</style>
  
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  
</head>
<body>

  <div class="container">
    <h1>Register</h1>
    <p>Please fill in this form to create an account.</p>
    <hr>
    
    <form id="myForm" >
      <label for="username"><b>Username</b></label>
      <input type="text" placeholder="Enter username" name="username" id="username" required>

      <label for="psw"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" name="password" id="psw" required>

      <label for="psw-repeat"><b>Repeat Password</b></label>
      <input type="password" placeholder="Repeat Password" name="password" id="psw_repeat" required>
    <hr>

      <button type="submit" class="registerbtn">Register</button>
    </form>
  </div>
  
  <div class="container signin">
    <p>Already have an account? <a href="javascript:sendToLogin()">Sign in</a>.</p>
    <p>Or return to homepage. <a href="/">Return Home</a>.</p>
  </div>
 
<script>
  
let searchedname;
let searchedpass;
  
function sendToLogin(){
  localStorage.clear();
  window.location.href = "/login";
}

function submitRegister(userName, passWord){
  $.ajax({
    url: "/api/users/",
    data: JSON.stringify({
      "username" : `${userName}`, 
      "password": `${passWord}`,
      }),
    contentType: 'application/json',
    dataType:'json',
    type:'POST',
    success: function(){
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }).done(console.log);
  console.log(userName, passWord);
}
  
function formSubmit() { 
  $('#myForm').on('submit', function(event){ 
    event.preventDefault();
    $('.errorMessage').html(''); 
    let name = $('#username');
    let pass = $('#psw');
    let passtwo = $('#psw_repeat');
    let fullName = name.val().trim();
    let fullPass = pass.val().trim();
    let fullRepeat = passtwo.val().trim();
    name.val('')
    pass.val('')
    passtwo.val('')
    if (!fullName.length)
      return generateError(errorMessages.noInput);
    $('.loaderDiv').show();
    if(fullPass == fullRepeat)
    {
      searchedname = fullName;
      searchedpass = fullPass;
      submitRegister(searchedname, searchedpass);
    }
    else
    {
      window.alert('Password and repeat password do not match!');
    }
  });
}
  
$(function(){
  formSubmit();
});
  
</script>

  
</body>
</html>
