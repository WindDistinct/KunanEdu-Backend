const db = require("../database/dbInstance.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "clave_secreta";


const obtenerUsuario = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_usuario", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

 
const insertarUsuario = async (datos) => {
   const { usuario, password, rol } = datos;
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_usuario (usuario, password, rol)
      VALUES (?, ?, ?)
    `;
    db.run(sql, [usuario, hashedPassword, rol], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

const loginUsuario = async ({usuario, password}) => {
   

  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM tb_usuario WHERE usuario = ?`;
    
    db.get(sql, [usuario], async (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null); // Usuario no encontrado

      const passwordValido = await bcrypt.compare(password, row.password);
      if (!passwordValido) return resolve(false); // Contraseña incorrecta

      // Crear token JWT
      const token = jwt.sign({ id: row.id_usuario, rol: row.rol }, SECRET_KEY, {
        expiresIn: "1d",
      });

      resolve({ token, usuario: row.usuario, rol: row.rol });
    });
  });
};


const actualizarUsuario = (id, { usuario, password, rol }) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tb_usuario SET usuario = ?, password = ?, rol = ? WHERE id_usuario = ?`;
    db.run(sql, [usuario, password, rol, id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const eliminarUsuario = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM tb_usuario WHERE id_usuario = ?`;
    db.run(sql, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  obtenerUsuario,
  insertarUsuario,
  actualizarUsuario,loginUsuario,
  eliminarUsuario}