const db = require("../database/dbInstance.js"); 
const {encrypt,compare}=require('../utils/handlePassword.js')
const {tokensign}=require('../utils/handleJwt.js') 

const obtenerUsuario = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_usuario WHERE estado = 1", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodosLosUsuario = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_usuario", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

 
const insertarUsuario = async (datos) => {
   const { usuario, password, rol } = datos;
  const hashedPassword = await encrypt(password);

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_usuario (usuario,estado, password, rol)
      VALUES (?, 1 , ?, ?)
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

      const passwordValido = await compare(password, row.password);
      if (!passwordValido) return resolve(false); // Contraseña incorrecta

      // Crear token JWT
       const token = await tokensign(row);


      resolve({ token, usuario: row.usuario, rol: row.rol });
    });
  });
};


const actualizarUsuario = (id, { usuario, password, rol,estado }) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tb_usuario SET usuario = ?, password = ?, rol = ?, estado = ? WHERE id_usuario = ?`;
    db.run(sql, [usuario, password, rol, estado , id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const eliminarUsuario = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tb_usuario SET estado = 0  WHERE id_usuario = ?`;
    db.run(sql, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};
const obtenerPerfil = async (id_usuario) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id_usuario, usuario, rol FROM tb_usuario WHERE id_usuario = ?`;

    db.get(sql, [id_usuario], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve(row);
    });
  });
};

module.exports = {
  obtenerUsuario,
  obtenerTodosLosUsuario,
  insertarUsuario,
  actualizarUsuario,loginUsuario,obtenerPerfil,
  eliminarUsuario}