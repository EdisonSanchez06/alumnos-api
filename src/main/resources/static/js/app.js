// ======================================================================
// ========================= CONFIG GLOBAL ==============================
// ======================================================================

const API_BASE = "https://alumnos-api-e65o.onrender.com";
const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";

// Estados para tablas (paginación / filtros)
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

// Headers con auth
function getHeaders() {
  const token = localStorage.getItem("auth");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = token;
  return headers;
}

// Dark mode
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

// Toast bonito
function toast(message, icon = "info") {
  Swal.fire({
    toast: true,
    icon,
    title: message,
    timer: 2500,
    position: "top-end",
    showConfirmButton: false,
  });
}

// Confirmación bonita
async function confirmDialog(title = "¿Seguro?", text = "Esta acción no se puede deshacer") {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });
  return result.isConfirmed;
}

// ======================================================================
// ========================= AUTH / ROLES ===============================
// ======================================================================

function login(e) {
  e.preventDefault();

  const user = e.target.usuario.value.trim();
  const pass = e.target.clave.value.trim();

  if (!user || !pass) {
    toast("Usuario y contraseña son obligatorios", "warning");
    return;
  }

  const basic = "Basic " + btoa(user + ":" + pass);

  // Probamos autenticación llamando a alumnos
  fetch(API_ALUMNOS, {
    headers: {
      Authorization: basic,
    },
  })
    .then((r) => {
      if (!r.ok) throw new Error("Credenciales inválidas");

      localStorage.setItem("auth", basic);
      localStorage.setItem("username", user);

      if (user === "admin") {
        localStorage.setItem("role", "ADMIN");
        location.href = "dashboard.html";
      } else {
        localStorage.setItem("role", "SECRETARIA");
        location.href = "alumnos.html";
      }
    })
    .catch((err) => toast(err.message, "error"));
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}

function getRole() {
  return localStorage.getItem("role");
}

function ensureAuth() {
  if (!localStorage.getItem("auth")) {
    location.href = "login.html";
  }
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

function attachLiveValidation(formElement) {
  if (!formElement) return;
  const inputs = formElement.querySelectorAll("input[required], textarea[required]");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (!input.value.trim()) {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
      } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
    });
  });
}

function clearValidation(formElement) {
  if (!formElement) return;
  const inputs = formElement.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.classList.remove("is-valid");
    input.classList.remove("is-invalid");
  });
}

// ======================================================================
// ========================= PAGINACIÓN / FILTROS =======================
// ======================================================================

function paginate(array, page, size) {
  const start = (page - 1) * size;
  return array.slice(start, start + size);
}

