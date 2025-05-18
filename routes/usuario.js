const express = require("express");
const router = express.Router();
const { listar,listarTodo,actualizar ,eliminar,crear,login,perfilUsuario } = require("../controllers/usuario");
const checkAuth = require("../middleware/session");

router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",eliminar)
router.put("/update/:id",actualizar)
router.post("/create", crear);
router.post("/login", login);
router.get("/perfil",checkAuth,perfilUsuario )
module.exports = router;