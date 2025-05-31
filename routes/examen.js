const express = require("express");
const router = express.Router();
const { listado,actualizar ,eliminar,insertar,listarTodo} = require("../controllers/examen");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");

router.get("/all", listado);  
router.get("/all-adm", listarTodo);
router.delete("/delete/:id",checkAuth,checkRol('PROFESOR'),eliminar)
router.put("/update/:id",checkAuth,checkRol('PROFESOR'),actualizar)
router.post("/create", checkAuth,checkRol('PROFESOR'),insertar);

module.exports = router;