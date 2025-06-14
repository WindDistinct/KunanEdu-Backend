const seccionService = require("../services/seccion");

const insertar = async (req, res) => {
  try {
    const seccion = await seccionService.insertarSeccion(req.body,req.user);
    res.json({ mensaje: "Seccion creada correctamente", seccion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const seccion = await seccionService.obtenerSecciones();
    res.json(seccion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const seccion = await seccionService.obtenerTodasLasSecciones();
    res.json(seccion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarSeccionesGradoPeriodo = async (req, res) => {
   const { grado,periodo } = req.params;
  
    try {
      const secciones = await seccionService.obtenerSeccionesPorGradoPeriodo(parseInt(grado),parseInt(periodo));
      res.json(secciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
const listarAuditoria = async (req, res) => {
  try {
    const seccion = await seccionService.obtenerTodasLasSeccionesAuditoria();
    res.json(seccion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  try {
    const cambios = await seccionService.actualizarSeccion(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Seccion no encontrada" });
    res.json({ mensaje: "Seccion actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const cambios = await seccionService.eliminarSeccion(req.params.id,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Seccion no encontrada" });
    res.json({ mensaje: "Seccion eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertar,
  listar,
  actualizar,
  eliminar,
  listarSeccionesGradoPeriodo,
  listarTodo,
  listarAuditoria
};