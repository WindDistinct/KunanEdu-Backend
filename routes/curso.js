const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,crear,listarTodo,listarAuditoria} = require("../controllers/curso");
const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");

 

// 1. Rutas POST primero
router.post("/create", checkAuth,checkRol('administrador'),crear);

// 2. Rutas PUT específicas (antes que rutas con :id)
router.put("/update/:id",checkAuth,checkRol('administrador'),actualizar)

// 3. Rutas DELETE
router.delete("/delete/:id",checkAuth,checkRol('administrador'),eliminar)

// 4. Rutas GET más específicas primero
router.get("/all", listar);
router.get("/all-adm", listarTodo);
router.get("/all-audit", listarAuditoria);

module.exports = router;