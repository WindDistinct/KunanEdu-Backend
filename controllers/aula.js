const aulaService = require("../services/aula");

const crear = async (req, res) => {
  try {
    const aula = await aulaService.insertarAula(req.body,req.user);
    res.json({ mensaje: "Aula creada correctamente", aula });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const aulas = await aulaService.obtenerAulas();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const aulas = await aulaService.obtenerTodasLasAulas();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (req, res) => {
  try {
    const aulas = await aulaService.obtenerTodasLasAulasAudit();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cambios = await aulaService.actualizarAula(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Aula no encontrada en el controller" });
    res.json({ mensaje: "Actualizacion",cambios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await aulaService.eliminarAula(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Aula no encontrada" });
    res.json({ mensaje: "Aula eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crear,
  listar,
  actualizar,
  eliminar,
  listarTodo,
  listarAuditoria
};