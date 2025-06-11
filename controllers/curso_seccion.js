const curso_seccionService = require("../services/curso_seccion");

const crear = async (req, res) => {
  try {
    const curso_seccion = await curso_seccionService.insertarCursoSeccion(req.body,req.user);
    res.json({ mensaje: "curso_seccion creada correctamente", curso_seccion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const curso_seccion = await curso_seccionService.obtenerCursoSeccion();
    res.json(curso_seccion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const crearMultiples = async (req, res) => {
  try {
    const resultado = await curso_seccionService.insertarMultiplesCursoSeccion(req.body, req.user);
    res.json({ mensaje: "Curso-secciones creadas correctamente", resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const curso_secciones = await curso_seccionService.obtenerTodasLosCursoSeccion();
    res.json(curso_secciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verificarCursosAsignados = async (req, res) => {
  try { 
    const existeAsignacion = await curso_seccionService.verificarCursosAsignados(req.params.id);
    res.json({ asignados: existeAsignacion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarAuditoria = async (req, res) => {
  try {
    const curso_secciones = await curso_seccionService.obtenerTodasLosCursoSeccionAudit();
    res.json(curso_secciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await curso_seccionService.actualizarCursoSeccion(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Curso_seccion no encontrada" });
    res.json({ mensaje: "Curso_seccion actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await curso_seccionService.eliminarCursoSeccion(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Curso_seccion no encontrada" });
    res.json({ mensaje: "Curso_seccion eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crear,
  listar,
  verificarCursosAsignados,
  actualizar,
  eliminar,
  listarTodo,
  crearMultiples,
  listarAuditoria
};