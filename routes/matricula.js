const express = require("express");
const router = express.Router();
const { listado} = require("../controllers/matricula");

router.get("/all", listado);

module.exports = router;