
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
    try {
      const id = await estudianteService.registrarEstudiante(req.body,req.user);
      res.status(201).json({ mensaje: "Estudiante registrado", id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
const actualizar= async (req, res) => { 
    try {
      const cambios = await estudianteService.actualizarEstudiante(req.params.id, req.body,req.user);
      if (cambios === 0)  return res.status(404).json({ error: "Estudiante no encontrado" });
      res.json({ mensaje: "Estudiante actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const eliminar = async (req, res) => {  
    try {
      const cambios = await estudianteService.eliminarEstudiante(req.params.id,req.user);
      if (cambios === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
      res.json({ mensaje: "Estudiante eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
module.exports = { listado ,actualizar,eliminar,insertar,listarTodo};