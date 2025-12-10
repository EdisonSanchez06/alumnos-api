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
  const theme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
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
    const resp = await fetch(API_BASE + "/auth/login", {
      headers: { Authorization: basic },
    });

    if (!resp.ok) throw new Error("Usuario o contraseña incorrectos");

    const data = await resp.json();

    localStorage.setItem("auth", basic);
    localStorage.setItem("username", data.user.toUpperCase());
    localStorage.setItem("role", data.role.toUpperCase());

    toast("Bienvenido " + data.user, "success");

    location.href = data.role === "ADMIN" ? "dashboard.html" : "alumnos.html";

  } catch (err) {
    toast(err.message, "error");
  }
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}

function ensureAuth() {
  if (!localStorage.getItem("auth")) location.href = "login.html";
}

function ensureAdmin() {
  ensureAuth();
  if (localStorage.getItem("role") !== "ADMIN") {
    toast("No permitido", "error");
    setTimeout(() => (location.href = "alumnos.html"), 1200);
  }
}

// ======================================================================
// ========================= VALIDACIONES ===============================
// ======================================================================

function validarCedulaEcuatoriana(ced) {
  if (!/^\d{10}$/.test(ced)) return false;

  const provincia = parseInt(ced.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const digitoV = parseInt(ced[9]);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(ced[i]);
    if (i % 2 === 0) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    suma += valor;
  }

  const decena = Math.ceil(suma / 10) * 10;
  const digitoCalc = decena - suma;

  return (digitoCalc === digitoV || (digitoCalc === 10 && digitoV === 0));
}

function validarNombrePersona(txt) {
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,40}$/.test(txt);
}

function validarTelefono(tel) {
  return /^\d{10}$/.test(tel);
}

function validarDireccion(dir) {
  return dir.trim().length >= 5;
}

function validarNombreCurso(txt) {
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]{3,40}$/.test(txt);
}

function validarNivel(niv) {
  return niv.trim().length >= 1;
}

function validarParalelo(par) {
  return /^[A-Za-z0-9]{1,3}$/.test(par);
}

function attachLiveValidation(form) {
  const inputs = form.querySelectorAll("input[required], textarea[required], select[required]");
  inputs.forEach((i) =>
    i.addEventListener("input", () => {
      i.classList.toggle("is-invalid", !i.value.trim());
      i.classList.toggle("is-valid", i.value.trim());
    })
  );
}

function clearValidation(form) {
  form.querySelectorAll("input, textarea, select").forEach((i) =>
    i.classList.remove("is-valid", "is-invalid")
  );
}

// ======================================================================
// ========================= CARGA GLOBAL ===============================
// ======================================================================

async function cargarAlumnos() {
  try {
    const resp = await fetch(API_ALUMNOS, { headers: getHeaders() });
    alumnosData = await resp.json();
  } catch {
    toast("Error al cargar alumnos", "error");
  }
}

async function cargarCursos() {
  try {
    const resp = await fetch(API_CURSOS, { headers: getHeaders() });
    cursosData = await resp.json();
  } catch {
    toast("Error al cargar cursos", "error");
  }
}

function getCursoLabelById(id) {
  const c = cursosData.find((x) => x.id === id);
  return c ? `${c.nombre} (${c.nivel}-${c.paralelo})` : "Sin curso";
}

// ======================================================================
// ========================= CRUD ALUMNOS ===============================
// ======================================================================

function renderAlumnos() {
  const tbody = document.getElementById("tbodyAlumnos");
  if (!tbody) return;

  let data = [...alumnosData];

  // filtros
  if (alumnosFilters.cedula)
    data = data.filter((a) => a.estCed.includes(alumnosFilters.cedula));

  if (alumnosFilters.nombre)
    data = data.filter((a) =>
      a.estNom.toLowerCase().includes(alumnosFilters.nombre.toLowerCase())
    );

  if (alumnosFilters.apellido)
    data = data.filter((a) =>
      a.estApe.toLowerCase().includes(alumnosFilters.apellido.toLowerCase())
    );

  if (alumnosSearch)
    data = data.filter((a) =>
      `${a.estCed} ${a.estNom} ${a.estApe}`.toLowerCase().includes(alumnosSearch.toLowerCase())
    );

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / alumnosPageSize));

  if (alumnosPage > totalPages) alumnosPage = totalPages;

  const items = data.slice(
    (alumnosPage - 1) * alumnosPageSize,
    alumnosPage * alumnosPageSize
  );

  tbody.innerHTML = items
    .map(
      (a) => `
    <tr>
      <td>${a.estCed}</td>
      <td>${a.estNom}</td>
      <td>${a.estApe}</td>
      <td>${a.estTel}</td>
      <td>${a.estDir}</td>
      <td>${getCursoLabelById(a.cursoId)}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-info" onclick="verCursoDeAlumno('${a.estCed}')">Ver curso</button>
        <button class="btn btn-sm btn-warning" onclick="abrirModalEditarAlumno('${a.estCed}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
      </td>
    </tr>`
    )
    .join("");

  const info = document.getElementById("alumnosPaginationInfo");
  if (info)
    info.textContent = total
      ? `Mostrando ${items.length} de ${total}`
      : "Sin resultados";
}

