const matriculaService = require("../services/matricula");

const listado = async (req, res) => {
    try {
        const matriculas = await matriculaService.obtenerMatriculas();
        res.json(matriculas);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};
const listarTodo = async (_req, res) => {
  try {
    const matricula = await matriculaService.obtenerTodasLasMatriculas();
    res.json(matricula);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (_req, res) => {
  try {
    const matricula = await matriculaService.obtenerTodasLasMatriculasAuditoria();
    res.json(matricula);
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

const registrar = async (req, res) => {
  try {
    await matriculaService.insertarMatricula(req.body,req.user);
    res.json({ mensaje: "Matricula registrada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { listado,eliminar,actualizar,listarAuditoria,listarTodo,registrar };