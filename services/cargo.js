const db = require("../database/dbInstance.js");

const obtenerCargos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_cargo WHERE estado = 1", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodosLosCargos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_cargo", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const insertarCargo = (data) => {
  const { nombre_cargo } = data;
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tb_cargo (nombre_cargo, estado) VALUES (?, 1)`;
    db.run(sql, [nombre_cargo], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

const actualizarCargo = (id, data) => {
  const { nombre_cargo,estado } = data;
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tb_cargo SET nombre_cargo = ?,estado=? WHERE id_cargo = ?`;
    db.run(sql, [nombre_cargo, estado,id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const eliminarCargo = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tb_cargo SET estado = 0 WHERE id_cargo = ?`;
    db.run(sql, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = { obtenerTodosLosCargos,obtenerCargos, insertarCargo, actualizarCargo, eliminarCargo };