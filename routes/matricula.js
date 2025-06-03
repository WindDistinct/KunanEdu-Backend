const express = require("express");
const router = express.Router();
const { listado,listarTodo,eliminar,actualizar,registrar,listarAuditoria} = require("../controllers/matricula");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");


router.get("/all", listado);
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);
router.delete("/delete/:id",checkAuth,checkRol('administrador'),eliminar)
router.put("/update/:id",checkAuth,checkRol('administrador'),actualizar)
router.post("/create", checkAuth,checkRol('administrador'),registrar);

module.exports = router;