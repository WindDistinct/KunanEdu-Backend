const express = require("express");
const router = express.Router();
const { listar,listarTodo,actualizar ,eliminar,crear,login,perfilUsuario } = require("../controllers/usuario");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");


router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",checkAuth,checkRol('ADMIN'),eliminar)
router.put("/update/:id",checkAuth,checkRol('ADMIN'),actualizar)
router.post("/create", checkAuth,checkRol('ADMIN'),crear);
router.post("/login", login);
router.get("/perfil",checkAuth,perfilUsuario )
module.exports = router;