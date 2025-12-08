// ======================================================================
// ==================== CONFIG GLOBAL ==================================
// ======================================================================

const API_BASE = "https://alumnos-api-e65o.onrender.com";

const API_ALUMNOS = API_BASE + "/api/alumnos";
const API_CURSOS = API_BASE + "/api/cursos";

// ======================================================================
// ==================== HEADERS ========================================
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
// ==================== SESION =========================================
// ======================================================================

function login(e) {
  e.preventDefault();

  const user = e.target.usuario.value;
  const pass = e.target.clave.value;

  const basic = "Basic " + btoa(user + ":" + pass);

  fetch(API_ALUMOS, {
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
        location.href = "cursos.html";
      } else {
        localStorage.setItem("role", "SECRETARIA");
        location.href = "alumnos.html";
      }
    })
    .catch((err) => mostrarAlerta(err.message, "danger"));
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}

// ======================================================================
// ==================== RESTRICCIONES DE ROL ============================
// ======================================================================

function protegerPaginaCursos() {
  const role = localStorage.getItem("role");

  if (role !== "ADMIN") {
    mostrarAlerta(
      "Acceso denegado: solo administradores",
      "danger"
    );
    setTimeout(() => (location.href = "alumnos.html"), 2000);
  }
}

// ======================================================================
// ==================== ALERTAS ========================================
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
// ==================== CRUD ALUMNOS ===================================
// ======================================================================

async function listarAlumnos() {
  const resp = await fetch(API_ALUMNOS, {
    headers: getHeaders(),
  });

  if (!resp.ok) {
    mostrarAlerta("Error al cargar alumnos", "danger");
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
        <td>${a.estTel}</td>
        <td>${a.estDir}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="cargarEditarAlumno('${a.estCed}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarAlumno('${a.estCed}')">Eliminar</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("tbodyAlumnos").innerHTML = html;
}

async function crearAlumno(e) {
  e.preventDefault();

  const form = e.target;

  const data = {
    estCed: form.estCed.value,
    estNom: form.estNom.value,
    estApe: form.estApe.value,
    estTel: form.estTel.value,
    estDir: form.estDir.value,
  };

  const resp = await fetch(API_ALUMNOS, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    mostrarAlerta("Error al crear alumno", "danger");
    return;
  }

  mostrarAlerta("Alumno creado", "success");
  form.reset();
  listarAlumnos();
}

async function cargarEditarAlumno(ced) {
  const resp = await fetch(API_ALUMNOS + "/" + ced, {
    headers: getHeaders(),
  });

  const a = await resp.json();

  document.getElementById("estCedE").value = a.estCed;
  document.getElementById("estNomE").value = a.estNom;
  document.getElementById("estApeE").value = a.estApe;
  document.getElementById("estTelE").value = a.estTel;
  document.getElementById("estDirE").value = a.estDir;
}

async function actualizarAlumno(e) {
  e.preventDefault();

  const form = e.target;
  const ced = form.estCedE.value;

  const data = {
    estNom: form.estNomE.value,
    estApe: form.estApeE.value,
    estTel: form.estTelE.value,
    estDir: form.estDirE.value,
  };

  const resp = await fetch(API_ALUMNOS + "/" + ced, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    mostrarAlerta("Error al actualizar", "danger");
    return;
  }

  mostrarAlerta("Alumno actualizado", "success");
  listarAlumnos();
}

async function eliminarAlumno(ced) {
  if (!confirm("¿Eliminar alumno?")) return;

  const resp = await fetch(API_ALUMNOS + "/" + ced, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!resp.ok) {
    mostrarAlerta("No se pudo eliminar", "danger");
    return;
  }

  mostrarAlerta("Alumno eliminado", "success");
  listarAlumnos();
}

// ======================================================================
// ==================== CRUD CURSOS ====================================
// ======================================================================

async function listarCursos() {
  const resp = await fetch(API_CURSOS, {
    headers: getHeaders(),
  });

  if (!resp.ok) {
    mostrarAlerta("Error al cargar cursos", "danger");
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
            <button class="btn btn-warning btn-sm" onclick="cargarEditarCurso(${c.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarCurso(${c.id})">Eliminar</button>
          </td>
      </tr>
    `;
  });

  document.getElementById("tbodyCursos").innerHTML = html;
}

async function crearCurso(e) {
  e.preventDefault();

  const form = e.target;

  const data = {
    nombre: form.nombre.value,
    alumnoCed: form.alumnoCed.value,
  };

  const resp = await fetch(API_CURSOS, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    mostrarAlerta("Error al crear curso", "danger");
    return;
  }

  mostrarAlerta("Curso creado", "success");
  form.reset();
  listarCursos();
}

async function cargarEditarCurso(id) {
  const resp = await fetch(API_CURSOS + "/" + id, {
    headers: getHeaders(),
  });

  const c = await resp.json();

  document.getElementById("idE").value = c.id;
  document.getElementById("nombreE").value = c.nombre;
  document.getElementById("alumnoCedE").value = c.alumnoCed;
}

async function actualizarCurso(e) {
  e.preventDefault();

  const form = e.target;
  const id = form.idE.value;

  const data = {
    nombre: form.nombreE.value,
    alumnoCed: form.alumnoCedE.value,
  };

  const resp = await fetch(API_CURSOS + "/" + id, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    mostrarAlerta("Error al actualizar", "danger");
    return;
  }

  mostrarAlerta("Curso actualizado", "success");
  listarCursos();
}

async function eliminarCurso(id) {
  if (!confirm("¿Eliminar curso?")) return;

  const resp = await fetch(API_CURSOS + "/" + id, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!resp.ok) {
    mostrarAlerta("No se pudo eliminar", "danger");
    return;
  }

  mostrarAlerta("Curso eliminado", "success");
  listarCursos();
}
async function cargarDashboard(){
  const role = localStorage.getItem("role");

  if(role !== "ADMIN"){
    location.href = "alumnos.html";
    return;
  }

  document.getElementById("userName").innerText = localStorage.getItem("username");

  const a = await fetch(API_ALUMNOS, {headers:getHeaders()});
  const c = await fetch(API_CURSOS, {headers:getHeaders()});

  document.getElementById("totalAlumnos").innerText = (await a.json()).length;
  document.getElementById("totalCursos").innerText = (await c.json()).length;
}
function filtrarTabla(idTabla, texto){
  texto = texto.toLowerCase();
  const filas = document.querySelectorAll(`#${idTabla} tr`);

  filas.forEach(fila=>{
    fila.style.display = fila.innerText.toLowerCase().includes(texto)
    ? "" : "none";
  });
}
