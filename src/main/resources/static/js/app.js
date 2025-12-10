// ======================================================================
// ========================= CONFIG GLOBAL ==============================
// ======================================================================

const API_BASE = "https://alumnos-api-e65o.onrender.com";
const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";

let alumnosData = [];
let cursosData = [];

let alumnosPage = 1;
const alumnosPageSize = 5;

let cursosPage = 1;
const cursosPageSize = 5;

let alumnosSearch = "";
let alumnosFilters = { cedula: "", nombre: "", apellido: "" };

let cursosSearch = "";
let cursosFilters = { nombre: "", nivel: "", paralelo: "" };

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

  if (!user || !pass) {
    return toast("Debe ingresar usuario y contraseña", "warning");
  }

  const basic = "Basic " + btoa(user + ":" + pass);

  try {
    // Llamamos a /auth/login para saber usuario + rol
    const resp = await fetch(API_BASE + "/auth/login", {
      headers: { Authorization: basic },
    });

    if (!resp.ok) throw new Error("Usuario o contraseña incorrectos");

    const data = await resp.json();

    localStorage.setItem("auth", basic);
    localStorage.setItem("username", data.user.toUpperCase());
    localStorage.setItem("role", data.role.toUpperCase());

    toast("Bienvenido " + data.user, "success");

    if (data.role.toUpperCase() === "ADMIN") {
      location.href = "dashboard.html";
    } else {
      location.href = "alumnos.html";
    }
  } catch (err) {
    console.error(err);
    toast(err.message || "Error de autenticación", "error");
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
// ========================= VALIDACIONES ===============================
// ======================================================================

// Cédula ecuatoriana (10 dígitos)
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

  return (
    digitoCalculado === digitoVerificador ||
    (digitoCalculado === 10 && digitoVerificador === 0)
  );
}

function validarNombrePersona(texto) {
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,40}$/.test(texto);
}

function validarTelefono(tel) {
  return /^\d{10}$/.test(tel);
}

function validarDireccion(dir) {
  return dir && dir.trim().length >= 5;
}

function validarNombreCurso(texto) {
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]{3,40}$/.test(texto);
}

function validarNivel(nivel) {
  // Ej: "1ro", "2do", "3ro", "Básico", "Inicial", etc.
  return nivel && nivel.trim().length >= 2;
}

function validarParalelo(p) {
  // Ej: "A", "B", "C"
  return /^[A-Za-z0-9]{1,3}$/.test(p);
}

