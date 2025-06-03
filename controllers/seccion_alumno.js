const seccion_alumnoService = require("../services/seccion_alumno");

const insertar = async (req, res) => {
  try {
    const seccion_alumno = await seccion_alumnoService.insertarSeccionAlumno(req.body,req.user);
    res.json({ mensaje: "Seccion_Alumno creada correctamente", seccion_alumno });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const seccion_alumno = await seccion_alumnoService.obtenerSeccionAlumnos();
    res.json(seccion_alumno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const seccion_alumno = await seccion_alumnoService.obtenerTodasLasSeccionAlumnos();
    res.json(seccion_alumno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (req, res) => {
  try {
    const seccion_alumno = await seccion_alumnoService.obtenerTodasLasSeccionAlumnosAuditoria();
    res.json(seccion_alumno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await seccion_alumnoService.actualizarSeccionAlumno(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Seccion_Alumno no encontrada" });
    res.json({ mensaje: "Seccion_Alumno actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await seccion_alumnoService.eliminarSeccionAlumno(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Seccion_Alumno no encontrada" });
    res.json({ mensaje: "Seccion_Alumno eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertar,
  listar,
  actualizar,
  eliminar,
  listarAuditoria,
  listarTodo
};