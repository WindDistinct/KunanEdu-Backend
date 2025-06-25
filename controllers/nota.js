const notaService = require("../services/nota");

const crear = async (req, res) => {
    try {
        const nota = await notaService.insertarNota(req.body, req.user);
        res.json({ mensaje: "Nota creada correctamente", nota });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const notas = await notaService.obtenerNotas();
        res.json(notas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const listarTodo = async (req, res) => {
    try {
        const notas = await notaService.obtenerTodasLasNotas();
        res.json(notas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// const listarAuditoria = async (req, res) => {
//     try {
//         const notas = await notaService.obtenerTodasLasNotasAudit();
//         res.json(notas);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const actualizar = async (req, res) => {
    try {
        const cambios = await notaService.actualizarNota(req.params.id, req.body, req.user);
        if (cambios === 0) return res.status(404).json({ error: "Nota no encontrada" });
        res.json({ mensaje: "Nota actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const cambios = await notaService.eliminarNota(req.params.id, req.user);
        if (cambios === 0) return res.status(404).json({ error: "Nota no encontrada" });
        res.json({ mensaje: "Nota eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Esta versión usa periodo e idAlumno (no grado/seccion)
const generar = async (req, res) => {
    const { periodo, alumno } = req.params;

    try {
        const reporte = await notaService.generarReporte(periodo, alumno);
        res.json(reporte);
    } catch (error) {
        console.error("❌ Error en controlador de reporte:", error);
        res.status(500).json({ error: "Error al generar el reporte" });
    }
};

module.exports = {
    crear,
    listar,
    actualizar,
    eliminar,
    listarTodo,
    generar,
    // listarAuditoria
};
