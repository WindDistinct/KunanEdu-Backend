const db = require("../database/dbInstance.js");

const obtenerUsuario = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_usuario", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const insertarUsuario = ({ usuario, password, rol }) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tb_usuario (usuario, password, rol) VALUES (?, ?, ?)`;
    db.run(sql, [usuario, password, rol], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
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
  actualizarUsuario,
  eliminarUsuario}