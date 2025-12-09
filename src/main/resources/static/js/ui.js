function toast(msg,type="info"){
  Swal.fire({
    toast:true,
    icon:type,
    title:msg,
    timer:2000,
    position:"top-end",
    showConfirmButton:false
  });
}

function confirmDelete(){
  return Swal.fire({
    title:"¿Seguro?",
    text:"Esta acción no se puede deshacer",
    icon:"warning",
    showCancelButton:true,
    confirmButtonText:"Sí, eliminar",
    cancelButtonText:"Cancelar",
    confirmButtonColor:"#d33"
  });
}

function toggleTheme(){
  const current = localStorage.getItem("theme") || "light";
  const next = current === "light" ? "dark":"light";
  localStorage.setItem("theme", next);
  document.documentElement.setAttribute("data-theme", next);
}

function loadTheme(){
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
}
loadTheme();
