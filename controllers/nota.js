const notaService = require("../services/nota");

const insertar = async (req, res) => {
  try {
    const id = await notaService.insertarNota(req.body,req.user);
    res.status(201).json({ mensaje: "Nota creada", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listado = async (_req, res) => {
  try {
    const grados = await notaService.obtenerNotas();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (_req, res) => {
  try {
    const grados = await notaService.obtenerTodasLasNotas();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  try {
    const cambios = await notaService.actualizarNota(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Nota no encontrado o sin cambios" });
    res.json({ mensaje: "Nota actualizada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await notaService.eliminarNota(req.params.id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "Nota no encontrada" });
    res.json({ mensaje: "Nota eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertar,
  listado,
  actualizar, 
  eliminar,listarTodo
};