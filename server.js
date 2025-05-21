require("dotenv").config();
const { app } = require(".");
const connection = require("./database/conexion");
const PORT = process.env.PORT;

const {encrypt}=require('./utils/handlePassword')
const db = require("./database/dbInstance");
connection(); 

app.listen(PORT, () => {
  console.log("Servidor activo en el puerto: " + PORT);
});

const crearUsuarioInicial = async () => {
    const passwordHasheado = await encrypt('admin');
 
  const sql = `INSERT INTO tb_usuario (usuario, password, rol, estado) VALUES (?, ?, ?, ?)`;
  db.run(sql, ['admin', passwordHasheado, 'ADMIN', 1], function(err) {
    if (err) return console.error("Error al insertar usuario inicial:", err.message);
    console.log("Usuario admin creado correctamente");
  });
};

//crearUsuarioInicial();