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
 

// 1. Rutas POST primero
router.post("/create", checkAuth, checkRol("administrador"), insertar);

// 2. Rutas PUT específicas (antes que rutas con :id)
router.put("/update/:id", checkAuth, checkRol("administrador"), actualizar);

// 3. Rutas DELETE
router.delete("/delete/:id", checkAuth, checkRol("administrador"), eliminar);

// 4. Rutas GET más específicas primero 
router.get("/alumnos-aula/:aula/:cursoseccion", listarAlumnoAula);
router.get("/por-periodo/:idPeriodo", listarAlumnosPorPeriodo);  
router.get("/all", listado);
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);

module.exports = router;
