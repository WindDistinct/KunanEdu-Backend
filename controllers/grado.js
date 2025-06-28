const gradoService = require("../services/grado");

const crear = async (req, res) => {
  try {
    const id = await gradoService.insertarGrado(req.body,req.user);
    res.status(201).json({ mensaje: "Grado creado", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (_req, res) => {
  try {
    const grados = await gradoService.obtenerGrados();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (_req, res) => {
  try {
    const grados = await gradoService.obtenerTodosLosGrados();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (_req, res) => {
  try {
    const grados = await gradoService.obtenerTodosLosGradosAuditoria();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  try {
    const cambios = await gradoService.actualizarGrado(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Grado no encontrado o sin cambios" });
    res.json({ mensaje: "Grado actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
const eliminar = async (req, res) => {
  try {
    const eliminado = await gradoService.eliminarGrado(req.params.id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "Grado no encontrado" });
    res.json({ mensaje: "Grado eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crear,
  listar,
  listarAuditoria,
  actualizar, 
  listarTodo, 
  eliminar
};