const express = require("express");
const router = express.Router();
const {
  listado,
  actualizar,
  eliminar,
  listarAlumnoAula,
  insertar,
  listarTodo,
  listarAuditoria,
  listarAlumnosPorPeriodo // ✅ Importación del nuevo controlador
} = require("../controllers/alumno");

const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");

// Endpoints públicos o generales
router.get("/all", listado);
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);
router.get("/alumnos-aula/:aula/:cursoseccion", listarAlumnoAula);
router.get("/por-periodo/:idPeriodo", listarAlumnosPorPeriodo); // ✅ Nuevo endpoint

// Endpoints protegidos
router.post("/create", checkAuth, checkRol("administrador"), insertar);
router.put("/update/:id", checkAuth, checkRol("administrador"), actualizar);
router.delete("/delete/:id", checkAuth, checkRol("administrador"), eliminar);

module.exports = router;
