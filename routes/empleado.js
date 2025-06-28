const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,registrar,listarCursosPorDocenteYPeriodo,listarEmpleadoUsuario,listarDocente,listarTodo,listarAuditoria} = require("../controllers/empleado");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");
 

// 1. Rutas POST primero
router.post("/create",checkAuth,checkRol('administrador'), registrar);

// 2. Rutas PUT específicas (antes que rutas con :id)
router.put("/update/:id",checkAuth,checkRol('administrador'),actualizar)

// 3. Rutas DELETE
router.delete("/delete/:id",checkAuth,checkRol('administrador'),eliminar)

// 4. Rutas GET más específicas primero 
router.get("/cursos-periodo/:idDocente/:periodo", listarCursosPorDocenteYPeriodo);
router.get("/all-audit", listarAuditoria);
router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.get("/all-docente", listarDocente);
router.get("/all-usuarios", listarEmpleadoUsuario);

module.exports = router;