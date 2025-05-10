const aulaService = require("../services/aula");

const crear = async (req, res) => {
  try {
    const aula = await aulaService.crearAula(req.body);
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

const actualizar = async (req, res) => {
  try {
    const cambios = await aulaService.actualizarAula(req.params.id, req.body);
    if (cambios === 0) return res.status(404).json({ error: "Aula no encontrada" });
    res.json({ mensaje: "Aula actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await aulaService.eliminarAula(req.params.id);
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
  eliminar
};