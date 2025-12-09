function checkAuth(){
  const token = localStorage.getItem("auth");
  if(!token){
    location.href="login.html";
  }
}

function getRole(){
  return localStorage.getItem("role");
}

function protectAdmin(){
  if(getRole() !== "ADMIN"){
    Swal.fire("Acceso denegado","Solo admin","error");
    setTimeout(()=> location.href="alumnos.html", 2000);
  }
}

function logout(){
  localStorage.clear();
  location.href="login.html";
}