function attachLiveValidation(form) {
  const inputs = form.querySelectorAll("input[required], textarea[required], select[required]");
  inputs.forEach((i) => {
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
  form.querySelectorAll("input, textarea, select").forEach((i) =>
    i.classList.remove("is-valid", "is-invalid")
  );
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
    result = result.filter((a) => a.estCed.includes(alumnosFilters.cedula));

  if (alumnosFilters.nombre)
    result = result.filter((a) =>
      a.estNom.toLowerCase().includes(alumnosFilters.nombre.toLowerCase())
    );

  if (alumnosFilters.apellido)
    result = result.filter((a) =>
      a.estApe.toLowerCase().includes(alumnosFilters.apellido.toLowerCase())
    );

  if (alumnosSearch) {
    const q = alumnosSearch.toLowerCase();
    result = result.filter((a) =>
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
    result = result.filter((c) =>
      c.nombre.toLowerCase().includes(cursosFilters.nombre.toLowerCase())
    );

  if (cursosFilters.nivel)
    result = result.filter((c) =>
      (c.nivel || "").toLowerCase().includes(cursosFilters.nivel.toLowerCase())
    );

  if (cursosFilters.paralelo)
    result = result.filter((c) =>
      (c.paralelo || "").toLowerCase().includes(cursosFilters.paralelo.toLowerCase())
    );

  if (cursosSearch) {
    const q = cursosSearch.toLowerCase();
    result = result.filter((c) =>
      `${c.id} ${c.nombre} ${c.nivel} ${c.paralelo}`.toLowerCase().includes(q)
    );
  }

  return result;
}

// ======================================================================
// ========================= CARGA GLOBAL ===============================
// ======================================================================

async function cargarAlumnos() {
  try {
    const resp = await fetch(API_ALUMNOS, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error al cargar alumnos");
    alumnosData = await resp.json();
  } catch (e) {
    console.error(e);
    toast("Error al cargar alumnos", "error");
  }
}

async function cargarCursos() {
  try {
    const resp = await fetch(API_CURSOS, { headers: getHeaders() });
    if (!resp.ok) throw new Error("Error al cargar cursos");
    cursosData = await resp.json();
  } catch (e) {
    console.error(e);
    toast("Error al cargar cursos", "error");
  }
}

function getCursoLabelById(cursoId) {
  if (!cursoId || !cursosData || cursosData.length === 0) return "Sin curso";
  const c = cursosData.find((c) => c.id === cursoId);
  if (!c) return "Sin curso";
  return `${c.nombre} (${c.nivel}-${c.paralelo})`;
}

// ======================================================================
// ========================= CRUD ALUMNOS ===============================
// ======================================================================

function renderAlumnos() {
  const tbody = document.getElementById("tbodyAlumnos");
  if (!tbody) return;

  const filtered = applyAlumnosFilters();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / alumnosPageSize));

  if (alumnosPage > totalPages) alumnosPage = totalPages;

  const items = paginate(filtered, alumnosPage, alumnosPageSize);

  tbody.innerHTML = items
    .map((a) => {
      const cursoLabel = getCursoLabelById(a.cursoId);
      return `
        <tr>
          <td>${a.estCed}</td>
          <td>${a.estNom}</td>
          <td>${a.estApe}</td>
          <td>${a.estTel || ""}</td>
          <td>${a.estDir || ""}</td>
          <td>${cursoLabel}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-info me-1"
              onclick="verCursoDeAlumno('${a.estCed}')">
              Ver curso
            </button>
            <button class="btn btn-sm btn-warning me-1"
              onclick="abrirModalEditarAlumno('${a.estCed}')">
              Editar
            </button>
            <button class="btn btn-sm btn-danger"
              onclick="eliminarAlumno('${a.estCed}')">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  const info = document.getElementById("alumnosPaginationInfo");
  if (info) {
    const start = total === 0 ? 0 : (alumnosPage - 1) * alumnosPageSize + 1;
    const end = Math.min(alumnosPage * alumnosPageSize, total);
    info.textContent = total
      ? `Mostrando ${start}-${end} de ${total}`
      : "Sin resultados";
  }

  const prev = document.getElementById("alumnosPrev");
  const next = document.getElementById("alumnosNext");
  if (prev) prev.disabled = alumnosPage <= 1;
  if (next) next.disabled = alumnosPage >= totalPages;
}

function alumnosCambioPagina(n) {
  alumnosPage += n;
  renderAlumnos();
}

function alumnosCambioSearch(input) {
  alumnosSearch = input.value.trim();
  alumnosPage = 1;
  renderAlumnos();
}

function alumnosCambioFiltros() {
  const ced = document.getElementById("filterCedula");
  const nom = document.getElementById("filterNombre");
  const ape = document.getElementById("filterApellido");

  alumnosFilters.cedula = ced ? ced.value.trim() : "";
  alumnosFilters.nombre = nom ? nom.value.trim() : "";
  alumnosFilters.apellido = ape ? ape.value.trim() : "";

  alumnosPage = 1;
  renderAlumnos();
}

// ---------- Crear Alumno ----------

function cargarSelectCursos(select) {
  if (!select) return;
  select.innerHTML =
    `<option value="">-- Seleccione curso --</option>` +
    cursosData
      .map(
        (c) =>
          `<option value="${c.id}">
             ${c.nombre} (${c.nivel}-${c.paralelo})
           </option>`
      )
      .join("");
}

function abrirModalCrearAlumno() {
  const modalEl = document.getElementById("modalCrearAlumno");
  const form = document.getElementById("formCrearAlumno");
  if (!modalEl || !form) return;

  form.reset();
  clearValidation(form);
  attachLiveValidation(form);
  cargarSelectCursos(form.cursoId);

  const modal = new bootstrap.Modal(modalEl);
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
    cursoId: f.cursoId.value ? Number(f.cursoId.value) : null,
  };

  if (!validarCedulaEcuatoriana(data.estCed))
    return toast("Cédula inválida", "error");
  if (!validarNombrePersona(data.estNom))
    return toast("Nombre inválido", "warning");
  if (!validarNombrePersona(data.estApe))
    return toast("Apellido inválido", "warning");
  if (!validarTelefono(data.estTel))
    return toast("Teléfono inválido (10 dígitos)", "warning");
  if (!validarDireccion(data.estDir))
    return toast("Dirección demasiado corta", "warning");
  if (!data.cursoId)
    return toast("Debe seleccionar un curso", "warning");

  try {
    const resp = await fetch(API_ALUMNOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al crear alumno");

    toast("Alumno creado correctamente", "success");
    bootstrap.Modal.getInstance(
      document.getElementById("modalCrearAlumno")
    ).hide();

    await cargarAlumnos();
    renderAlumnos();
  } catch (e) {
    console.error(e);
    toast("Error al crear alumno", "error");
  }
}

// ---------- Editar Alumno ----------

async function abrirModalEditarAlumno(ced) {
  const modalEl = document.getElementById("modalEditarAlumno");
  const form = document.getElementById("formEditarAlumno");
  if (!modalEl || !form) return;

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      headers: getHeaders(),
    });
    if (!resp.ok) throw new Error("No se pudo cargar el alumno");

    const a = await resp.json();

    form.estCedE.value = a.estCed;
    form.estNomE.value = a.estNom;
    form.estApeE.value = a.estApe;
    form.estTelE.value = a.estTel || "";
    form.estDirE.value = a.estDir || "";

    cargarSelectCursos(form.cursoIdE);
    if (a.cursoId) form.cursoIdE.value = a.cursoId;

    clearValidation(form);
    attachLiveValidation(form);

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (e) {
    console.error(e);
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
    cursoId: f.cursoIdE.value ? Number(f.cursoIdE.value) : null,
  };

  if (!validarNombrePersona(data.estNom))
    return toast("Nombre inválido", "warning");
  if (!validarNombrePersona(data.estApe))
    return toast("Apellido inválido", "warning");
  if (!validarTelefono(data.estTel))
    return toast("Teléfono inválido", "warning");
  if (!validarDireccion(data.estDir))
    return toast("Dirección inválida", "warning");
  if (!data.cursoId)
    return toast("Debe seleccionar un curso", "warning");

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al actualizar alumno");

    toast("Alumno actualizado", "success");
    bootstrap.Modal.getInstance(
      document.getElementById("modalEditarAlumno")
    ).hide();

    await cargarAlumnos();
    renderAlumnos();
  } catch (e) {
    console.error(e);
    toast("No se pudo actualizar", "error");
  }
}

// ---------- Eliminar Alumno ----------

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
    await cargarAlumnos();
    renderAlumnos();
  } catch (e) {
    console.error(e);
    toast("Error eliminando alumno", "error");
  }
}

// ---------- Consultar curso al que pertenece un alumno ----------

async function verCursoDeAlumno(ced) {
  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}/curso`, {
      headers: getHeaders(),
    });

    if (!resp.ok) {
      toast("El alumno no tiene curso asignado", "info");
      return;
    }

    const curso = await resp.json();

    Swal.fire({
      icon: "info",
      title: "Curso del estudiante",
      html: `
        <p><b>Cédula:</b> ${ced}</p>
        <p><b>Curso:</b> ${curso.nombre}</p>
        <p><b>Nivel:</b> ${curso.nivel}</p>
        <p><b>Paralelo:</b> ${curso.paralelo}</p>
      `,
    });
  } catch (e) {
    console.error(e);
    toast("Error consultando curso del estudiante", "error");
  }
}

// ======================================================================
// ========================= CRUD CURSOS ================================
// ======================================================================

function renderCursos() {
  const tbody = document.getElementById("tbodyCursos");
  if (!tbody) return;

  const filtered = applyCursosFilters();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / cursosPageSize));

  if (cursosPage > totalPages) cursosPage = totalPages;

  const items = paginate(filtered, cursosPage, cursosPageSize);

  tbody.innerHTML = items
    .map((c) => {
      const cantidadEst = alumnosData.filter((a) => a.cursoId === c.id).length;
      return `
        <tr>
          <td>${c.id}</td>
          <td>${c.nombre}</td>
          <td>${c.nivel}</td>
          <td>${c.paralelo}</td>
          <td>${cantidadEst}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-info me-1"
              onclick="verEstudiantesDelCurso(${c.id})">
              Ver estudiantes
            </button>
            <button class="btn btn-sm btn-warning me-1"
              onclick="abrirModalEditarCurso(${c.id})">
              Editar
            </button>
            <button class="btn btn-sm btn-danger"
              onclick="eliminarCurso(${c.id})">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  const info = document.getElementById("cursosPaginationInfo");
  if (info) {
    const start = total === 0 ? 0 : (cursosPage - 1) * cursosPageSize + 1;
    const end = Math.min(cursosPage * cursosPageSize, total);
    info.textContent = total
      ? `Mostrando ${start}-${end} de ${total}`
      : "Sin resultados";
  }

  const prev = document.getElementById("cursosPrev");
  const next = document.getElementById("cursosNext");
  if (prev) prev.disabled = cursosPage <= 1;
  if (next) next.disabled = cursosPage >= totalPages;
}

function cursosCambioPagina(n) {
  cursosPage += n;
  renderCursos();
}

function cursosCambioSearch(input) {
  cursosSearch = input.value.trim();
  cursosPage = 1;
  renderCursos();
}

function cursosCambioFiltros() {
  const nom = document.getElementById("filterCursoNombre");
  const niv = document.getElementById("filterCursoNivel");
  const par = document.getElementById("filterCursoParalelo");

  cursosFilters.nombre = nom ? nom.value.trim() : "";
  cursosFilters.nivel = niv ? niv.value.trim() : "";
  cursosFilters.paralelo = par ? par.value.trim() : "";

  cursosPage = 1;
  renderCursos();
}

// ---------- Crear Curso ----------

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
  const f = e.target;

  const data = {
    nombre: f.nombre.value.trim(),
    nivel: f.nivel.value.trim(),
    paralelo: f.paralelo.value.trim(),
  };

  if (!validarNombreCurso(data.nombre))
    return toast("Nombre de curso inválido", "warning");
  if (!validarNivel(data.nivel))
    return toast("Nivel inválido", "warning");
  if (!validarParalelo(data.paralelo))
    return toast("Paralelo inválido", "warning");

  try {
    const resp = await fetch(API_CURSOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al crear curso");

    toast("Curso creado correctamente", "success");
    bootstrap.Modal.getInstance(
      document.getElementById("modalCrearCurso")
    ).hide();

    await cargarCursos();
    renderCursos();
  } catch (e) {
    console.error(e);
    toast("Error al crear curso", "error");
  }
}

// ---------- Editar Curso ----------

async function abrirModalEditarCurso(id) {
  const modalEl = document.getElementById("modalEditarCurso");
  const form = document.getElementById("formEditarCurso");
  if (!modalEl || !form) return;

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      headers: getHeaders(),
    });
    if (!resp.ok) throw new Error("No se pudo cargar el curso");

    const c = await resp.json();

    form.idE.value = c.id;
    form.nombreE.value = c.nombre;
    form.nivelE.value = c.nivel;
    form.paraleloE.value = c.paralelo;

    clearValidation(form);
    attachLiveValidation(form);

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (e) {
    console.error(e);
    toast("Error al cargar curso", "error");
  }
}

async function actualizarCurso(e) {
  e.preventDefault();
  const f = e.target;

  const id = f.idE.value;

  const data = {
    nombre: f.nombreE.value.trim(),
    nivel: f.nivelE.value.trim(),
    paralelo: f.paraleloE.value.trim(),
  };

  if (!validarNombreCurso(data.nombre))
    return toast("Nombre de curso inválido", "warning");
  if (!validarNivel(data.nivel))
    return toast("Nivel inválido", "warning");
  if (!validarParalelo(data.paralelo))
    return toast("Paralelo inválido", "warning");

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Error al actualizar curso");

    toast("Curso actualizado correctamente", "success");
    bootstrap.Modal.getInstance(
      document.getElementById("modalEditarCurso")
    ).hide();

    await cargarCursos();
    renderCursos();
  } catch (e) {
    console.error(e);
    toast("Error al actualizar curso", "error");
  }
}

// ---------- Eliminar Curso ----------

async function eliminarCurso(id) {
  if (!(await confirmDialog("Eliminar curso", `¿Eliminar el curso ${id}?`)))
    return;

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!resp.ok) throw new Error("Error al eliminar curso");

    toast("Curso eliminado", "success");
    await cargarCursos();
    await cargarAlumnos();
    renderCursos();
  } catch (e) {
    console.error(e);
    toast("Error al eliminar curso", "error");
  }
}

// ---------- Obtener todos los estudiantes que pertenecen a un curso ----------

async function verEstudiantesDelCurso(id) {
  try {
    const resp = await fetch(`${API_CURSOS}/${id}/alumnos`, {
      headers: getHeaders(),
    });

    if (!resp.ok) throw new Error("Error consultando alumnos del curso");

    const alumnosCurso = await resp.json();

    if (!alumnosCurso.length) {
      Swal.fire({
        icon: "info",
        title: "Sin estudiantes",
        text: "Este curso no tiene estudiantes asignados.",
      });
      return;
    }

    const html = `
      <ul class="list-group">
        ${alumnosCurso
          .map(
            (a) =>
              `<li class="list-group-item">
                <b>${a.estCed}</b> - ${a.estNom} ${a.estApe}
              </li>`
          )
          .join("")}
      </ul>
    `;

    Swal.fire({
      icon: "info",
      title: "Estudiantes del curso",
      html,
      width: 600,
    });
  } catch (e) {
    console.error(e);
    toast("Error al obtener estudiantes del curso", "error");
  }
}

// ======================================================================
// ========================= DASHBOARD ==================================
// ======================================================================

async function initDashboard() {
  loadTheme();
  ensureAdmin();

  try {
    const [respAlumnos, respCursos] = await Promise.all([
      fetch(API_ALUMNOS, { headers: getHeaders() }),
      fetch(API_CURSOS, { headers: getHeaders() }),
    ]);

    if (!respAlumnos.ok || !respCursos.ok) {
      throw new Error("Error cargando datos");
    }

    const alumnos = await respAlumnos.json();
    const cursos = await respCursos.json();

    document.getElementById("totalAlumnos").textContent = alumnos.length;
    document.getElementById("totalCursos").textContent = cursos.length;
    document.getElementById("userName").textContent =
      localStorage.getItem("username") || "ADMIN";

    // Últimos 5 alumnos
    const ultimos = alumnos.slice(-5);
    const tbody = document.getElementById("tbodyUltimos");

    tbody.innerHTML = ultimos
      .map((a) => {
        const curso = cursos.find((c) => c.id === a.cursoId);
        return `
          <tr>
            <td>${a.estCed}</td>
            <td>${a.estNom} ${a.estApe}</td>
            <td>${
              curso
                ? `${curso.nombre} (${curso.nivel}-${curso.paralelo})`
                : "<span class='text-muted'>Sin curso</span>"
            }</td>
          </tr>
        `;
      })
      .join("");

    // Conteo alumnos por curso
    const conteo = {};
    alumnos.forEach((a) => {
      const curso = cursos.find((c) => c.id === a.cursoId);
      const key = curso
        ? `${curso.nombre} (${curso.nivel}-${curso.paralelo})`
        : "Sin curso";
      conteo[key] = (conteo[key] || 0) + 1;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    const ctx = document.getElementById("chartAlumnosPorCurso");

    if (ctx) {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Estudiantes por curso",
              data,
              backgroundColor: "rgba(0,123,255,0.6)",
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
// ========================= INIT PAGES =================================
// ======================================================================

async function initAlumnosPage() {
  loadTheme();
  ensureAuth();

  await cargarCursos();
  await cargarAlumnos();
  renderAlumnos();

  const navUser = document.getElementById("userNameNav");
  if (navUser) navUser.textContent = localStorage.getItem("username") || "";
}

async function initCursosPage() {
  loadTheme();
  ensureAdmin();

  await cargarCursos();
  await cargarAlumnos();
  renderCursos();

  const navUser = document.getElementById("userNameNav");
  if (navUser) navUser.textContent = localStorage.getItem("username") || "ADMIN";
}

function initDashboardPage() {
  loadTheme();
  ensureAdmin();
  initDashboard();
}

console.log("app.js cargado correctamente ✔️");
