const periodoService = require("../services/periodo");

const insertar = async (req, res) => {
  try {
    const id = await periodoService.insertarPeriodo(req.body,req.user);
    res.status(201).json({ mensaje: "Periodo creado", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listado = async (_req, res) => {
  try {
    const grados = await periodoService.obtenerPeriodos();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (_req, res) => {
  try {
    const grados = await periodoService.obtenerTodosLosPeriodos();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarSeccionPeriodo = async (req, res) => {
  try {
    const grados = await periodoService.obtenerSeccionesPorPeriodo(req.params.id);
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (_req, res) => {
  try {
    const grados = await periodoService.obtenerTodosLosPeriodosAuditoria();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  try {
    const cambios = await periodoService.actualizarPeriodo(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Periodo no encontrado o sin cambios" });
    res.json({ mensaje: "Periodo actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await periodoService.eliminarPeriodo(req.params.id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "Periodo no encontrado" });
    res.json({ mensaje: "Periodo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertar,
  listado,
  actualizar, 
  listarSeccionPeriodo,
  listarAuditoria,
  eliminar,listarTodo
};