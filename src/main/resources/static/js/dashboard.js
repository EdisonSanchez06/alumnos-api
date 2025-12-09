async function loadDashboard(){
  checkAuth();
  protectAdmin();

  const alumnos = await fetchAlumnos();
  const cursos = await fetchCursos();

  document.getElementById("totalAlumnos").textContent = alumnos.length;
  document.getElementById("totalCursos").textContent = cursos.length;

  const count={};
  cursos.forEach(c=>{
    const name=c.alumnoNombreCompleto;
    count[name]=(count[name]||0)+1;
  });

  new Chart(document.getElementById("chart"),{
    type:"bar",
    data:{
      labels:Object.keys(count),
      datasets:[{
        label:"Cursos por alumno",
        data:Object.values(count)
      }]
    }
  });
}
