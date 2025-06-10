const express = require("express");
const router = express.Router();
const { listado,actualizar ,eliminar,insertar,listarSeccionPeriodo,listarTodo,listarAuditoria} = require("../controllers/periodo");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");


router.get("/all", listado);  
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);
router.get("/seccion-periodo/:id", listarSeccionPeriodo);
router.delete("/delete/:id",checkAuth,checkRol('administrador'),eliminar)
router.put("/update/:id",checkAuth,checkRol('administrador'),actualizar)
router.post("/create", checkAuth,checkRol('administrador'),insertar);

module.exports = router;