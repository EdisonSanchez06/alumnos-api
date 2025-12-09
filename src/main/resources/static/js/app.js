// ======================================================================
// ========================= CONFIG GLOBAL ==============================
// ======================================================================

const API_BASE = "https://alumnos-api-e65o.onrender.com";
const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";

// Estados globales
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

let alumnosParaAutocomplete = []; // para autocompletar

// ======================================================================
// ========================= UTILIDADES BASICAS =========================
// ======================================================================

function getHeaders() {
  const token = localStorage.getItem("auth");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = token;
  return headers;
}

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

async function confirmDialog(title, text) {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
  });
  return result.isConfirmed;
}

// ======================================================================
// ========================= AUTH / ROLES ===============================
// ======================================================================

async function login(e) {
  e.preventDefault();

  const user = e.target.usuario.value.trim();
  const pass = e.target.clave.value.trim();

  if (!user || !pass) return toast("Debe ingresar usuario y contraseña", "warning");

  const basic = "Basic " + btoa(user + ":" + pass);

  try {
    const resp = await fetch(API_ALUMNOS, { headers: { Authorization: basic } });
    if (!resp.ok) throw new Error("Usuario o contraseña incorrectos");

    localStorage.setItem("auth", basic);
    localStorage.setItem("username", user.toUpperCase());

    let role = user.toLowerCase() === "admin" ? "ADMIN" : "SECRETARIA";
    localStorage.setItem("role", role);

    toast(`Bienvenido ${user}`, "success");
    location.href = role === "ADMIN" ? "dashboard.html" : "alumnos.html";

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
    toast("Solo admins pueden acceder aquí", "error");
    setTimeout(() => location.href = "alumnos.html", 1500);
  }
}

// ======================================================================
// ========================= VALIDACIÓN ================================
// ======================================================================

function attachLiveValidation(form) {
  const inputs = form.querySelectorAll("input[required], textarea[required]");
  inputs.forEach(i => {
    i.addEventListener("input", () => {
      if (!i.value.trim()) {
        i.classList.add("is-invalid");
        i.classList.remove("is-valid");
      } else {
        i.classList.add("is-valid");
        i.classList.remove("is-invalid");
      }
    });
  });
}

function clearValidation(form) {
  form.querySelectorAll("input, textarea")
    .forEach(i => i.classList.remove("is-valid", "is-invalid"));
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
    result = result.filter(a => a.estCed.includes(alumnosFilters.cedula));

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
    result = result.filter(c => c.alumnoCed.includes(cursosFilters.alumnoCed));

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

async function fetchAlumnos() {
  try {
    const resp = await fetch(API_ALUMNOS, { headers: getHeaders() });
    alumnosData = await resp.json();
    alumnosPage = 1;
    renderAlumnosTable();
  } catch {
    toast("Error al cargar alumnos", "error");
  }
}

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
      <td class="text-center">
        <button class="btn btn-warning btn-sm me-1" onclick="abrirModalEditarAlumno('${a.estCed}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
      </td>
    </tr>
  `).join("");

  document.getElementById("alumnosPaginationInfo").textContent =
    total ? `Mostrando ${items.length} de ${total}` : "Sin resultados";

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
// ========================= CRUD CURSOS ================================
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
  const totalPages = Math.max(1, Math.ceil(total / cursosPageSize));

  if (cursosPage > totalPages) cursosPage = totalPages;
  const items = paginate(filtered, cursosPage, cursosPageSize);

  tbody.innerHTML = items
    .map(
      c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.alumnoCed} - ${c.alumnoNombreCompleto}</td>
      <td class="text-center">
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

// ====== AUTOCOMPLETE: cargar alumnos ======

async function cargarCedulas() {
  try {
    const resp = await fetch(API_ALUMNOS, { headers: getHeaders() });
    alumnosParaAutocomplete = await resp.json();
  } catch {
    toast("No se pudieron cargar cédulas", "error");
  }
}

// Autocomplete PRO
function autocompletarCedula(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);

  input.addEventListener("input", () => {
    const val = input.value.trim().toLowerCase();
    if (!val) {
      list.innerHTML = "";
      return;
    }

    const filtrados = alumnosParaAutocomplete
      .filter(a => a.estCed.startsWith(val))
      .slice(0, 8);

    list.innerHTML = filtrados
      .map(a => `<div class="ac-item" data-value="${a.estCed}">${a.estCed} — ${a.estNom} ${a.estApe}</div>`)
      .join("");

    document.querySelectorAll(".ac-item").forEach(el => {
      el.onclick = () => {
        input.value = el.dataset.value;
        list.innerHTML = "";
      };
    });
  });
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

  if (!data.nombre || !data.alumnoCed)
    return toast("Todos los campos son obligatorios", "warning");

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

// Eliminar curso
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
    const [respAl, respCu] = await Promise.all([
      fetch(API_ALUMNOS, { headers: getHeaders() }),
      fetch(API_CURSOS, { headers: getHeaders() }),
    ]);

    const alumnos = await respAl.json();
    const cursos = await respCu.json();

    document.getElementById("totalAlumnos").textContent = alumnos.length;
    document.getElementById("totalCursos").textContent = cursos.length;
    document.getElementById("userName").textContent = localStorage.getItem("username");

    // Últimos alumnos
    const ultimos = alumnos.slice(-5);
    const tbody = document.getElementById("tbodyUltimos");

    if (tbody) {
      tbody.innerHTML = ultimos.map(a => {
        const curso = cursos.find(c => c.alumnoCed === a.estCed);
        return `
          <tr>
            <td>${a.estCed}</td>
            <td>${a.estNom} ${a.estApe}</td>
            <td>${curso ? curso.nombre : "<span class='text-muted'>Sin curso</span>"}</td>
          </tr>
        `;
      }).join("");
    }

    // Cursos por alumno → TOP 10
    const conteo = {};
    cursos.forEach(c => {
      const nombre = c.alumnoNombreCompleto || c.alumnoCed;
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    let lista = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const labels = lista.map(x => x[0]);
    const data = lista.map(x => x[1]);

    const ctx = document.getElementById("chartCursosPorAlumno");
    if (ctx) {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Cursos por alumno",
            data,
            backgroundColor: "rgba(0, 123, 255, 0.6)",
          }],
        },
        options: { responsive: true }
      });
    }

  } catch (e) {
    toast("Error cargando dashboard", "error");
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

async function initCursosPage() {
  loadTheme();
  ensureAdmin();
  await cargarCedulas();          // Cargar cedulas para autocompletar
  autocompletarCedula("alumnoCed", "listaCedulas");
  fetchCursos();
}