function applyAlumnosFilters() {
  let result = [...alumnosData];

  // filtros avanzados
  if (alumnosFilters.cedula) {
    result = result.filter((a) => (a.estCed || "").toLowerCase().includes(alumnosFilters.cedula.toLowerCase()));
  }
  if (alumnosFilters.nombre) {
    result = result.filter((a) => (a.estNom || "").toLowerCase().includes(alumnosFilters.nombre.toLowerCase()));
  }
  if (alumnosFilters.apellido) {
    result = result.filter((a) => (a.estApe || "").toLowerCase().includes(alumnosFilters.apellido.toLowerCase()));
  }

  // buscador global
  if (alumnosSearch) {
    const q = alumnosSearch.toLowerCase();
    result = result.filter((a) =>
      [
        a.estCed,
        a.estNom,
        a.estApe,
        a.estTel,
        a.estDir,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  return result;
}

function applyCursosFilters() {
  let result = [...cursosData];

  if (cursosFilters.nombre) {
    result = result.filter((c) => (c.nombre || "").toLowerCase().includes(cursosFilters.nombre.toLowerCase()));
  }
  if (cursosFilters.alumnoCed) {
    result = result.filter((c) => (c.alumnoCed || "").toLowerCase().includes(cursosFilters.alumnoCed.toLowerCase()));
  }

  if (cursosSearch) {
    const q = cursosSearch.toLowerCase();
    result = result.filter((c) =>
      [
        c.id,
        c.nombre,
        c.alumnoCed,
        c.alumnoNombreCompleto,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  return result;
}

// ======================================================================
// ========================= ALUMNOS (CRUD + UI) ========================
// ======================================================================

async function fetchAlumnos() {
  try {
    const resp = await fetch(API_ALUMNOS, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error al cargar alumnos");
    alumnosData = await resp.json();
    alumnosPage = 1;
    renderAlumnosTable();
  } catch (e) {
    toast(e.message || "No se pudo conectar con el servidor", "error");
  }
}

function renderAlumnosTable() {
  const tbody = document.getElementById("tbodyAlumnos");
  if (!tbody) return;

  const dataFiltered = applyAlumnosFilters();
  const total = dataFiltered.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / alumnosPageSize));
  if (alumnosPage > totalPages) alumnosPage = totalPages;

  const pageItems = paginate(dataFiltered, alumnosPage, alumnosPageSize);

  let html = "";
  pageItems.forEach((a) => {
    html += `
      <tr>
        <td>${a.estCed}</td>
        <td>${a.estNom}</td>
        <td>${a.estApe}</td>
        <td>${a.estTel || ""}</td>
        <td>${a.estDir || ""}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="abrirModalEditarAlumno('${a.estCed}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html || `<tr><td colspan="6" class="text-center text-muted">Sin resultados</td></tr>`;

  const info = document.getElementById("alumnosPaginationInfo");
  if (info) {
    const start = total === 0 ? 0 : (alumnosPage - 1) * alumnosPageSize + 1;
    const end = Math.min(alumnosPage * alumnosPageSize, total);
    info.textContent = `Mostrando ${start}-${end} de ${total}`;
  }

  const btnPrev = document.getElementById("alumnosPrev");
  const btnNext = document.getElementById("alumnosNext");
  if (btnPrev) btnPrev.disabled = alumnosPage <= 1;
  if (btnNext) btnNext.disabled = alumnosPage >= totalPages;
}

function alumnosCambioPagina(delta) {
  alumnosPage += delta;
  if (alumnosPage < 1) alumnosPage = 1;
  renderAlumnosTable();
}

function alumnosCambioSearch(input) {
  alumnosSearch = input.value.trim();
  alumnosPage = 1;
  renderAlumnosTable();
}

function alumnosCambioFiltros() {
  const ced = document.getElementById("filterCedula");
  const nom = document.getElementById("filterNombre");
  const ape = document.getElementById("filterApellido");

  alumnosFilters.cedula = ced ? ced.value.trim() : "";
  alumnosFilters.nombre = nom ? nom.value.trim() : "";
  alumnosFilters.apellido = ape ? ape.value.trim() : "";

  alumnosPage = 1;
  renderAlumnosTable();
}

// ---------- Crear alumno -----------

function abrirModalCrearAlumno() {
  const modalEl = document.getElementById("modalCrearAlumno");
  const form = document.getElementById("formCrearAlumno");
  if (!modalEl || !form) return;

  form.reset();
  clearValidation(form);
  attachLiveValidation(form);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

async function crearAlumno(e) {
  e.preventDefault();
  const form = e.target;

  const data = {
    estCed: form.estCed.value.trim(),
    estNom: form.estNom.value.trim(),
    estApe: form.estApe.value.trim(),
    estTel: form.estTel.value.trim(),
    estDir: form.estDir.value.trim(),
  };

  if (!data.estCed || !data.estNom || !data.estApe) {
    toast("Cédula, nombres y apellidos son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(API_ALUMNOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al crear alumno");

    toast("Alumno creado correctamente", "success");

    const modalEl = document.getElementById("modalCrearAlumno");
    bootstrap.Modal.getInstance(modalEl).hide();

    await fetchAlumnos();
  } catch (e) {
    toast(e.message || "No se pudo crear el alumno", "error");
  }
}

// ---------- Editar alumno -----------

async function abrirModalEditarAlumno(ced) {
  const modalEl = document.getElementById("modalEditarAlumno");
  const form = document.getElementById("formEditarAlumno");
  if (!modalEl || !form) return;

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, { headers: getHeaders() });
    if (!resp.ok) throw new Error("No se pudo cargar el alumno");

    const a = await resp.json();

    form.estCedE.value = a.estCed;
    form.estNomE.value = a.estNom;
    form.estApeE.value = a.estApe;
    form.estTelE.value = a.estTel || "";
    form.estDirE.value = a.estDir || "";

    clearValidation(form);
    attachLiveValidation(form);

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (e) {
    toast(e.message || "Error al cargar datos del alumno", "error");
  }
}

async function actualizarAlumno(e) {
  e.preventDefault();
  const form = e.target;
  const ced = form.estCedE.value.trim();

  const data = {
    estNom: form.estNomE.value.trim(),
    estApe: form.estApeE.value.trim(),
    estTel: form.estTelE.value.trim(),
    estDir: form.estDirE.value.trim(),
  };

  if (!data.estNom || !data.estApe) {
    toast("Nombres y apellidos son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al actualizar alumno");

    toast("Alumno actualizado correctamente", "success");

    const modalEl = document.getElementById("modalEditarAlumno");
    bootstrap.Modal.getInstance(modalEl).hide();

    await fetchAlumnos();
  } catch (e) {
    toast(e.message || "No se pudo actualizar el alumno", "error");
  }
}

// ---------- Eliminar alumno -----------

async function eliminarAlumno(ced) {
  const ok = await confirmDialog("¿Eliminar alumno?", `Se eliminará el alumno ${ced}`);
  if (!ok) return;

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!resp.ok) throw new Error("No se pudo eliminar el alumno");

    toast("Alumno eliminado", "success");
    await fetchAlumnos();
  } catch (e) {
    toast(e.message || "Error al eliminar alumno", "error");
  }
}

// ======================================================================
// ========================= CURSOS (CRUD + UI) =========================
// ======================================================================

async function fetchCursos() {
  try {
    const resp = await fetch(API_CURSOS, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error al cargar cursos");
    cursosData = await resp.json();
    cursosPage = 1;
    renderCursosTable();
  } catch (e) {
    toast(e.message || "No se pudo conectar con el servidor", "error");
  }
}

function renderCursosTable() {
  const tbody = document.getElementById("tbodyCursos");
  if (!tbody) return;

  const dataFiltered = applyCursosFilters();
  const total = dataFiltered.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / cursosPageSize));
  if (cursosPage > totalPages) cursosPage = totalPages;

  const pageItems = paginate(dataFiltered, cursosPage, cursosPageSize);

  let html = "";
  pageItems.forEach((c) => {
    html += `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.alumnoCed} - ${c.alumnoNombreCompleto}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="abrirModalEditarCurso(${c.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarCurso(${c.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html || `<tr><td colspan="4" class="text-center text-muted">Sin resultados</td></tr>`;

  const info = document.getElementById("cursosPaginationInfo");
  if (info) {
    const start = total === 0 ? 0 : (cursosPage - 1) * cursosPageSize + 1;
    const end = Math.min(cursosPage * cursosPageSize, total);
    info.textContent = `Mostrando ${start}-${end} de ${total}`;
  }

  const btnPrev = document.getElementById("cursosPrev");
  const btnNext = document.getElementById("cursosNext");
  if (btnPrev) btnPrev.disabled = cursosPage <= 1;
  if (btnNext) btnNext.disabled = cursosPage >= totalPages;
}

function cursosCambioPagina(delta) {
  cursosPage += delta;
  if (cursosPage < 1) cursosPage = 1;
  renderCursosTable();
}

function cursosCambioSearch(input) {
  cursosSearch = input.value.trim();
  cursosPage = 1;
  renderCursosTable();
}

function cursosCambioFiltros() {
  const nom = document.getElementById("filterCursoNombre");
  const ced = document.getElementById("filterCursoAlumnoCed");

  cursosFilters.nombre = nom ? nom.value.trim() : "";
  cursosFilters.alumnoCed = ced ? ced.value.trim() : "";

  cursosPage = 1;
  renderCursosTable();
}

// ---------- Crear curso -----------

function abrirModalCrearCurso() {
  const modalEl = document.getElementById("modalCrearCurso");
  const form = document.getElementById("formCrearCurso");
  if (!modalEl || !form) return;

  form.reset();
  clearValidation(form);
  attachLiveValidation(form);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

async function crearCurso(e) {
  e.preventDefault();
  const form = e.target;

  const data = {
    nombre: form.nombre.value.trim(),
    alumnoCed: form.alumnoCed.value.trim(),
  };

  if (!data.nombre || !data.alumnoCed) {
    toast("Nombre del curso y cédula del alumno son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(API_CURSOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al crear curso");

    toast("Curso creado correctamente", "success");

    const modalEl = document.getElementById("modalCrearCurso");
    bootstrap.Modal.getInstance(modalEl).hide();

    await fetchCursos();
  } catch (e) {
    toast(e.message || "No se pudo crear el curso", "error");
  }
}

// ---------- Editar curso -----------

async function abrirModalEditarCurso(id) {
  const modalEl = document.getElementById("modalEditarCurso");
  const form = document.getElementById("formEditarCurso");
  if (!modalEl || !form) return;

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, { headers: getHeaders() });
    if (!resp.ok) throw new Error("No se pudo cargar el curso");

    const c = await resp.json();

    form.idE.value = c.id;
    form.nombreE.value = c.nombre;
    form.alumnoCedE.value = c.alumnoCed;

    clearValidation(form);
    attachLiveValidation(form);

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (e) {
    toast(e.message || "Error al cargar datos del curso", "error");
  }
}

async function actualizarCurso(e) {
  e.preventDefault();
  const form = e.target;

  const id = form.idE.value;
  const data = {
    nombre: form.nombreE.value.trim(),
    alumnoCed: form.alumnoCedE.value.trim(),
  };

  if (!data.nombre || !data.alumnoCed) {
    toast("Todos los campos son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al actualizar curso");

    toast("Curso actualizado correctamente", "success");

    const modalEl = document.getElementById("modalEditarCurso");
    bootstrap.Modal.getInstance(modalEl).hide();

    await fetchCursos();
  } catch (e) {
    toast(e.message || "No se pudo actualizar el curso", "error");
  }
}

// ---------- Eliminar curso -----------

async function eliminarCurso(id) {
  const ok = await confirmDialog("¿Eliminar curso?", `Se eliminará el curso ${id}`);
  if (!ok) return;

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!resp.ok) throw new Error("No se pudo eliminar el curso");

    toast("Curso eliminado", "success");
    await fetchCursos();
  } catch (e) {
    toast(e.message || "Error al eliminar curso", "error");
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
    if (!alResp.ok || !cuResp.ok) throw new Error("Error al cargar datos");

    const alumnos = await alResp.json();
    const cursos = await cuResp.json();

    const totalAl = document.getElementById("totalAlumnos");
    const totalCu = document.getElementById("totalCursos");
    const userName = document.getElementById("userName");

    if (totalAl) totalAl.textContent = alumnos.length;
    if (totalCu) totalCu.textContent = cursos.length;
    if (userName) userName.textContent = localStorage.getItem("username") || "admin";

    // Conteo cursos por alumno
    const conteo = {};
    cursos.forEach((c) => {
      const key = c.alumnoNombreCompleto || c.alumnoCed;
      conteo[key] = (conteo[key] || 0) + 1;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    const ctx = document.getElementById("chartCursosPorAlumno");
    if (ctx && labels.length) {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Cursos por alumno",
              data,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
            },
          },
        },
      });
    }

  } catch (e) {
    toast(e.message || "No se pudo cargar el dashboard", "error");
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

// login.html usaría: loadTheme() directamente desde script
