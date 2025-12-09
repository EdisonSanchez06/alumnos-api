// ======================================================================
// ========================= CONFIG GLOBAL ==============================
// ======================================================================

const API_BASE = "https://alumnos-api-e65o.onrender.com";
const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";

// Estados globales para paginación y filtros
let alumnosData = [];
let alumnosPage = 1;
let alumnosPageSize = 5;
let alumnosSearch = "";
let alumnosFilters = { cedula: "", nombre: "", apellido: "" };

let cursosData = [];
let cursosPage = 1;
let cursosPageSize = 5;
let cursosSearch = "";
let cursosFilters = { nombre: "", alumnoCed: "" };

// ======================================================================
// ========================= UTILIDADES BASICAS =========================
// ======================================================================

function getHeaders() {
  const token = localStorage.getItem("auth");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = token;
  return headers;
}

// Tema oscuro
function loadTheme() {
  const stored = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", stored);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// Toast moderno
function toast(message, icon = "info") {
  Swal.fire({
    toast: true,
    icon,
    title: message,
    timer: 2000,
    showConfirmButton: false,
    position: "top-end",
  });
}

// Confirmación
async function confirmDialog(title = "¿Seguro?", text = "Esta acción no se puede deshacer") {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonText: "Cancelar",
    confirmButtonText: "Sí",
  });
  return result.isConfirmed;
}

// ======================================================================
// ========================= AUTH / ROLES ===============================
// ======================================================================

// Login real usando Basic Auth
async function login(e) {
  e.preventDefault();

  const user = e.target.usuario.value.trim();
  const pass = e.target.clave.value.trim();

  if (!user || !pass) {
    toast("Debe ingresar usuario y contraseña", "warning");
    return;
  }

  const basic = "Basic " + btoa(user + ":" + pass);

  try {
    const resp = await fetch(API_ALUMNOS, {
      headers: { Authorization: basic }
    });

    if (!resp.ok) throw new Error("Usuario o contraseña incorrectos");

    localStorage.setItem("auth", basic);
    localStorage.setItem("username", user.toUpperCase());

    // Rol determinado por nombre del usuario
    let role = "SECRETARIA";
    if (user.toLowerCase() === "admin") role = "ADMIN";

    localStorage.setItem("role", role);

    toast(`Bienvenido ${user}`, "success");

    if (role === "ADMIN") location.href = "dashboard.html";
    else location.href = "alumnos.html";

  } catch (err) {
    toast(err.message, "error");
  }
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}

function getRole() {
  return localStorage.getItem("role");
}

function ensureAuth() {
  if (!localStorage.getItem("auth")) location.href = "login.html";
}

function ensureAdmin() {
  ensureAuth();
  if (getRole() !== "ADMIN") {
    toast("Solo el administrador puede acceder aquí", "error");
    setTimeout(() => (location.href = "alumnos.html"), 1500);
  }
}

// ======================================================================
// ========================= VALIDACIÓN FORMULARIOS =====================
// ======================================================================

function attachLiveValidation(form) {
  const inputs = form.querySelectorAll("input[required], textarea[required]");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (!input.value.trim()) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
      } else {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      }
    });
  });
}

function clearValidation(form) {
  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach((i) => i.classList.remove("is-valid", "is-invalid"));
}

// ======================================================================
// ========================= PAGINACIÓN / FILTROS =======================
// ======================================================================

function paginate(arr, page, size) {
  const start = (page - 1) * size;
  return arr.slice(start, start + size);
}

function applyAlumnosFilters() {
  let result = [...alumnosData];

  if (alumnosFilters.cedula)
    result = result.filter(a => a.estCed.toLowerCase().includes(alumnosFilters.cedula.toLowerCase()));

  if (alumnosFilters.nombre)
    result = result.filter(a => a.estNom.toLowerCase().includes(alumnosFilters.nombre.toLowerCase()));

  if (alumnosFilters.apellido)
    result = result.filter(a => a.estApe.toLowerCase().includes(alumnosFilters.apellido.toLowerCase()));

  if (alumnosSearch) {
    const q = alumnosSearch.toLowerCase();
    result = result.filter(a =>
      `${a.estCed} ${a.estNom} ${a.estApe} ${a.estTel} ${a.estDir}`.toLowerCase().includes(q)
    );
  }

  return result;
}

function applyCursosFilters() {
  let result = [...cursosData];

  if (cursosFilters.nombre)
    result = result.filter(c => c.nombre.toLowerCase().includes(cursosFilters.nombre.toLowerCase()));

  if (cursosFilters.alumnoCed)
    result = result.filter(c => c.alumnoCed.toLowerCase().includes(cursosFilters.alumnoCed.toLowerCase()));

  if (cursosSearch) {
    const q = cursosSearch.toLowerCase();
    result = result.filter(c =>
      `${c.id} ${c.nombre} ${c.alumnoCed} ${c.alumnoNombreCompleto}`.toLowerCase().includes(q)
    );
  }

  return result;
}

