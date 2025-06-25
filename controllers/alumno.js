const estudianteService = require("../services/alumno");

const listado = async (req, res) => {
  try {
    const estudiantes = await estudianteService.obtenerAlumnos();
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarTodo = async (req, res) => {
  try {
    const estudiantes = await estudianteService.obtenerTodosLosAlumnos();
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarAuditoria = async (req, res) => {
  try {
    const estudiantes = await estudianteService.obtenerTodosLosAlumnosAudit();
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarAlumnoAula = async (req, res) => {
  const { aula, cursoseccion } = req.params;
  try {
    const estudiantes = await estudianteService.obtenerAlumnosAula(
      parseInt(aula),
      parseInt(cursoseccion)
    );
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ NUEVA FUNCIÓN: alumnos por periodo
const listarAlumnosPorPeriodo = async (req, res) => {
  const { idPeriodo } = req.params;
  try {
    const estudiantes = await estudianteService.obtenerAlumnosPorPeriodo(idPeriodo);
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener alumnos por periodo" });
  }
};

const insertar = async (req, res) => {
  try {
    const id = await estudianteService.insertarAlumno(req.body, req.user);
    res.status(201).json({ mensaje: "Estudiante registrado", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await estudianteService.actualizarAlumno(
      req.params.id,
      req.body,
      req.user
    );
    if (cambios === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
    res.json({ mensaje: "Estudiante actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await estudianteService.eliminarAlumno(req.params.id, req.user);
    if (cambios === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
    res.json({ mensaje: "Estudiante eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listarAlumnoAula,
  listado,
  actualizar,
  eliminar,
  insertar,
  listarAuditoria,
  listarTodo,
  listarAlumnosPorPeriodo // ✅ exportado
};
