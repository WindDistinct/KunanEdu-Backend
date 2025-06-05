const examenService = require("../services/examen");

const insertar = async (req, res) => {
  try {
    const id = await examenService.insertarExamen(req.body,req.user);
    res.status(201).json({ mensaje: "Examen creado", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listado = async (_req, res) => {
  try {
    const examen = await examenService.obtenerExamenes();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarNotas = async (_req, res) => {
  try {
    const examen = await examenService.obtenerTodasLasNotas();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (_req, res) => {
  try {
    const examen = await examenService.obtenerTodosLosExamenes();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarNotasAlumno = async (req, res) => {
  try {
    const examen = await examenService.obtenerExamenesAlumno(req.params.id);
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (_req, res) => {
  try {
    const examen = await examenService.obtenerTodosLosExamenesAuditoria();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  try {
    const cambios = await examenService.actualizarExamen(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Examen no encontrado o sin cambios" });
    res.json({ mensaje: "Examen actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await examenService.eliminarExamen(req.params.id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "Examen no encontrado" });
    res.json({ mensaje: "Examen eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertar,
  listado,
  listarAuditoria,
  actualizar, 
  listarNotas,
  listarNotasAlumno,
  eliminar,listarTodo
};