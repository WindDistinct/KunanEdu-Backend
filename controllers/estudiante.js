
const estudianteService = require("../services/estudiante");


const listado = async (req, res) => {
    try {
        const estudiantes = await estudianteService.listarEstudiantes();
        res.json(estudiantes);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};
const listarTodo = async (req, res) => {
    try {
        const estudiantes = await estudianteService.listarTodosLosEstudiantes();
        res.json(estudiantes);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};
const insertar = async (req, res) => {
    const datos = req.body;
  
    try {
      const id = await estudianteService.registrarEstudiante(datos);
      res.status(201).json({ mensaje: "Estudiante registrado", id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
const actualizar= async (req, res) => {
    const { id } = req.params;
    const datos = req.body;

  
    try {
      const cambios = await estudianteService.actualizarEstudiante(id, datos);
      if (cambios === 0)  return res.status(404).json({ error: "Estudiante no encontrado" });
      res.json({ mensaje: "Estudiante actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const eliminar = async (req, res) => {
    const { id } = req.params;
  
    try {
      const cambios = await estudianteService.eliminarEstudiante(id);
      if (cambios === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
      res.json({ mensaje: "Estudiante eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
module.exports = { listado ,actualizar,eliminar,insertar,listarTodo};