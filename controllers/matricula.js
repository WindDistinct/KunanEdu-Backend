const matriculaService = require("../services/matricula");

const listado = async (req, res) => {
    try {
        const matriculas = await matriculaService.listarMatricula();
        res.json(matriculas);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};
const listarTodo = async (_req, res) => {
  try {
    const grados = await matriculaService.obtenerTodasLasMatriculas();
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  try {
    const cambios = await matriculaService.actualizarMatricula(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Matricula no encontrada o sin cambios" });
    res.json({ mensaje: "Matricula actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await matriculaService.eliminarMatricula(req.params.id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "Matricula no encontrada" });
    res.json({ mensaje: "Matricula eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { listado,eliminar,actualizar,listarTodo};