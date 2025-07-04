const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,insertar,listarTodo,listarAuditoria} = require("../controllers/horario");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");


router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);
router.delete("/delete/:id",checkAuth,checkRol('administrador'),eliminar)
router.put("/update/:id",checkAuth,checkRol('administrador'),actualizar)
router.post("/create", checkAuth,checkRol('administrador'),insertar);

module.exports = router;