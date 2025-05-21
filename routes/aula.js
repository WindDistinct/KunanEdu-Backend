const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,crear,listarTodo} = require("../controllers/aula");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");

router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",checkAuth,checkRol('ADMIN'),eliminar)
router.put("/update/:id",checkAuth,checkRol('ADMIN'),actualizar)
router.post("/create", checkAuth,checkRol('ADMIN'),crear);

module.exports = router;