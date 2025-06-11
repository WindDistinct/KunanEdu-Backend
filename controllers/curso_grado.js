const curso_gradoService = require("../services/curso_grado");

const crear = async (req, res) => {
  try {
    const curso_grado = await curso_gradoService.insertarCursoGrado(req.body,req.user);
    res.json({ mensaje: "Curso_grado creada correctamente", curso_grado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const curso_grados = await curso_gradoService.obtenerCursoGrado();
    res.json(curso_grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const curso_grados = await curso_gradoService.obtenerTodasLasCursoGrado();
    res.json(curso_grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarCursoGradoPorId = async (req, res) => {
  try {
    const curso_grado = await curso_gradoService.obtenerCursoPorGrado(req.params.id);
    res.json(curso_grado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (req, res) => {
  try {
    const curso_grados = await curso_gradoService.obtenerTodasLasCursoGradoAudit();
    res.json(curso_grados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await curso_gradoService.actualizarCursoGrado(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Curso_grado no encontrada" });
    res.json({ mensaje: "Curso_grado actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await curso_gradoService.eliminarCursoGrado(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Curso_grado no encontrada" });
    res.json({ mensaje: "Curso_grado eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listarCursoGradoPorId,
  crear,
  listar,
  actualizar,
  eliminar,
  listarTodo,
  listarAuditoria
};