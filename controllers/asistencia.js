const asistenciaService = require("../services/asistencia");

const insertar = async (req, res) => {
  try {
    const asistencia = await asistenciaService.insertarAsistencia(req.body,req.user);
    res.json({ mensaje: "Asistencia creada correctamente", asistencia });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const asistencia = await asistenciaService.obtenerAsistencias();
    res.json(asistencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const asistencia = await asistenciaService.obtenerTodasLasAsistencias();
    res.json(asistencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await asistenciaService.actualizarAsistencia(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Asistencia no encontrada" });
    res.json({ mensaje: "Asistencia actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await asistenciaService.eliminarAsistencia(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Asistencia no encontrada" });
    res.json({ mensaje: "Asistencia eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertar,
  listar,
  actualizar,
  eliminar,
  listarTodo
};