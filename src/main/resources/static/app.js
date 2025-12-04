// ======================================================================
// =============== CONFIG GLOBAL ========================================
// ======================================================================

// URL de tu backend Spring Boot
const API_BASE = "http://localhost:8080";

// ENDPOINTS reales del backend
const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";
const API_LOGIN = API_BASE + "/auth/login";
const API_USERS = API_BASE + "/auth/register";

let modalCrear;
let modalEditar;


// ======================================================================
// =============== HEADERS ===============================================
// ======================================================================

function getHeaders() {
  const token = localStorage.getItem("auth");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = "Basic " + token;
  }

  return headers;
}


// ======================================================================
// =============== SESION ===============================================
// ======================================================================

function logout() {
  localStorage.removeItem("auth");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
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
  const token = btoa(username + ":" + password);

  try {
    const res = await fetch(API_LOGIN, {
      method: "GET",
      headers: { "Authorization": "Basic " + token }
    });

    if (!res.ok) {
      mostrarAlerta("Credenciales incorrectas", "danger");
      return;
    }

    const data = await res.json();

    // guardar sesión
    localStorage.setItem("auth", token);
    localStorage.setItem("user", data.user);
    localStorage.setItem("role", data.role);

    const rol = (data.role || "").toLowerCase();

    // redireccionar por rol
    if (rol === "admin") {
      location.href = "index.html";
    } else {
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

async function listarAlumnos() {
  const tbody = document.getElementById("tbody-alumnos");
  if (!tbody) return;

  const res = await fetch(API_ALUMNOS, {
    method: "GET",
    headers: getHeaders()
  });

  if (res.status === 401) return logout();

  if (!res.ok) {
    mostrarAlerta("Error obteniendo alumnos", "danger");
    return;
  }

  const alumnos = await res.json();

  tbody.innerHTML = alumnos.map(a => `
     <tr>
      <td>${a.estCed}</td>
      <td>${a.estNom}</td>
      <td>${a.estApe}</td>
      <td>${a.estTel}</td>
      <td>${a.estDir}</td>
      <td class="text-center admin-only">
        <button class="btn btn-sm btn-warning me-1 admin-only" onclick="cargarEditarAlumno('${a.estCed}')">Editar</button>
        <button class="btn btn-sm btn-danger admin-only" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
      </td>
    </tr>
  `).join("");
}


// ======================================================================
// ========================= CRUD CURSOS ================================
// ======================================================================

async function cargarCursos() {
  const tbody = document.getElementById("cursos-table");
  if (!tbody) return;

  const res = await fetch(API_CURSOS, {
    headers: getHeaders()
  });

  if (res.status === 401) return logout();

  if (!res.ok) {
    mostrarAlerta("Error obteniendo cursos", "danger");
    return;
  }

  const cursos = await res.json();

  tbody.innerHTML = cursos.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.alumnoCed || ""}</td>
      <td>${c.alumnoNombreCompleto || ""}</td>
      <td class="text-center admin-only">
        <button class="btn btn-sm btn-warning me-1 admin-only" onclick="cargarEditarCurso(${c.id})">Editar</button>
        <button class="btn btn-sm btn-danger admin-only" onclick="eliminarCurso(${c.id})">Eliminar</button>
      </td>
    </tr>
  `).join("");
}


// ======================================================================
// ========================== AUTO INIT =================================
// ======================================================================

document.addEventListener("DOMContentLoaded", () => {

  const rol = (localStorage.getItem("role") || "").toLowerCase();
  const pagina = window.location.pathname.toLowerCase().split("/").pop();

  // ============================================================
  // NO VALIDAR NADA EN LOGIN.HTML
  // ============================================================
  if (pagina === "login.html" || pagina === "") return;

  // ============================================================
  // VALIDAR SESIÓN
  // ============================================================
  if (!rol) {
    location.href = "login.html";
    return;
  }

  // ============================================================
  // SECRETARIA: SOLO PUEDE VER alumnos.html
  // ============================================================
  if (rol === "secretaria") {

    if (pagina !== "alumnos.html") {
      location.href = "alumnos.html";
      return;
    }

    // Ocultar botones admin
    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "none");
  }

  // ============================================================
  // MOSTRAR NOMBRE EN NAV
  // ============================================================
  const usuarioSpan = document.getElementById("usuario-actual");
  if (usuarioSpan) usuarioSpan.textContent = localStorage.getItem("user") || "";

  // ============================================================
  // MODALES
  // ============================================================
  const mc = document.getElementById("modalCrear");
  if (mc) modalCrear = new bootstrap.Modal(mc);

  const me = document.getElementById("modalEditar");
  if (me) modalEditar = new bootstrap.Modal(me);

  // ============================================================
  // ALUMNOS
  // ============================================================
  if (document.getElementById("tbody-alumnos")) listarAlumnos();

  // ============================================================
  // CURSOS (solo admin)
  // ============================================================
  if (rol === "admin" && document.getElementById("cursos-table")) {
    cargarCursos();
    cargarAlumnosCombo("curso-alumno");
    cargarAlumnosCombo("editAlumno");
  }
});
