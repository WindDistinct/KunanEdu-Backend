const express = require("express");
const router = express.Router();
const { listado,actualizar ,eliminar,insertar} = require("../controllers/estudiante");

router.get("/all", listado);
router.delete("/delete/:id",eliminar)
router.put("/update/:id",actualizar)
router.post("/create", insertar);

module.exports = router;