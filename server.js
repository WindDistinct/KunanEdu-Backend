require("dotenv").config();
const { app } = require(".");
const connection = require("./database/conexion");
const PORT = process.env.PORT;

connection(); 

app.listen(PORT, () => {
  console.log("Servidor activo en el puerto: " + PORT);
});