// ---------- Crear Alumno ----------

function cargarSelectCursos(select) {
  select.innerHTML =
    `<option value="">Seleccione un curso</option>` +
    cursosData
      .map(
        (c) =>
          `<option value="${c.id}">${c.nombre} (${c.nivel}-${c.paralelo})</option>`
      )
      .join("");
}

function abrirModalCrearAlumno() {
  const form = document.getElementById("formCrearAlumno");
  cargarSelectCursos(form.cursoId);
  form.reset();
  clearValidation(form);
  attachLiveValidation(form);
  new bootstrap.Modal(document.getElementById("modalCrearAlumno")).show();
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
    cursoId: Number(f.cursoId.value),
  };

  if (!validarCedulaEcuatoriana(data.estCed)) return toast("Cédula inválida", "error");
  if (!validarNombrePersona(data.estNom)) return toast("Nombre inválido", "error");
  if (!validarNombrePersona(data.estApe)) return toast("Apellido inválido", "error");
  if (!validarTelefono(data.estTel)) return toast("Teléfono inválido", "error");
  if (!validarDireccion(data.estDir)) return toast("Dirección inválida", "error");
  if (!data.cursoId) return toast("Debe seleccionar un curso", "warning");

  try {
    const resp = await fetch(API_ALUMNOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error();

    toast("Alumno creado ✔️", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalCrearAlumno")).hide();
    await cargarAlumnos();
    renderAlumnos();
  } catch {
    toast("Error creando alumno", "error");
  }
}

// ---------- Editar Alumno ----------

async function abrirModalEditarAlumno(ced) {
  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      headers: getHeaders(),
    });
    const a = await resp.json();

    const form = document.getElementById("formEditarAlumno");
    cargarSelectCursos(form.cursoIdE);

    form.estCedE.value = a.estCed;
    form.estNomE.value = a.estNom;
    form.estApeE.value = a.estApe;
    form.estTelE.value = a.estTel;
    form.estDirE.value = a.estDir;
    form.cursoIdE.value = a.cursoId;

    clearValidation(form);
    attachLiveValidation(form);

    new bootstrap.Modal(document.getElementById("modalEditarAlumno")).show();
  } catch {
    toast("Error cargando alumno", "error");
  }
}

async function actualizarAlumno(e) {
  e.preventDefault();
  const f = e.target;

  const data = {
    estNom: f.estNomE.value.trim(),
    estApe: f.estApeE.value.trim(),
    estTel: f.estTelE.value.trim(),
    estDir: f.estDirE.value.trim(),
    cursoId: Number(f.cursoIdE.value),
  };

  if (!validarNombrePersona(data.estNom)) return toast("Nombre inválido", "error");
  if (!validarNombrePersona(data.estApe)) return toast("Apellido inválido", "error");
  if (!validarTelefono(data.estTel)) return toast("Teléfono inválido", "error");
  if (!validarDireccion(data.estDir)) return toast("Dirección inválida", "error");
  if (!data.cursoId) return toast("Debe seleccionar un curso", "warning");

  try {
    const resp = await fetch(`${API_ALUMNOS}/${f.estCedE.value}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error();

    toast("Alumno actualizado ✔️", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalEditarAlumno")).hide();

    await cargarAlumnos();
    renderAlumnos();
  } catch {
    toast("Error actualizando alumno", "error");
  }
}

// ---------- Eliminar Alumno ----------

async function eliminarAlumno(ced) {
  if (!(await confirmDialog("Eliminar", `¿Eliminar al alumno ${ced}?`))) return;

  try {
    await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    toast("Alumno eliminado ✔️", "success");
    await cargarAlumnos();
    renderAlumnos();
  } catch {
    toast("Error eliminando alumno", "error");
  }
}

// ---------- Ver curso de alumno ----------

async function verCursoDeAlumno(ced) {
  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}/curso`, {
      headers: getHeaders(),
    });

    if (!resp.ok) return toast("Alumno sin curso asignado", "info");

    const c = await resp.json();

    Swal.fire({
      icon: "info",
      title: "Curso del alumno",
      html: `
        <p><b>Curso:</b> ${c.nombre}</p>
        <p><b>Nivel:</b> ${c.nivel}</p>
        <p><b>Paralelo:</b> ${c.paralelo}</p>
      `,
    });
  } catch {
    toast("Error consultando curso", "error");
  }
}

