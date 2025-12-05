// ======================================================================
// =============== CONFIG GLOBAL ========================================
// ======================================================================

// URL del backend
const API_BASE = "https://alumnos-api-e65o.onrender.com";

// ENDPOINTS
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
// ======================= LOGIN ========================================
// ======================================================================

async function login(e) {
  e.preventDefault();

  const username = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  const auth = "Basic " + btoa(username + ":" + password);

  try {
    const res = await fetch(API_ALUMNOS, {
      method: "GET",
      headers: { "Authorization": auth }
    });

    if (!res.ok) {
      mostrarAlerta("Credenciales incorrectas", "danger");
      return;
    }

    localStorage.setItem("auth", auth);
    localStorage.setItem("user", username);

    // detectar rol correcto
    if (username.toLowerCase() === "admin") {
      localStorage.setItem("role", "ADMIN");
      location.href = "index.html";
    } else {
      localStorage.setItem("role", "SECRETARIA");
      location.href = "alumnos.html";
    }

  } catch (err) {
    mostrarAlerta("Error conectando con el servidor", "danger");
    console.error(err);
  }
}



// ======================================================================
// =============== CRUD ALUMNOS ==========================================
// ======================================================================

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

  const res = await fetch(API_ALUMNOS, {
    headers: getHeaders()
  });

  if (res.status === 401) return logout();

  if (!res.ok) {
    mostrarAlerta("Error cargando alumnos", "danger");
    return;
  }

  const data = await res.json();

  tbody.innerHTML = data.map(a => `
     <tr>
      <td>${a.estCed}</td>
      <td>${a.estNom}</td>
      <td>${a.estApe}</td>
      <td>${a.estTel}</td>
      <td>${a.estDir}</td>
      <td class="text-center admin-only">
        <button class="btn btn-sm btn-warning me-1" onclick="cargarEditarAlumno('${a.estCed}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
      </td>
    </tr>
  `).join("");
}


// ------ CARGAR EDITAR ------
async function cargarEditarAlumno(ced) {
  const res = await fetch(API_ALUMNOS + "/" + ced, {
    headers: getHeaders()
  });

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

  const res = await fetch(API_ALUMNOS + "/" + ced, {
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
// ========================= CRUD CURSOS ================================
// ======================================================================


async function cargarAlumnosCombo(id) {
  const sel = document.getElementById(id);
  if (!sel) return;

  const res = await fetch(API_ALUMNOS, {
    headers: getHeaders()
  });

  const data = await res.json();

  sel.innerHTML = data.map(a =>
    `<option value="${a.estCed}">${a.estNom} ${a.estApe}</option>`
  ).join("");
}


// ------ LISTAR CURSOS ------
async function cargarCursos() {
  const tbody = document.getElementById("cursos-table");
  if (!tbody) return;

  const res = await fetch(API_CURSOS, {
    headers: getHeaders()
  });

  const cursos = await res.json();

  tbody.innerHTML = cursos.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.alumnoCed}</td>
      <td>${c.alumnoNombreCompleto}</td>
      <td class="text-center admin-only">
        <button onclick="cargarEditarCurso(${c.id})" class="btn btn-sm btn-warning me-1">Editar</button>
        <button onclick="eliminarCurso(${c.id})" class="btn btn-sm btn-danger">Eliminar</button>
      </td>
    </tr>
  `).join("");
}


// ------ CREAR ------
async function crearCurso(e) {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("curso-nombre").value,
    alumnoCed: document.getElementById("curso-alumno").value
  };

  const res = await fetch(API_CURSOS, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  modalCrear.hide();
  cargarCursos();
  mostrarAlerta("Curso creado", "success");
}


// ------ CARGAR EDITAR ------
async function cargarEditarCurso(id) {
  const res = await fetch(API_CURSOS + "/" + id, {
    headers: getHeaders()
  });

  const c = await res.json();

  document.getElementById("editId").value = c.id;
  document.getElementById("editNombre").value = c.nombre;
  document.getElementById("editAlumno").value = c.alumnoCed;

  modalEditar.show();
}


// ------ EDITAR ------
async function editarCurso(e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;

  const data = {
    nombre: document.getElementById("editNombre").value,
    alumnoCed: document.getElementById("editAlumno").value
  };

  await fetch(API_CURSOS + "/" + id, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  modalEditar.hide();
  cargarCursos();
  mostrarAlerta("Curso actualizado", "success");
}


// ------ ELIMINAR ------
async function eliminarCurso(id) {
  if (!confirm("¿Eliminar curso?")) return;

  await fetch(API_CURSOS + "/" + id, {
    method: "DELETE",
    headers: getHeaders()
  });

  cargarCursos();
}



// ======================================================================
// ========================== AUTO INIT =================================
// ======================================================================

document.addEventListener("DOMContentLoaded", () => {

  const rol = localStorage.getItem("role");
  const pagina = window.location.pathname.toLowerCase().split("/").pop();

  if (pagina === "login.html" || pagina === "") return;

  // SESIÓN
  if (!rol) return logout();


  // ========= RESTRICCIONES SECRETARIA ==========
  if (rol === "SECRETARIA") {

    if (pagina !== "alumnos.html") {
      location.href = "alumnos.html";
      return;
    }

    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "none");
  }


  // ========= NAVBAR ==========
  const usuarioSpan = document.getElementById("usuario-actual");
  if (usuarioSpan) usuarioSpan.textContent = localStorage.getItem("user");


  // ========= MODALES ==========
  const mc = document.getElementById("modalCrear");
  if (mc) modalCrear = new bootstrap.Modal(mc);

  const me = document.getElementById("modalEditar");
  if (me) modalEditar = new bootstrap.Modal(me);


  // ========= ALUMNOS ==========
  if (document.getElementById("tbody-alumnos")) {
    listarAlumnos();
  }


  // ========= CURSOS (solo admin) ==========
  if (rol === "ADMIN" && document.getElementById("cursos-table")) {
    cargarAlumnosCombo("curso-alumno");
    cargarAlumnosCombo("editAlumno");
    cargarCursos();
  }

});
