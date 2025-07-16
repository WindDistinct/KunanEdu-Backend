const express = require("express");
const router = express.Router();
const {
  listar,
  actualizar,
  eliminar,
  crear,
  listarTodo,
  // listarAuditoria,
  generar,
  getHistorial
} = require("../controllers/nota");

const checkAuth = require("../middleware/session");
const checkRol = require("../middleware/rol");

router.get("/all", listar);
router.get("/all-adm", listarTodo);
// router.get("/all-audit", listarAuditoria);
router.delete("/delete/:id", checkAuth, checkRol('administrador'), eliminar);
router.put("/update/:id", actualizar);
router.post("/create", checkAuth, checkRol('profesor'), crear);
router.get("/historial/:id", getHistorial);
router.get("/generar-reporte/:periodo/:alumno", generar);

module.exports = router;
