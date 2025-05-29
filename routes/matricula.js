const express = require("express");
const router = express.Router();
const { listado,listarTodo,eliminar,actualizar,registrar} = require("../controllers/matricula");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");


router.get("/all", listado);
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",checkAuth,eliminar)
router.put("/update/:id",checkAuth,actualizar)
router.post("/create", checkAuth,checkRol('ADMIN'),registrar);

module.exports = router;