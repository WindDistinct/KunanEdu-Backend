const express = require("express");
const router = express.Router();
const { listar,listarTodo,actualizar ,eliminar,crear,login,perfilUsuario,listarAuditoria } = require("../controllers/usuario");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");


router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);
router.delete("/delete/:id",checkAuth,checkRol('administrador'),eliminar)
router.put("/update/:id",checkAuth,checkRol('administrador'),actualizar)
router.post("/create", checkAuth,checkRol('administrador'),crear);
router.post("/login", login);
router.get("/perfil",checkAuth,perfilUsuario )
module.exports = router;