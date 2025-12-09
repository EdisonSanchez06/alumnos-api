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

let alumnosParaAutocomplete = []; // sirve para autocompletar cedulas


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
    timer: 1800,
    position: "top-end",
    showConfirmButton: false,
  });
}

async function confirmDialog(title, text) {
  const res = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });
  return res.isConfirmed;
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

    toast("Bienvenido " + user, "success");

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
// ========================= VALIDACIONES ===============================
// ======================================================================

// Validar cédula ecuatoriana
function validarCedulaEcuatoriana(ced) {
  if (!/^\d{10}$/.test(ced)) return false;

  const provincia = parseInt(ced.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const digitoVerificador = parseInt(ced[9]);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(ced[i]);
    if (i % 2 === 0) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    suma += valor;
  }

  const decenaSuperior = Math.ceil(suma / 10) * 10;
  const digitoCalculado = decenaSuperior - suma;

  return (digitoCalculado === digitoVerificador) || (digitoCalculado === 10 && digitoVerificador === 0);
}

function validarNombre(nombre) {
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,40}$/.test(nombre);
}

function validarTelefono(tel) {
  return /^\d{10}$/.test(tel);
}

function validarDireccion(dir) {
  return dir.trim().length >= 5;
}

// Validación de nombre de curso (una sola versión)
function validarNombreCurso(nombre) {
  // Letras, números y espacios, mínimo 3 caracteres
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]{3,40}$/.test(nombre);
}

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
    result = result.filter(a => (a.estCed || "").includes(alumnosFilters.cedula));

  if (alumnosFilters.nombre)
    result = result.filter(a =>
      (a.estNom || "").toLowerCase().includes(alumnosFilters.nombre.toLowerCase())
    );

  if (alumnosFilters.apellido)
    result = result.filter(a =>
      (a.estApe || "").toLowerCase().includes(alumnosFilters.apellido.toLowerCase())
    );

  if (alumnosSearch) {
    const q = alumnosSearch.toLowerCase();
    result = result.filter(a =>
      `${a.estCed} ${a.estNom} ${a.estApe} ${a.estTel} ${a.estDir}`
        .toLowerCase()
        .includes(q)
    );
  }

  return result;
}

