const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,crear} = require("../controllers/aula");

router.get("/all", listar);
router.delete("/delete/:id",eliminar)
router.put("/update/:id",actualizar)
router.post("/create", crear);

module.exports = router;