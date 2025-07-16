const cursoService = require("../services/curso");

const listar = async (req, res) => {
  try {
    const cursos = await cursoService.obtenerCursos();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const cursos = await cursoService.obtenerTodosLosCursos();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarSeccion = async (req, res) => {
  try {
    const cursos = await cursoService.obtenerCursosPorSeccion(req.params.id);
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (req, res) => {
  try {
    const cursos = await cursoService.obtenerTodosLosCursosAuditoria();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 
const crear = async (req, res) => {
  try {
    const id = await cursoService.insertarCurso(req.body,req.user);
    res.status(201).json({ mensaje: "Curso creado", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await cursoService.actualizarCurso(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ mensaje: "Curso actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await cursoService.eliminarCurso(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ mensaje: "Curso eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
 crear,
  listar,
  listarAuditoria,listarSeccion,
  actualizar,
  eliminar,
  listarTodo
};