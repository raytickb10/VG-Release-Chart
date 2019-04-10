$(function checkingTokens(){
  if(localStorage.getItem('token') != null){
    console.log("There is a token present");
    document.getElementById("wishListButton").disabled = false;
    document.getElementById("logoutButton").disabled = false;
    document.getElementById("loginButton").disabled = true;
    
    document.getElementById("wishListButton").style.visibility = "visible";
    document.getElementById("logoutButton").style.visibility = "visible";
    document.getElementById("loginButton").style.visibility = "hidden";
    document.getElementById("welcome_text").textContent = "Welcome, " + localStorage.getItem("userName");
    document.getElementById("welcome_text").style.visibility = "visible";
  }
  else if (localStorage.getItem('token') == null){
    console.log("No token present");
    document.getElementById("logoutButton").disabled = true;
    document.getElementById("wishListButton").disabled = true;
    document.getElementById("loginButton").disabled = false;
    
    document.getElementById("logoutButton").style.visibility = "hidden";
    document.getElementById("wishListButton").style.visibility = "hidden";
    document.getElementById("loginButton").style.visibility = "visible";
    document.getElementById("welcome_text").style.visibility = "hidden";
  }
});

function clearToken(){
  localStorage.clear();
  window.location.href = "/";
}
