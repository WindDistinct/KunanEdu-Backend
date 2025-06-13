const express = require("express");
const router = express.Router();
const { listado,actualizar ,eliminar,insertar,listarTodo,crearMultiples,listarAuditoria,listarNotasAlumno} = require("../controllers/examen");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");

router.get("/all", listado);  
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);
router.get("/notas-alum/:id", listarNotasAlumno);
router.post('/multiple',checkAuth,checkRol('administrador'),crearMultiples);
router.delete("/delete/:id",checkAuth,checkRol('profesor'),eliminar)
router.put("/update/:id",checkAuth,checkRol('profesor'),actualizar)
router.post("/create", checkAuth,checkRol('profesor'),insertar);

module.exports = router;