const express = require("express");
const router = express.Router();
const { listar,actualizar ,verificarCursosAsignados,eliminar,crear,crearMultiples,listarTodo,listarAuditoria} = require("../controllers/curso_seccion");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");

router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);
router.get("/verificar-asig/:id", verificarCursosAsignados);
router.post('/multiple',checkAuth,checkRol('administrador'),crearMultiples);
router.delete("/delete/:id",checkAuth,checkRol('administrador'),eliminar)
router.put("/update/:id",checkAuth,checkRol('administrador'),actualizar)
router.post("/create", checkAuth,checkRol('administrador'),crear);

module.exports = router;