// ======================================================================
// ========================= CRUD ALUMNOS ===============================
// ======================================================================

// Cargar lista
async function fetchAlumnos() {
  try {
    const resp = await fetch(API_ALUMNOS, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error al cargar alumnos");

    alumnosData = await resp.json();
    alumnosPage = 1;
    renderAlumnosTable();
  } catch (e) {
    toast(e.message, "error");
  }
}

// Render tabla
function renderAlumnosTable() {
  const tbody = document.getElementById("tbodyAlumnos");
  if (!tbody) return;

  const filtered = applyAlumnosFilters();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / alumnosPageSize));
  if (alumnosPage > totalPages) alumnosPage = totalPages;

  const items = paginate(filtered, alumnosPage, alumnosPageSize);

  tbody.innerHTML = items.map(a => `
    <tr>
      <td>${a.estCed}</td>
      <td>${a.estNom}</td>
      <td>${a.estApe}</td>
      <td>${a.estTel || ""}</td>
      <td>${a.estDir || ""}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1" onclick="abrirModalEditarAlumno('${a.estCed}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
      </td>
    </tr>
  `).join("");

  const info = document.getElementById("alumnosPaginationInfo");
  if (info) {
    const start = (alumnosPage - 1) * alumnosPageSize + 1;
    const end = Math.min(alumnosPage * alumnosPageSize, total);
    info.textContent = total ? `Mostrando ${start}-${end} de ${total}` : "Sin resultados";
  }

  document.getElementById("alumnosPrev").disabled = alumnosPage <= 1;
  document.getElementById("alumnosNext").disabled = alumnosPage >= totalPages;
}

function alumnosCambioPagina(n) {
  alumnosPage += n;
  renderAlumnosTable();
}

function alumnosCambioSearch(input) {
  alumnosSearch = input.value.trim();
  alumnosPage = 1;
  renderAlumnosTable();
}

function alumnosCambioFiltros() {
  alumnosFilters.cedula = document.getElementById("filterCedula").value.trim();
  alumnosFilters.nombre = document.getElementById("filterNombre").value.trim();
  alumnosFilters.apellido = document.getElementById("filterApellido").value.trim();

  alumnosPage = 1;
  renderAlumnosTable();
}

// Crear alumno
function abrirModalCrearAlumno() {
  const modal = new bootstrap.Modal("#modalCrearAlumno");
  const form = document.getElementById("formCrearAlumno");
  form.reset();
  clearValidation(form);
  attachLiveValidation(form);
  modal.show();
}

async function crearAlumno(e) {
  e.preventDefault();
  const f = e.target;

  const data = {
    estCed: f.estCed.value.trim(),
    estNom: f.estNom.value.trim(),
    estApe: f.estApe.value.trim(),
    estTel: f.estTel.value.trim(),
    estDir: f.estDir.value.trim(),
  };

  if (!data.estCed || !data.estNom || !data.estApe)
    return toast("Cédula, nombre y apellido son obligatorios", "warning");

  try {
    await fetch(API_ALUMNOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    toast("Alumno creado", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalCrearAlumno")).hide();
    fetchAlumnos();
  } catch {
    toast("Error al crear alumno", "error");
  }
}

// Editar alumno
async function abrirModalEditarAlumno(ced) {
  const modal = new bootstrap.Modal("#modalEditarAlumno");
  const form = document.getElementById("formEditarAlumno");

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, { headers: getHeaders() });
    const a = await resp.json();

    form.estCedE.value = a.estCed;
    form.estNomE.value = a.estNom;
    form.estApeE.value = a.estApe;
    form.estTelE.value = a.estTel || "";
    form.estDirE.value = a.estDir || "";

    clearValidation(form);
    attachLiveValidation(form);

    modal.show();
  } catch {
    toast("Error al cargar alumno", "error");
  }
}

