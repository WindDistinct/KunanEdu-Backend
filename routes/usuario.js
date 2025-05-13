const express = require("express");
const router = express.Router();
const { listar,actualizar ,eliminar,crear,login} = require("../controllers/usuario");

router.get("/all", listar);
router.delete("/delete/:id",eliminar)
router.put("/update/:id",actualizar)
router.post("/create", crear);
router.post("/login", login);
module.exports = router;