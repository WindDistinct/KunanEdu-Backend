const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,crear,listarTodo} = require("../controllers/cargo");

router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",eliminar)
router.put("/update/:id",actualizar)
router.post("/create", crear);

module.exports = router;