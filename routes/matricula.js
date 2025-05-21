const express = require("express");
const router = express.Router();
const { listado,listarTodo,eliminar,actualizar} = require("../controllers/matricula");
const checkAuth = require("../middleware/session");

router.get("/all", listado);
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",checkAuth,eliminar)
router.put("/update/:id",checkAuth,actualizar)
module.exports = router;