function applyCursosFilters() {
  let result = [...cursosData];

  if (cursosFilters.nombre)
    result = result.filter(c =>
      (c.nombre || "").toLowerCase().includes(cursosFilters.nombre.toLowerCase())
    );

  if (cursosFilters.alumnoCed)
    result = result.filter(c => (c.alumnoCed || "").includes(cursosFilters.alumnoCed));

  if (cursosSearch) {
    const q = cursosSearch.toLowerCase();
    result = result.filter(c =>
      `${c.id} ${c.nombre} ${c.alumnoCed} ${c.alumnoNombreCompleto}`
        .toLowerCase()
        .includes(q)
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
    if (!resp.ok) throw new Error("Error al cargar alumnos");
    alumnosData = await resp.json();
    alumnosPage = 1;
    renderAlumnosTable();
  } catch (e) {
    console.error(e);
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

  tbody.innerHTML = items
    .map(
      a => `
    <tr>
      <td>${a.estCed}</td>
      <td>${a.estNom}</td>
      <td>${a.estApe}</td>
      <td>${a.estTel || ""}</td>
      <td>${a.estDir || ""}</td>
      <td class="text-center">
        <button class="btn btn-warning btn-sm me-1"
          onclick="abrirModalEditarAlumno('${a.estCed}')">Editar</button>
        <button class="btn btn-danger btn-sm"
          onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
      </td>
    </tr>
  `
    )
    .join("");

  const info = document.getElementById("alumnosPaginationInfo");
  if (info) {
    info.textContent = total
      ? `Mostrando ${items.length} de ${total}`
      : "Sin resultados";
  }

  const btnPrev = document.getElementById("alumnosPrev");
  const btnNext = document.getElementById("alumnosNext");
  if (btnPrev) btnPrev.disabled = alumnosPage <= 1;
  if (btnNext) btnNext.disabled = alumnosPage >= totalPages;
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
  const ced = document.getElementById("filterCedula");
  const nom = document.getElementById("filterNombre");
  const ape = document.getElementById("filterApellido");

  alumnosFilters.cedula = ced ? ced.value.trim() : "";
  alumnosFilters.nombre = nom ? nom.value.trim() : "";
  alumnosFilters.apellido = ape ? ape.value.trim() : "";

  alumnosPage = 1;
  renderAlumnosTable();
}


// ======================================================================
// ========================= CREAR ALUMNO ===============================
// ======================================================================

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

  if (!data.estCed || !data.estNom || !data.estApe || !data.estTel || !data.estDir) {
    return toast("Todos los campos son obligatorios", "warning");
  }

  if (!validarCedulaEcuatoriana(data.estCed))
    return toast("Cédula inválida", "error");

  if (!validarNombre(data.estNom))
    return toast("Nombre inválido (solo letras)", "warning");

  if (!validarNombre(data.estApe))
    return toast("Apellido inválido (solo letras)", "warning");

  if (!validarTelefono(data.estTel))
    return toast("Teléfono inválido (10 dígitos)", "warning");

  if (!validarDireccion(data.estDir))
    return toast("Dirección demasiado corta", "warning");

  try {
    const resp = await fetch(API_ALUMNOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error("Error al crear alumno");

    toast("Alumno creado correctamente", "success");

    bootstrap.Modal.getInstance(document.getElementById("modalCrearAlumno")).hide();
    fetchAlumnos();

  } catch (e) {
    console.error(e);
    toast("Error al crear alumno", "error");
  }
}


// ======================================================================
// ========================= EDITAR ALUMNO ===============================
// ======================================================================

async function abrirModalEditarAlumno(ced) {
  const modal = new bootstrap.Modal("#modalEditarAlumno");
  const form = document.getElementById("formEditarAlumno");

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

    modal.show();

  } catch (e) {
    console.error(e);
    toast("No se pudo cargar alumno", "error");
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

  if (!data.estNom || !data.estApe || !data.estTel || !data.estDir)
    return toast("Todos los campos son obligatorios", "warning");

  if (!validarNombre(data.estNom))
    return toast("Nombre inválido", "warning");

  if (!validarNombre(data.estApe))
    return toast("Apellido inválido", "warning");

  if (!validarTelefono(data.estTel))
    return toast("Teléfono inválido", "warning");

  if (!validarDireccion(data.estDir))
    return toast("Dirección inválida", "warning");

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error("Error en actualización");

    toast("Alumno actualizado correctamente", "success");

    bootstrap.Modal.getInstance(document.getElementById("modalEditarAlumno")).hide();
    fetchAlumnos();

  } catch (e) {
    console.error(e);
    toast("No se pudo actualizar", "error");
  }
}


// ======================================================================
// ========================= ELIMINAR ALUMNO ============================
// ======================================================================

async function eliminarAlumno(ced) {
  if (!(await confirmDialog("Eliminar alumno", `¿Eliminar al alumno ${ced}?`)))
    return;

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!resp.ok) throw new Error("Error al eliminar");

    toast("Alumno eliminado", "success");
    fetchAlumnos();

  } catch (e) {
    console.error(e);
    toast("Error eliminando alumno", "error");
  }
}


// ======================================================================
// ========================= CRUD CURSOS ================================
// ======================================================================

