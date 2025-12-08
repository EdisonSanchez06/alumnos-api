// ======================================================================
// ==================== CONFIG GLOBAL ==================================
// ======================================================================

const API_BASE = "https://alumnos-api-e65o.onrender.com";

const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";

// ======================================================================
// ==================== HEADERS / AUTH =================================
// ======================================================================

function getHeaders() {
  const token = localStorage.getItem("auth");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = token;
  }

  return headers;
}

// ======================================================================
// ==================== TOASTS =========================================
// ======================================================================

function mostrarToast(mensaje, tipo = "info") {
  const cont = document.getElementById("toastContainer");
  if (!cont) return;

  const wrapper = document.createElement("div");
  wrapper.className = "toast align-items-center text-bg-" + mapTipoToast(tipo) + " border-0";
  wrapper.role = "alert";
  wrapper.ariaLive = "assertive";
  wrapper.ariaAtomic = "true";
  wrapper.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${mensaje}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  cont.appendChild(wrapper);
  const toast = new bootstrap.Toast(wrapper);
  toast.show();

  // limpiar luego de un rato
  setTimeout(() => {
    wrapper.remove();
  }, 4000);
}

function mapTipoToast(tipo) {
  switch (tipo) {
    case "success": return "success";
    case "danger": return "danger";
    case "warning": return "warning";
    default: return "primary";
  }
}

// ======================================================================
// ==================== SESIÓN / LOGIN =================================
// ======================================================================

