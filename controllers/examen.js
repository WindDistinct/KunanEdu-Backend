const examenService = require("../services/examen");

const insertar = async (req, res) => {
  try {
    const id = await examenService.insertarExamen(req.body,req.user);
    res.status(201).json({ mensaje: "Examen creado", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listado = async (_req, res) => {
  try {
    const examen = await examenService.obtenerExamenes();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarNotas = async (_req, res) => {
  try {
    const examen = await examenService.obtenerTodasLasNotas();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarTodo = async (_req, res) => {
  try {
    const examen = await examenService.obtenerTodosLosExamenes();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const crearMultiples = async (req, res) => {
  try {
    const resultado = await examenService.insertarMultiplesNotas(req.body, req.user);
    res.json({ mensaje: "Notas creadas correctamente", resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarNotasBimestre = async (req, res) => {
   const { aula,bimestre,cursoseccion } = req.params;
  
    try {
      const notas = await examenService.obtenerNotasPorBimestre(parseInt(aula),bimestre,parseInt(cursoseccion));
      res.json(notas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
const listarNotasCurso = async (req, res) => {
   const { docente,periodo,cursoseccion } = req.params;
  
    try {
      const notas = await examenService.obtenerNotasPorCurso(parseInt(docente),parseInt(periodo),parseInt(cursoseccion));
      res.json(notas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
const listarNotasAlumno = async (req, res) => {
  try {
    const examen = await examenService.obtenerExamenesAlumno(req.params.id);
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const listarAuditoria = async (_req, res) => {
  try {
    const examen = await examenService.obtenerTodosLosExamenesAuditoria();
    res.json(examen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  try {
    const cambios = await examenService.actualizarExamen(req.params.id, req.body,req.user);
    if (cambios === 0) return res.status(404).json({ error: "Examen no encontrado o sin cambios" });
    res.json({ mensaje: "Examen actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await examenService.eliminarExamen(req.params.id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "Examen no encontrado" });
    res.json({ mensaje: "Examen eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertar,
  listarNotasCurso,
  listado,
  listarAuditoria,
  actualizar, 
  listarNotas,
  listarNotasAlumno,
  eliminar,listarTodo,crearMultiples,listarNotasBimestre
};