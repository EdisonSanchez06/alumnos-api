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

  const headers = { "Content-Type": "application/json" };

  if (token) headers["Authorization"] = token;

  return headers;
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
    // Si el API responde ok, el user está autorizado
    const res = await fetch(API_ALUMNOS, {
      method: "GET",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      mostrarAlerta("Credenciales incorrectas", "danger");
      return;
    }

    // Guardar sesión
    localStorage.setItem("auth", auth);
    localStorage.setItem("user", username);

    // Rol basado en username
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

// abrir modal crear alumno
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
  form.reset();
  listarAlumnos();
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
  renderTablaAlumnos(data);
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
  renderTablaAlumnos([a]);
}



// ------ RENDER TABLA ------
function renderTablaAlumnos(data) {

  document.getElementById("tbody-alumnos").innerHTML =
    data.map(a => `
     <tr>
      <td>${a.estCed}</td>
      <td>${a.estNom}</td>
      <td>${a.estApe}</td>
      <td>${a.estTel}</td>
      <td>${a.estDir}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-1" onclick="cargarEditarAlumno('${a.estCed}')">
            Editar
        </button>
        <button class="btn btn-sm btn-danger" onclick="eliminarAlumno('${a.estCed}')">
            Eliminar
        </button>
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
// ==================== CRUD CURSOS =====================================
// ======================================================================

// listar cursos
async function listarCursos() {
  const tbody = document.getElementById("cursos-table");
  if (!tbody) return;

  const res = await fetch(API_CURSOS, { headers: getHeaders() });

  if (!res.ok) {
    mostrarAlerta("Error cargando cursos", "danger");
    return;
  }

  const data = await res.json();
  renderTablaCursos(data);
}



// render cursos
function renderTablaCursos(data) {

  const rol = localStorage.getItem("role");

  document.getElementById("cursos-table").innerHTML =
    data.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.alumnoCed || ""}</td>
        <td>${c.alumnoNombreCompleto || ""}</td>

        <td class="text-center admin-only">
          ${ rol === "ADMIN" ? `
            <button class="btn btn-sm btn-warning me-1" onclick="cargarEditarCurso(${c.id})">
                Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarCurso(${c.id})">
                Eliminar
            </button>
          ` : "" }
        </td>
      </tr>
    `).join("");
}



// crear curso
async function crearCurso(e) {
  e.preventDefault();

  const body = {
    nombre: document.getElementById("curso-nombre").value,
    alumnoCed: document.getElementById("curso-alumno").value
  };

  const res = await fetch(API_CURSOS, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    mostrarAlerta("Error guardando curso", "danger");
    return;
  }

  modalCrear.hide();
  listarCursos();
  mostrarAlerta("Curso guardado", "success");
}



// cargar curso en modal
async function cargarEditarCurso(id) {

  const res = await fetch(API_CURSOS + "/" + id, {
    headers: getHeaders()
  });

  const c = await res.json();

  document.getElementById("editId").value = c.id;
  document.getElementById("editNombre").value = c.nombre;

  await cargarAlumnosEnSelect("editAlumno");
  document.getElementById("editAlumno").value = c.alumnoCed;

  modalEditar.show();
}



// editar curso
async function editarCurso(e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;

  const body = {
    nombre: document.getElementById("editNombre").value,
    alumnoCed: document.getElementById("editAlumno").value
  };

  await fetch(API_CURSOS + "/" + id, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  modalEditar.hide();
  listarCursos();
  mostrarAlerta("Curso actualizado", "success");
}



// eliminar curso
async function eliminarCurso(id) {
  if (!confirm("¿Eliminar curso?")) return;

  await fetch(API_CURSOS + "/" + id, {
    method: "DELETE",
    headers: getHeaders()
  });

  listarCursos();
}



// ======================================================================
// =============== SELECT ALUMNOS PARA CURSOS ============================
// ======================================================================

async function cargarAlumnosEnSelect(idSelect) {

  const res = await fetch(API_ALUMNOS, { headers: getHeaders() });

  if (!res.ok) return;

  const data = await res.json();

  const select = document.getElementById(idSelect);

  select.innerHTML = data.map(a => `
      <option value="${a.estCed}">
        ${a.estNom} ${a.estApe}
      </option>
    `).join("");
}



// ======================================================================
// ========================== AUTO INIT =================================
// ======================================================================

document.addEventListener("DOMContentLoaded", () => {

  const rol = localStorage.getItem("role");
  const pagina = window.location.pathname.toLowerCase().split("/").pop();

  if (pagina === "login.html" || pagina === "") return;

  if (!rol) return logout();


  // ==================================================================
  // =========== RESTRICCIONES PARA SECRETARIA ========================
  // ==================================================================

  // Si intenta entrar a otras páginas → redirigir a alumnos.html
  if (rol === "SECRETARIA") {
    if (pagina === "index.html" || pagina === "cursos.html") {
      location.href = "alumnos.html";
      return;
    }
  }

  // Ocultar botón inicio en alumnos
  if (rol === "SECRETARIA" && pagina === "alumnos.html") {
    const btnInicio = document.getElementById("btn-inicio");
    if (btnInicio) btnInicio.style.display = "none";
  }


  // ==================================================================
  // ================ NAVBAR ==========================================
  // ==================================================================

  const usuarioSpan = document.getElementById("usuario-actual");
  if (usuarioSpan) usuarioSpan.textContent = localStorage.getItem("user");


  // ==================================================================
  // ================ MODALES =========================================
  // ==================================================================

  const mc = document.getElementById("modalCrear");
  if (mc) modalCrear = new bootstrap.Modal(mc);

  const me = document.getElementById("modalEditar");
  if (me) modalEditar = new bootstrap.Modal(me);


  // ==================================================================
  // ================ ALUMNOS =========================================
  // ==================================================================

  if (document.getElementById("tbody-alumnos")) {
    listarAlumnos();
  }


  // ==================================================================
  // ================ CURSOS ==========================================
  // ==================================================================

  if (document.getElementById("cursos-table")) {

    cargarAlumnosEnSelect("curso-alumno");

    listarCursos();

    // ocultar botones admin-only
    if (rol !== "ADMIN") {
      document.querySelectorAll(".admin-only").forEach(el =>
        el.style.display = "none"
      );
    }
  }

});
