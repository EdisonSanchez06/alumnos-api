// ======================================================================
// =============== CONFIG GLOBAL ========================================
// ======================================================================

// URL de tu backend Spring Boot
const API_BASE = "https://alumnos-api-e65o.onrender.com";

// ENDPOINTS reales del backend
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
    headers["Authorization"] = token; // ya contiene "Basic xxxxxx"
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

// LOGIN usando Basic Auth
async function login(e) {
  e.preventDefault();

  const username = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;
  const auth = "Basic " + btoa(username + ":" + password);

  try {
    // pedimos listádo (solo para validar)
    const res = await fetch(API_ALUMNOS, {
      method: "GET",
      headers: {
        "Authorization": auth
      }
    });

    if (!res.ok) {
      mostrarAlerta("Credenciales incorrectas", "danger");
      return;
    }

    // Guardar sesión local
    localStorage.setItem("auth", auth);
    localStorage.setItem("user", username);

    // determinar rol por usuario (temporal)
    if (username === "admin") {
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
        <button class="btn btn-sm btn-warning me-1 admin-only">Editar</button>
        <button class="btn btn-sm btn-danger admin-only">Eliminar</button>
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
        <button class="btn btn-sm btn-warning me-1 admin-only">Editar</button>
        <button class="btn btn-sm btn-danger admin-only">Eliminar</button>
      </td>
    </tr>
  `).join("");
}


// ======================================================================
// ========================== AUTO INIT =================================
// ======================================================================

document.addEventListener("DOMContentLoaded", () => {

  const rol = localStorage.getItem("role");
  const pagina = window.location.pathname.toLowerCase().split("/").pop();

  // NO validar en login
  if (pagina === "login.html" || pagina === "") return;

  // VALIDAR SESION
  if (!rol) {
    location.href = "login.html";
    return;
  }

  // SECRETARIA: SOLO alumnos.html
  if (rol === "SECRETARIA") {

    if (pagina !== "alumnos.html") {
      location.href = "alumnos.html";
      return;
    }

    // ocultar botones admin
    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "none");
  }

  // MOSTRAR USUARIO EN NAV
  const usuarioSpan = document.getElementById("usuario-actual");
  if (usuarioSpan) usuarioSpan.textContent = localStorage.getItem("user") || "";

  // MODALES
  const mc = document.getElementById("modalCrear");
  if (mc) modalCrear = new bootstrap.Modal(mc);

  const me = document.getElementById("modalEditar");
  if (me) modalEditar = new bootstrap.Modal(me);

  // ALUMNOS
  if (document.getElementById("tbody-alumnos")) listarAlumnos();

  // CURSOS solo admin
  if (rol === "ADMIN" && document.getElementById("cursos-table")) {
    cargarCursos();
  }
});
