<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <title>Estudiantes – Sistema Escolar</title>

  <!-- BOOTSTRAP -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />

  <!-- ICONOS -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
    rel="stylesheet"
  />

  <!-- SWEETALERT -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

  <style>
    body {
      background: #f4f6fa;
      font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont,
        "Helvetica Neue", Arial, sans-serif;
      transition: background 0.3s ease-in-out, color 0.3s ease-in-out;
    }

    .page-card {
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      padding: 24px;
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
    }

    thead tr {
      background: #e8f0ff;
    }

    .badge-curso {
      font-size: 0.8rem;
      background: #e3f2fd;
      color: #1565c0;
      border-radius: 999px;
      padding: 0.2rem 0.6rem;
    }

    /* Modo oscuro básico usando data-theme="dark" */
    html[data-theme="dark"] body {
      background: #111827;
      color: #e5e7eb;
    }

    html[data-theme="dark"] .page-card {
      background: #1f2937;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
    }

    html[data-theme="dark"] thead tr {
      background: #111827;
    }
  </style>
</head>

<body onload="initAlumnosPage()">
  <!-- NAVBAR -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold" href="#">
        📘 Sistema Escolar
      </a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active fw-bold" href="alumnos.html">
              Estudiantes
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="cursos.html">Cursos</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="dashboard.html">Dashboard</a>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-3">
          <span id="userNameNav" class="text-white fw-bold">ADMIN</span>

          <button
            type="button"
            class="btn btn-outline-light btn-sm"
            onclick="toggleTheme()"
          >
            <i class="bi bi-brightness-high"></i>
          </button>

          <button class="btn btn-danger btn-sm" onclick="logout()">
            Salir
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- CONTENIDO PRINCIPAL -->
  <div class="container my-4">
    <div class="page-card">
      <!-- TÍTULO + BOTÓN NUEVO -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="page-title mb-0">
          🧑‍🏫 Lista de Estudiantes
        </h2>

        <button
          class="btn btn-primary"
          onclick="abrirModalCrearAlumno()"
        >
          <i class="bi bi-plus-circle me-1"></i>
          Nuevo Alumno
        </button>
      </div>

      <!-- FILTROS -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <input
            type="text"
            id="filterCedula"
            class="form-control"
            placeholder="Buscar por cédula"
            oninput="alumnosFilters.cedula=this.value.trim(); alumnosPage=1; renderAlumnos();"
          />
        </div>

        <div class="col-md-4">
          <input
            type="text"
            id="filterNombre"
            class="form-control"
            placeholder="Buscar por nombre"
            oninput="alumnosFilters.nombre=this.value.trim(); alumnosPage=1; renderAlumnos();"
          />
        </div>

        <div class="col-md-4">
          <input
            type="text"
            id="filterApellido"
            class="form-control"
            placeholder="Buscar por apellido"
            oninput="alumnosFilters.apellido=this.value.trim(); alumnosPage=1; renderAlumnos();"
          />
        </div>

        <div class="col-12">
          <input
            type="text"
            class="form-control"
            placeholder="Búsqueda general..."
            oninput="alumnosSearch=this.value.trim(); alumnosPage=1; renderAlumnos();"
          />
        </div>
      </div>

      <!-- TABLA -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Curso</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbodyAlumnos"></tbody>
        </table>
      </div>

      <!-- PAGINACIÓN -->
      <div class="d-flex justify-content-between align-items-center mt-2">
        <small id="alumnosPaginationInfo">Mostrando 0 de 0</small>

        <div class="btn-group" role="group">
          <button
            id="alumnosPrev"
            class="btn btn-outline-secondary btn-sm"
            onclick="alumnosPage=Math.max(1,alumnosPage-1); renderAlumnos();"
          >
            &lt;
          </button>
          <button
            id="alumnosNext"
            class="btn btn-outline-secondary btn-sm"
            onclick="alumnosPage=alumnosPage+1; renderAlumnos();"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL CREAR ALUMNO -->
  <div
    class="modal fade"
    id="modalCrearAlumno"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form id="formCrearAlumno" onsubmit="crearAlumno(event)">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Alumno</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body row g-3">
            <div class="col-md-4">
              <label class="form-label">Cédula</label>
              <input
                name="estCed"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Nombre</label>
              <input
                name="estNom"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Apellido</label>
              <input
                name="estApe"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Teléfono</label>
              <input
                name="estTel"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-8">
              <label class="form-label">Dirección</label>
              <input
                name="estDir"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">Curso</label>
              <select
                name="cursoId"
                class="form-select"
                required
              ></select>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
            <button type="submit" class="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL EDITAR ALUMNO -->
  <div
    class="modal fade"
    id="modalEditarAlumno"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form id="formEditarAlumno" onsubmit="actualizarAlumno(event)">
          <div class="modal-header">
            <h5 class="modal-title">Editar Alumno</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body row g-3">
            <div class="col-md-4">
              <label class="form-label">Cédula</label>
              <input
                name="estCedE"
                class="form-control"
                readonly
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Nombre</label>
              <input
                name="estNomE"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Apellido</label>
              <input
                name="estApeE"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Teléfono</label>
              <input
                name="estTelE"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-8">
              <label class="form-label">Dirección</label>
              <input
                name="estDirE"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">Curso</label>
              <select
                name="cursoIdE"
                class="form-select"
                required
              ></select>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
            <button type="submit" class="btn btn-primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- SCRIPTS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