// ======================================================================
// ========================= CRUD CURSOS ================================
// ======================================================================

function renderCursos() {
  const tbody = document.getElementById("tbodyCursos");
  if (!tbody) return;

  let data = [...cursosData];

  if (cursosFilters.nombre)
    data = data.filter((c) => c.nombre.toLowerCase().includes(cursosFilters.nombre.toLowerCase()));

  if (cursosFilters.nivel)
    data = data.filter((c) => c.nivel.toLowerCase().includes(cursosFilters.nivel.toLowerCase()));

  if (cursosFilters.paralelo)
    data = data.filter((c) => c.paralelo.toLowerCase().includes(cursosFilters.paralelo.toLowerCase()));

  if (cursosSearch)
    data = data.filter((c) =>
      `${c.nombre} ${c.nivel} ${c.paralelo}`.toLowerCase().includes(cursosSearch.toLowerCase())
    );

  const total = data.length;
  const totalPages = Math.ceil(total / cursosPageSize);

  if (cursosPage > totalPages) cursosPage = totalPages;

  const items = data.slice((cursosPage - 1) * cursosPageSize, cursosPage * cursosPageSize);

  tbody.innerHTML = items
    .map((c) => {
      const cant = alumnosData.filter((a) => a.cursoId === c.id).length;
      return `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.nivel}</td>
        <td>${c.paralelo}</td>
        <td>${cant}</td>
        <td class="text-center">
          <button class="btn btn-outline-info btn-sm" onclick="verEstudiantesDelCurso(${c.id})">Ver alumnos</button>
          <button class="btn btn-warning btn-sm" onclick="abrirModalEditarCurso(${c.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarCurso(${c.id})">Eliminar</button>
        </td>
      </tr>`;
    })
    .join("");
}

// ---------- Crear curso ----------

function abrirModalCrearCurso() {
  const form = document.getElementById("formCrearCurso");
  form.reset();
  clearValidation(form);
  attachLiveValidation(form);
  new bootstrap.Modal(document.getElementById("modalCrearCurso")).show();
}

async function crearCurso(e) {
  e.preventDefault();
  const f = e.target;

  const data = {
    nombre: f.nombre.value.trim(),
    nivel: f.nivel.value.trim(),
    paralelo: f.paralelo.value.trim(),
  };

  if (!validarNombreCurso(data.nombre)) return toast("Nombre inválido", "warning");
  if (!validarNivel(data.nivel)) return toast("Nivel inválido", "warning");
  if (!validarParalelo(data.paralelo)) return toast("Paralelo inválido", "warning");

  try {
    const resp = await fetch(API_CURSOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error();

    toast("Curso creado ✔️", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalCrearCurso")).hide();

    await cargarCursos();
    renderCursos();
  } catch {
    toast("Error creando curso", "error");
  }
}

// ---------- Editar curso ----------

async function abrirModalEditarCurso(id) {
  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      headers: getHeaders(),
    });
    const c = await resp.json();

    const form = document.getElementById("formEditarCurso");
    form.idE.value = c.id;
    form.nombreE.value = c.nombre;
    form.nivelE.value = c.nivel;
    form.paraleloE.value = c.paralelo;

    clearValidation(form);
    attachLiveValidation(form);

    new bootstrap.Modal(document.getElementById("modalEditarCurso")).show();
  } catch {
    toast("Error cargando curso", "error");
  }
}