async function fetchCursos() {
  try {
    const resp = await fetch(API_CURSOS, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error al cargar cursos");
    cursosData = await resp.json();
    cursosPage = 1;
    renderCursosTable();
  } catch (e) {
    console.error(e);
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
      (c) => `
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

  const info = document.getElementById("cursosPaginationInfo");
  if (info) {
    info.textContent = total
      ? `Mostrando ${items.length} de ${total}`
      : "Sin resultados";
  }

  const btnPrev = document.getElementById("cursosPrev");
  const btnNext = document.getElementById("cursosNext");
  if (btnPrev) btnPrev.disabled = cursosPage <= 1;
  if (btnNext) btnNext.disabled = cursosPage >= totalPages;
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
  const nom = document.getElementById("filterCursoNombre");
  const ced = document.getElementById("filterCursoAlumnoCed");

  cursosFilters.nombre = nom ? nom.value.trim() : "";
  cursosFilters.alumnoCed = ced ? ced.value.trim() : "";

  cursosPage = 1;
  renderCursosTable();
}


// ======================================================================
// ========================= AUTOCOMPLETE CÉDULA ========================
// ======================================================================

async function cargarCedulas() {
  try {
    const resp = await fetch(API_ALUMNOS, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error cargando alumnos para autocomplete");
    alumnosParaAutocomplete = await resp.json();
  } catch (e) {
    console.error(e);
    toast("No se pudieron cargar cédulas", "error");
  }
}


function autocompletarCedula(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);

  if (!input || !list) return;

  input.addEventListener("input", () => {
    const val = input.value.trim().toLowerCase();

    if (!val) {
      list.innerHTML = "";
      return;
    }

    const results = alumnosParaAutocomplete
      .filter((a) => (a.estCed || "").startsWith(val))
      .slice(0, 7);

    list.innerHTML = results
      .map(
        (a) => `
        <div class="ac-item" data-value="${a.estCed}">
            ${a.estCed} — ${a.estNom} ${a.estApe}
        </div>`
      )
      .join("");

    list.querySelectorAll(".ac-item").forEach((el) => {
      el.onclick = () => {
        input.value = el.dataset.value;
        list.innerHTML = "";
      };
    });
  });
}


// ======================================================================
// ========================= CREAR CURSO ================================
// ======================================================================

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

  if (!data.nombre || !data.alumnoCed) {
    return toast("Todos los campos son obligatorios", "warning");
  }

  if (!validarNombreCurso(data.nombre))
    return toast("El nombre del curso no es válido", "warning");

  if (!validarCedulaEcuatoriana(data.alumnoCed))
    return toast("La cédula no es válida", "warning");

  try {
    const resp = await fetch(API_CURSOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error("Error al crear curso");

    toast("Curso creado correctamente", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalCrearCurso")).hide();
    fetchCursos();

  } catch (e) {
    console.error(e);
    toast("Error al crear curso", "error");
  }
}


// ======================================================================
// ========================= EDITAR CURSO ===============================
// ======================================================================

async function abrirModalEditarCurso(id) {
  const modal = new bootstrap.Modal("#modalEditarCurso");
  const form = document.getElementById("formEditarCurso");

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error al cargar curso");

    const c = await resp.json();

    form.idE.value = c.id;
    form.nombreE.value = c.nombre;
    form.alumnoCedE.value = c.alumnoCed;

    clearValidation(form);
    attachLiveValidation(form);

    modal.show();

  } catch (e) {
    console.error(e);
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

  if (!data.nombre || !data.alumnoCed) {
    return toast("Todos los campos son obligatorios", "warning");
  }

  if (!validarNombreCurso(data.nombre))
    return toast("Nombre del curso no válido", "warning");

  if (!validarCedulaEcuatoriana(data.alumnoCed))
    return toast("Cédula inválida", "warning");

  try {
    const resp = await fetch(`${API_CURSOS}/${f.idE.value}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error("Error al actualizar curso");

    toast("Curso actualizado correctamente", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalEditarCurso")).hide();
    fetchCursos();

  } catch (e) {
    console.error(e);
    toast("Error al actualizar curso", "error");
  }
}


// ======================================================================
// ========================= ELIMINAR CURSO =============================
// ======================================================================

async function eliminarCurso(id) {
  if (!(await confirmDialog("Eliminar curso", `¿Eliminar el curso ${id}?`))) return;

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!resp.ok) throw new Error("Error al eliminar curso");

    toast("Curso eliminado", "success");
    fetchCursos();

  } catch (e) {
    console.error(e);
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
    // Cargar alumnos y cursos simultáneamente
    const [respAl, respCu] = await Promise.all([
      fetch(API_ALUMNOS, { headers: getHeaders() }),
      fetch(API_CURSOS, { headers: getHeaders() }),
    ]);

    if (!respAl.ok || !respCu.ok) throw new Error("Error cargando datos");

    const alumnos = await respAl.json();
    const cursos = await respCu.json();

    // ====================
    //  TOTALES
    // ====================
    const totalAlumnosSpan = document.getElementById("totalAlumnos");
    const totalCursosSpan = document.getElementById("totalCursos");
    const userNameSpan = document.getElementById("userName");

    if (totalAlumnosSpan) totalAlumnosSpan.textContent = alumnos.length;
    if (totalCursosSpan) totalCursosSpan.textContent = cursos.length;
    if (userNameSpan) userNameSpan.textContent =
      localStorage.getItem("username") || "ADMIN";

    // ================================
    //  ULTIMOS 5 ALUMNOS REGISTRADOS
    // ================================
    const ultimos = alumnos.slice(-5); // si luego agregas fecha, aquí se ordena por fecha
    const tbody = document.getElementById("tbodyUltimos");

    if (tbody) {
      tbody.innerHTML = ultimos
        .map((a) => {
          const cursoAlumno = cursos.find((c) => c.alumnoCed === a.estCed);
          return `
            <tr>
              <td>${a.estCed}</td>
              <td>${a.estNom} ${a.estApe}</td>
              <td>${cursoAlumno ? cursoAlumno.nombre : "<span class='text-muted'>Sin curso</span>"}</td>
            </tr>
          `;
        })
        .join("");
    }

    // ======================================
    //  CURSOS POR ALUMNO (TOP 10)
    // ======================================

    const conteoCursosPorAlumno = {};

    cursos.forEach((c) => {
      const key = c.alumnoNombreCompleto || c.alumnoCed;
      conteoCursosPorAlumno[key] = (conteoCursosPorAlumno[key] || 0) + 1;
    });

    let listaAlumnosTop = Object.entries(conteoCursosPorAlumno)
      .sort((a, b) => b[1] - a[1]) // ordenar descendente
      .slice(0, 10); // top 10

    const labelsAlumnos = listaAlumnosTop.map((x) => x[0]);
    const dataAlumnos = listaAlumnosTop.map((x) => x[1]);

    // ================================
    //  CURSOS ÚNICOS (SIN REPETIDOS)
    // ================================

    const cursosUnicosConteo = {};

    cursos.forEach((c) => {
      const nombre = (c.nombre || "").trim().toLowerCase();
      if (!nombre) return;
      cursosUnicosConteo[nombre] = (cursosUnicosConteo[nombre] || 0) + 1;
    });

    let listaCursosTop = Object.entries(cursosUnicosConteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labelsCursos = listaCursosTop.map((x) => x[0]);
    const dataCursos = listaCursosTop.map((x) => x[1]);

    // ================================
    //  GRAFICA: CURSOS POR ALUMNO
    // ================================
    const ctx1 = document.getElementById("chartCursosPorAlumno");
    if (ctx1) {
      new Chart(ctx1, {
        type: "bar",
        data: {
          labels: labelsAlumnos,
          datasets: [
            {
              label: "Cursos por alumno",
              data: dataAlumnos,
              backgroundColor: "rgba(0, 123, 255, 0.7)",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      });
    }

    // ====================================
    //  GRAFICA: CURSOS REPETIDOS (TOP 10)
    // ====================================
    const ctx2 = document.getElementById("chartCursosUnicos");
    if (ctx2) {
      new Chart(ctx2, {
        type: "bar",
        data: {
          labels: labelsCursos,
          datasets: [
            {
              label: "Veces repetido",
              data: dataCursos,
              backgroundColor: "rgba(40, 167, 69, 0.7)",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      });
    }

  } catch (e) {
    console.error(e);
    toast("Error cargando dashboard", "error");
  }
}


// ======================================================================
// ========================= INIT PAGES (FINAL) ==========================
// ======================================================================

function initAlumnosPage() {
  loadTheme();
  ensureAuth();
  fetchAlumnos();

  const navUser = document.getElementById("userNameNav");
  if (navUser) navUser.textContent = localStorage.getItem("username") || "";
}

async function initCursosPage() {
  loadTheme();
  ensureAdmin();

  await cargarCedulas();
  autocompletarCedula("alumnoCed", "listaCedulas");
  fetchCursos();

  const navUser = document.getElementById("userNameNav");
  if (navUser) navUser.textContent = localStorage.getItem("username") || "ADMIN";
}

function initDashboardPage() {
  loadTheme();
  ensureAdmin();
  initDashboard();
}

// ======================================================================
// ========================= FIN DEL ARCHIVO ============================
// ======================================================================

console.log("app.js cargado correctamente ✔️");
