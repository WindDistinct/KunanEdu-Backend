const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,registrar,listarTodo} = require("../controllers/empleado");

router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",eliminar)
router.put("/update/:id",actualizar)
router.post("/create", registrar);

module.exports = router;