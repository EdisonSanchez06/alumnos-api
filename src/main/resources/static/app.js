// ======================================================================
// =============== CONFIG GLOBAL ========================================
// ======================================================================

const API_BASE = "https://alumnos-api-e65o.onrender.com";
const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";

let modalCrear;
let modalEditar;



// ======================================================================
// =============== HEADERS ===============================================
// ======================================================================

function getHeaders() {
  const token = localStorage.getItem("auth");

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = token;
  }

  return headers;
}



// ======================================================================
// =============== SESION ===============================================
// ======================================================================

function logout() {
  localStorage.clear();
  location.href = "login.html";
}



// ======================================================================
// =============== ALERTAS ==============================================
// ======================================================================

function mostrarAlerta(msg, tipo = "primary") {
  const div = document.getElementById("alerta");
  if (!div) return;

  div.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}



// ======================================================================
// =============== CRUD ALUMNOS ==========================================
// ======================================================================

// abrir modal crear
function abrirModalNuevo() {
  modalCrear.show();
}


// ------ CREAR ------
async function crearAlumno(e) {
  e.preventDefault();

  const form = e.target;

  const data = {
    estCed: form.estCed.value,
    estNom: form.estNom.value,
    estApe: form.estApe.value,
    estDir: form.estDir.value,
    estTel: form.estTel.value
  };

  const res = await fetch(API_ALUMNOS, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    mostrarAlerta("Error guardando alumno", "danger");
    return;
  }

  modalCrear.hide();
  listarAlumnos();
  form.reset();
  mostrarAlerta("Alumno registrado", "success");
}



// ------ LISTAR ------
async function listarAlumnos() {
  const tbody = document.getElementById("tbody-alumnos");
  if (!tbody) return;

  const res = await fetch(API_ALUMNOS, { headers: getHeaders() });

  if (res.status === 401) return logout();

  if (!res.ok) {
    mostrarAlerta("Error cargando alumnos", "danger");
    return;
  }

  const data = await res.json();

  renderTabla(data);
}



// ------ BUSCAR ------
async function buscarAlumno(e) {
  e.preventDefault();

  const ced = document.getElementById("buscarCed").value.trim();

  if (ced === "") {
    listarAlumnos();
    return;
  }

  const res = await fetch(API_ALUMNOS + "/" + ced, {
    headers: getHeaders()
  });

  if (!res.ok) {
    mostrarAlerta("Alumno no encontrado", "warning");
    return;
  }

  const a = await res.json();

  renderTabla([a]);
}



// ------ RENDER TABLA ------
function renderTabla(data) {

  const tbody = document.getElementById("tbody-alumnos");

  tbody.innerHTML = data.map(a => `
     <tr>
      <td>${a.estCed}</td>
      <td>${a.estNom}</td>
      <td>${a.estApe}</td>
      <td>${a.estTel}</td>
      <td>${a.estDir}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-1" onclick="cargarEditarAlumno('${a.estCed}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
      </td>
    </tr>
  `).join("");
}



// ------ CARGAR EDITAR ------
async function cargarEditarAlumno(ced) {
  const res = await fetch(API_ALUMNOS + "/" + ced, { headers: getHeaders() });

  const a = await res.json();

  document.getElementById("editCed").value = a.estCed;
  document.getElementById("editNom").value = a.estNom;
  document.getElementById("editApe").value = a.estApe;
  document.getElementById("editTel").value = a.estTel;
  document.getElementById("editDir").value = a.estDir;

  modalEditar.show();
}



// ------ EDITAR ------
async function editarAlumno(e) {
  e.preventDefault();

  const ced = document.getElementById("editCed").value;

  const body = {
    estNom: document.getElementById("editNom").value,
    estApe: document.getElementById("editApe").value,
    estTel: document.getElementById("editTel").value,
    estDir: document.getElementById("editDir").value
  };

  await fetch(API_ALUMNOS + "/" + ced, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  modalEditar.hide();
  listarAlumnos();
  mostrarAlerta("Alumno actualizado", "success");
}



// ------ ELIMINAR ------
async function eliminarAlumno(ced) {
  if (!confirm("¿Eliminar alumno?")) return;

  await fetch(API_ALUMNOS + "/" + ced, {
    method: "DELETE",
    headers: getHeaders()
  });

  listarAlumnos();
}



// ======================================================================
// ========================== AUTO INIT =================================
// ======================================================================

document.addEventListener("DOMContentLoaded", () => {

  const rol = localStorage.getItem("role");
  const pagina = window.location.pathname.toLowerCase().split("/").pop();

  if (pagina === "login.html" || pagina === "") return;

  if (!rol) return logout();



  // ========= SECRETARIA =========
  if (rol === "SECRETARIA") {

    // ocultar boton inicio
    const btnInicio = document.getElementById("btn-inicio");
    if (btnInicio) btnInicio.style.display = "none";
  }


  // ========= NAVBAR =========
  const usuarioSpan = document.getElementById("usuario-actual");
  if (usuarioSpan) usuarioSpan.textContent = localStorage.getItem("user");


  // ========= MODALES =========
  const mc = document.getElementById("modalCrear");
  if (mc) modalCrear = new bootstrap.Modal(mc);

  const me = document.getElementById("modalEditar");
  if (me) modalEditar = new bootstrap.Modal(me);


  // ========= ALUMNOS =========
  if (document.getElementById("tbody-alumnos")) {
    listarAlumnos();
  }

});