async function actualizarCurso(e) {
  e.preventDefault();
  const f = e.target;

  const data = {
    nombre: f.nombreE.value.trim(),
    nivel: f.nivelE.value.trim(),
    paralelo: f.paraleloE.value.trim(),
  };

  if (!validarNombreCurso(data.nombre)) return toast("Nombre inválido", "warning");
  if (!validarNivel(data.nivel)) return toast("Nivel inválido", "warning");
  if (!validarParalelo(data.paralelo)) return toast("Paralelo inválido", "warning");

  try {
    await fetch(`${API_CURSOS}/${f.idE.value}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    toast("Curso actualizado ✔️", "success");
    bootstrap.Modal.getInstance(document.getElementById("modalEditarCurso")).hide();

    await cargarCursos();
    renderCursos();
  } catch {
    toast("Error actualizando curso", "error");
  }
}

// ---------- Eliminar curso ----------

async function eliminarCurso(id) {
  if (!(await confirmDialog("Eliminar", "¿Eliminar este curso?"))) return;

  try {
    await fetch(`${API_CURSOS}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    toast("Curso eliminado ✔️", "success");
    await cargarCursos();
    await cargarAlumnos();
    renderCursos();
  } catch {
    toast("Error eliminando curso", "error");
  }
}

// ---------- Ver estudiantes por curso ----------

async function verEstudiantesDelCurso(id) {
  try {
    const resp = await fetch(`${API_CURSOS}/${id}/alumnos`, {
      headers: getHeaders(),
    });

    if (!resp.ok) return toast("Error consultando alumnos", "error");

    const list = await resp.json();

    if (!list.length) {
      return Swal.fire({
        icon: "info",
        title: "Sin estudiantes",
        text: "Este curso no tiene estudiantes asignados",
      });
    }

    Swal.fire({
      icon: "info",
      title: "Estudiantes del curso",
      html: list
        .map((a) => `<p><b>${a.estCed}</b> - ${a.estNom} ${a.estApe}</p>`)
        .join(""),
      width: 600,
    });
  } catch {
    toast("Error al obtener estudiantes", "error");
  }
}

// ======================================================================
// ========================= Dashboard ==================================
// ======================================================================

async function initDashboard() {
  loadTheme();
  ensureAdmin();

  try {
    const [respA, respC] = await Promise.all([
      fetch(API_ALUMNOS, { headers: getHeaders() }),
      fetch(API_CURSOS, { headers: getHeaders() }),
    ]);

    const alumnos = await respA.json();
    const cursos = await respC.json();

    document.getElementById("totalAlumnos").textContent = alumnos.length;
    document.getElementById("totalCursos").textContent = cursos.length;
    document.getElementById("userName").textContent =
      localStorage.getItem("username");

    // Últimos 5 alumnos
    const ult = alumnos.slice(-5);
    document.getElementById("tbodyUltimos").innerHTML = ult
      .map((a) => {
        const c = cursos.find((x) => x.id === a.cursoId);
        return `
        <tr>
          <td>${a.estCed}</td>
          <td>${a.estNom} ${a.estApe}</td>
          <td>${c ? `${c.nombre} (${c.nivel}-${c.paralelo})` : "Sin curso"}</td>
        </tr>`;
      })
      .join("");

    // Gráfica alumnos por curso
    const conteo = {};
    alumnos.forEach((a) => {
      const c = cursos.find((x) => x.id === a.cursoId);
      const key = c ? `${c.nombre} ${c.nivel}-${c.paralelo}` : "Sin curso";
      conteo[key] = (conteo[key] || 0) + 1;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    new Chart(document.getElementById("chartAlumnosPorCurso"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Estudiantes",
            data,
            backgroundColor: "rgba(0,123,255,0.6)",
          },
        ],
      },
      options: { responsive: true },
    });
  } catch {
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

  document.getElementById("userNameNav").textContent =
    localStorage.getItem("username");
}

async function initCursosPage() {
  loadTheme();
  ensureAdmin();

  await cargarCursos();
  await cargarAlumnos();
  renderCursos();

  document.getElementById("userNameNav").textContent =
    localStorage.getItem("username");
}

function initDashboardPage() {
  loadTheme();
  ensureAdmin();
  initDashboard();
}

console.log("app.js cargado correctamente ✔️");
