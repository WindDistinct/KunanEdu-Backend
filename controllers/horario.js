const horarioService = require("../services/horario");

const insertar = async (req, res) => {
  try {
    const horario = await horarioService.insertarHorario(req.body,req.user);
    res.json({ mensaje: "Horario creada correctamente", horario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const horario = await horarioService.obtenerHorarios();
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const horario = await horarioService.obtenerTodosLosHorarios();
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (req, res) => {
  try {
    const horario = await horarioService.obtenerTodosLosHorariosAuditoria();
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await horarioService.actualizarHorario(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Horario no encontrada" });
    res.json({ mensaje: "Horario actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await horarioService.eliminarHorario(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Horario no encontrada" });
    res.json({ mensaje: "Horario eliminada correctamente" });
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