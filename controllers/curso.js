const cursoService = require("../services/curso");

const listar = async (req, res) => {
  try {
    const cursos = await cursoService.obtenerCursos();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 
const crear = async (req, res) => {
  try {
    const id = await cursoService.insertarCruso(req.body);
    res.status(201).json({ mensaje: "Curso creado", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await cursoService.actualizarCurso(req.params.id, req.body);
    if (cambios === 0) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ mensaje: "Curso actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await cursoService.eliminarCurso(req.params.id);
    if (cambios === 0) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ mensaje: "Curso eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
 crear,
  listar,
  actualizar,
  eliminar
};