async function actualizarAlumno(e) {
  e.preventDefault();
  const f = e.target;

  const ced = f.estCedE.value;
  const data = {
    estNom: f.estNomE.value.trim(),
    estApe: f.estApeE.value.trim(),
    estTel: f.estTelE.value.trim(),
    estDir: f.estDirE.value.trim(),
  };

  try {
    await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    toast("Alumno actualizado", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalEditarAlumno")).hide();
    fetchAlumnos();
  } catch {
    toast("Error al actualizar alumno", "error");
  }
}

// Eliminar alumno
async function eliminarAlumno(ced) {
  if (!(await confirmDialog("Eliminar alumno", `¿Eliminar a ${ced}?`))) return;

  try {
    await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    toast("Alumno eliminado", "success");
    fetchAlumnos();
  } catch {
    toast("No se pudo eliminar", "error");
  }
}

// ======================================================================
// ========================= CRUD CURSOS ===============================
// ======================================================================

async function fetchCursos() {
  try {
    const resp = await fetch(API_CURSOS, { headers: getHeaders() });
    cursosData = await resp.json();
    cursosPage = 1;
    renderCursosTable();
  } catch {
    toast("Error al cargar cursos", "error");
  }
}

function renderCursosTable() {
  const tbody = document.getElementById("tbodyCursos");
  if (!tbody) return;

  const filtered = applyCursosFilters();
  const total = filtered.length;
  const totalPages = Math.ceil(total / cursosPageSize);

  if (cursosPage > totalPages) cursosPage = totalPages;

  const items = paginate(filtered, cursosPage, cursosPageSize);

  tbody.innerHTML = items
    .map(
      (c) => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.alumnoCed} - ${c.alumnoNombreCompleto}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1" onclick="abrirModalEditarCurso(${c.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarCurso(${c.id})">Eliminar</button>
      </td>
    </tr>`
    )
    .join("");

  document.getElementById("cursosPaginationInfo").textContent =
    total ? `Mostrando ${items.length} de ${total}` : "Sin resultados";

  document.getElementById("cursosPrev").disabled = cursosPage <= 1;
  document.getElementById("cursosNext").disabled = cursosPage >= totalPages;
}

function cursosCambioPagina(n) {
  cursosPage += n;
  renderCursosTable();
}

function cursosCambioSearch(input) {
  cursosSearch = input.value.trim();
  cursosPage = 1;
  renderCursosTable();
}

function cursosCambioFiltros() {
  cursosFilters.nombre = document.getElementById("filterCursoNombre").value.trim();
  cursosFilters.alumnoCed = document.getElementById("filterCursoAlumnoCed").value.trim();

  cursosPage = 1;
  renderCursosTable();
}

// Crear curso
function abrirModalCrearCurso() {
  const modal = new bootstrap.Modal("#modalCrearCurso");
  const form = document.getElementById("formCrearCurso");
  form.reset();
  clearValidation(form);
  attachLiveValidation(form);
  modal.show();
}

async function crearCurso(e) {
  e.preventDefault();
  const f = e.target;

  const data = {
    nombre: f.nombre.value.trim(),
    alumnoCed: f.alumnoCed.value.trim(),
  };

  try {
    await fetch(API_CURSOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    toast("Curso creado", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalCrearCurso")).hide();
    fetchCursos();
  } catch {
    toast("Error al crear curso", "error");
  }
}

// Editar curso
async function abrirModalEditarCurso(id) {
  const modal = new bootstrap.Modal("#modalEditarCurso");
  const form = document.getElementById("formEditarCurso");

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, { headers: getHeaders() });
    const c = await resp.json();

    form.idE.value = c.id;
    form.nombreE.value = c.nombre;
    form.alumnoCedE.value = c.alumnoCed;

    clearValidation(form);
    attachLiveValidation(form);

    modal.show();
  } catch {
    toast("Error al cargar curso", "error");
  }
}

async function actualizarCurso(e) {
  e.preventDefault();
  const f = e.target;

  const data = {
    nombre: f.nombreE.value.trim(),
    alumnoCed: f.alumnoCedE.value.trim(),
  };

  try {
    await fetch(`${API_CURSOS}/${f.idE.value}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    toast("Curso actualizado", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalEditarCurso")).hide();
    fetchCursos();
  } catch {
    toast("Error al actualizar curso", "error");
  }
}

async function eliminarCurso(id) {
  if (!(await confirmDialog("Eliminar curso", `¿Eliminar curso ${id}?`))) return;

  try {
    await fetch(`${API_CURSOS}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    toast("Curso eliminado", "success");
    fetchCursos();
  } catch {
    toast("Error al eliminar curso", "error");
  }
}

// ======================================================================
// ========================= DASHBOARD ==================================
// ======================================================================

async function initDashboard() {
  loadTheme();
  ensureAdmin();

  try {
    const [alResp, cuResp] = await Promise.all([
      fetch(API_ALUMNOS, { headers: getHeaders() }),
      fetch(API_CURSOS, { headers: getHeaders() }),
    ]);

    const alumnos = await alResp.json();
    const cursos = await cuResp.json();

    document.getElementById("totalAlumnos").textContent = alumnos.length;
    document.getElementById("totalCursos").textContent = cursos.length;
    document.getElementById("userName").textContent =
      localStorage.getItem("username");

    // Conteo para gráfica
    const counts = {};
    cursos.forEach(c => {
      const name = c.alumnoNombreCompleto || c.alumnoCed;
      counts[name] = (counts[name] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    new Chart(document.getElementById("chartCursosPorAlumno"), {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Cursos por alumno",
          data
        }]
      }
    });
  } catch {
    toast("Error al cargar dashboard", "error");
  }
}

// ======================================================================
// ========================= INIT PAGES =================================
// ======================================================================

function initAlumnosPage() {
  loadTheme();
  ensureAuth();
  fetchAlumnos();
}

function initCursosPage() {
  loadTheme();
  ensureAdmin();
  fetchCursos();
}
