require('dotenv/config');
const { app } = require(".");
const db = require('./database/db.js');
const { encrypt } = require('./utils/handlePassword.js');

const crearUsuarioInicial = async () => {
  try {
    const passwordHasheado = await encrypt('admin');
    const sql = `INSERT INTO tb_usuario (username, password, rol, estado) VALUES ($1, $2, $3, $4)`;
    await db.query(sql, ['admin', passwordHasheado, 'administrador', true]);
    console.log("✅ Usuario admin creado correctamente");
  } catch (err) {
    console.error("❌ Error al insertar usuario inicial:", err.message);
  }
};

// crearUsuarioInicial();