function login(e) {
  e.preventDefault();

  const user = e.target.usuario.value;
  const pass = e.target.clave.value;

  if (!user || !pass) {
    mostrarToast("Usuario y clave son obligatorios", "warning");
    return;
  }

  const basic = "Basic " + btoa(user + ":" + pass);

  fetch(API_ALUMNOS, {
    headers: {
      "Authorization": basic,
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
    .catch((err) => mostrarToast(err.message, "danger"));
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}

// ======================================================================
// ==================== PROTECCIÓN DE PÁGINAS ===========================
// ======================================================================

function obtenerRol() {
  return localStorage.getItem("role");
}

function protegerPaginaAlumnos() {
  const auth = localStorage.getItem("auth");
  if (!auth) {
    location.href = "login.html";
  }
}

function protegerPaginaCursos() {
  const auth = localStorage.getItem("auth");
  const role = obtenerRol();

  if (!auth) {
    location.href = "login.html";
    return;
  }

  if (role !== "ADMIN") {
    mostrarToast("Acceso denegado: solo administradores", "danger");
    setTimeout(() => (location.href = "alumnos.html"), 2000);
  }
}

function protegerPaginaDashboard() {
  const auth = localStorage.getItem("auth");
  const role = obtenerRol();

  if (!auth) {
    location.href = "login.html";
    return;
  }
  if (role !== "ADMIN") {
    mostrarToast("Solo el administrador puede ver el dashboard", "warning");
    setTimeout(() => (location.href = "alumnos.html"), 2000);
  }
}

// ======================================================================
// ==================== FILTRO TABLAS ==================================
// ======================================================================

function filtrarTabla(idTbody, texto) {
  texto = texto.toLowerCase();
  const filas = document.querySelectorAll(`#${idTbody} tr`);

  filas.forEach((fila) => {
    fila.style.display = fila.innerText.toLowerCase().includes(texto) ? "" : "none";
  });
}

// ======================================================================
// ==================== CRUD ALUMNOS (MODALES) ==========================
// ======================================================================

async function listarAlumnos() {
  try {
    const resp = await fetch(API_ALUMNOS, {
      headers: getHeaders(),
    });

    if (!resp.ok) {
      mostrarToast("Error al cargar alumnos", "danger");
      return;
    }

    const data = await resp.json();
    let html = "";

    data.forEach((a) => {
      html += `
        <tr>
          <td>${a.estCed}</td>
          <td>${a.estNom}</td>
          <td>${a.estApe}</td>
          <td>${a.estTel || ""}</td>
          <td>${a.estDir || ""}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="abrirModalEditarAlumno('${a.estCed}')">
              Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarAlumno('${a.estCed}')">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    });

    const tbody = document.getElementById("tbodyAlumnos");
    if (tbody) tbody.innerHTML = html;
  } catch (e) {
    mostrarToast("No se pudo conectar con el servidor de alumnos", "danger");
  }
}

function abrirModalCrearAlumno() {
  const form = document.getElementById("formCrearAlumno");
  if (form) form.reset();

  const modalEl = document.getElementById("modalCrearAlumno");
  if (!modalEl) return;

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
    mostrarToast("Cédula, nombre y apellido son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(API_ALUMNOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) {
      mostrarToast("Error al crear alumno", "danger");
      return;
    }

    mostrarToast("Alumno creado correctamente", "success");

    const modalEl = document.getElementById("modalCrearAlumno");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    listarAlumnos();
  } catch (e) {
    mostrarToast("Error de red al crear alumno", "danger");
  }
}

async function abrirModalEditarAlumno(ced) {
  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      headers: getHeaders(),
    });

    if (!resp.ok) {
      mostrarToast("No se pudo cargar el alumno", "danger");
      return;
    }

    const a = await resp.json();

    document.getElementById("estCedE").value = a.estCed;
    document.getElementById("estNomE").value = a.estNom;
    document.getElementById("estApeE").value = a.estApe;
    document.getElementById("estTelE").value = a.estTel || "";
    document.getElementById("estDirE").value = a.estDir || "";

    const modalEl = document.getElementById("modalEditarAlumno");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (e) {
    mostrarToast("Error al cargar datos del alumno", "danger");
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

  if (!ced || !data.estNom || !data.estApe) {
    mostrarToast("Cédula, nombre y apellido son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) {
      mostrarToast("Error al actualizar alumno", "danger");
      return;
    }

    mostrarToast("Alumno actualizado correctamente", "success");

    const modalEl = document.getElementById("modalEditarAlumno");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    listarAlumnos();
  } catch (e) {
    mostrarToast("Error de red al actualizar alumno", "danger");
  }
}

async function eliminarAlumno(ced) {
  if (!confirm(`¿Eliminar alumno ${ced}?`)) return;

  try {
    const resp = await fetch(`${API_ALUMNOS}/${ced}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!resp.ok) {
      mostrarToast("No se pudo eliminar el alumno", "danger");
      return;
    }

    mostrarToast("Alumno eliminado", "success");
    listarAlumnos();
  } catch (e) {
    mostrarToast("Error de red al eliminar alumno", "danger");
  }
}

// ======================================================================
// ==================== CRUD CURSOS (MODALES) ===========================
// ======================================================================

async function listarCursos() {
  try {
    const resp = await fetch(API_CURSOS, {
      headers: getHeaders(),
    });

    if (!resp.ok) {
      mostrarToast("Error al cargar cursos", "danger");
      return;
    }

    const data = await resp.json();
    let html = "";

    data.forEach((c) => {
      html += `
        <tr>
          <td>${c.id}</td>
          <td>${c.nombre}</td>
          <td>${c.alumnoCed} - ${c.alumnoNombreCompleto}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="abrirModalEditarCurso(${c.id})">
              Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarCurso(${c.id})">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    });

    const tbody = document.getElementById("tbodyCursos");
    if (tbody) tbody.innerHTML = html;
  } catch (e) {
    mostrarToast("No se pudo conectar con el servidor de cursos", "danger");
  }
}

function abrirModalCrearCurso() {
  const form = document.getElementById("formCrearCurso");
  if (form) form.reset();

  const modalEl = document.getElementById("modalCrearCurso");
  if (!modalEl) return;

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
    mostrarToast("Nombre de curso y cédula del alumno son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(API_CURSOS, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) {
      mostrarToast("Error al crear curso", "danger");
      return;
    }

    mostrarToast("Curso creado correctamente", "success");

    const modalEl = document.getElementById("modalCrearCurso");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    listarCursos();
  } catch (e) {
    mostrarToast("Error de red al crear curso", "danger");
  }
}

async function abrirModalEditarCurso(id) {
  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      headers: getHeaders(),
    });

    if (!resp.ok) {
      mostrarToast("No se pudo cargar el curso", "danger");
      return;
    }

    const c = await resp.json();

    document.getElementById("idE").value = c.id;
    document.getElementById("nombreE").value = c.nombre;
    document.getElementById("alumnoCedE").value = c.alumnoCed;

    const modalEl = document.getElementById("modalEditarCurso");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (e) {
    mostrarToast("Error al cargar datos del curso", "danger");
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

  if (!id || !data.nombre || !data.alumnoCed) {
    mostrarToast("Todos los campos son obligatorios", "warning");
    return;
  }

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!resp.ok) {
      mostrarToast("Error al actualizar curso", "danger");
      return;
    }

    mostrarToast("Curso actualizado correctamente", "success");

    const modalEl = document.getElementById("modalEditarCurso");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    listarCursos();
  } catch (e) {
    mostrarToast("Error de red al actualizar curso", "danger");
  }
}

async function eliminarCurso(id) {
  if (!confirm(`¿Eliminar curso ${id}?`)) return;

  try {
    const resp = await fetch(`${API_CURSOS}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!resp.ok) {
      mostrarToast("No se pudo eliminar el curso", "danger");
      return;
    }

    mostrarToast("Curso eliminado", "success");
    listarCursos();
  } catch (e) {
    mostrarToast("Error de red al eliminar curso", "danger");
  }
}

// ======================================================================
// ==================== DASHBOARD (GRÁFICOS) ============================
// ======================================================================

async function cargarDashboard() {
  protegerPaginaDashboard();

  const spanUser = document.getElementById("userName");
  if (spanUser) {
    spanUser.textContent = localStorage.getItem("username") || "Admin";
  }

  try {
    const respAlum = await fetch(API_ALUMNOS, { headers: getHeaders() });
    const respCur = await fetch(API_CURSOS, { headers: getHeaders() });

    if (!respAlum.ok || !respCur.ok) {
      mostrarToast("Error al cargar datos para el dashboard", "danger");
      return;
    }

    const alumnos = await respAlum.json();
    const cursos = await respCur.json();

    // totales
    const lblAl = document.getElementById("totalAlumnos");
    const lblCu = document.getElementById("totalCursos");
    if (lblAl) lblAl.textContent = alumnos.length;
    if (lblCu) lblCu.textContent = cursos.length;

    // gráfico: cursos por alumno
    const conteo = {};
    cursos.forEach((c) => {
      const nombre = c.alumnoNombreCompleto || c.alumnoCed;
      if (!conteo[nombre]) conteo[nombre] = 0;
      conteo[nombre]++;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    const ctx = document.getElementById("chartCursosPorAlumno");
    if (ctx && labels.length > 0) {
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
              precision: 0,
            },
          },
        },
      });
    }

  } catch (e) {
    mostrarToast("No se pudo completar la carga del dashboard", "danger");
  }
}
