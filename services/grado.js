const db = require("../database/dbInstance.js");

const insertarGrado = ({ nombre_grado, descripcion_grado }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_grado (nombre_grado, descripcion_grado, estado)
      VALUES (?, ?, 1)
    `;
    db.run(sql, [nombre_grado, descripcion_grado], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

const obtenerGrados = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_grado WHERE estado = 1", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodosLosGrados = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_grado", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const actualizarGrado = (id, { nombre_grado, descripcion_grado,estado }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tb_grado
      SET nombre_grado = ?, descripcion_grado = ?, estado = ?
      WHERE id_grado = ?
    `;
    db.run(sql, [nombre_grado, descripcion_grado,estado, id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const eliminarGrado = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tb_grado SET estado = 0 WHERE id_grado = ?`;
    db.run(sql, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  insertarGrado,
  obtenerGrados,
  actualizarGrado,
  eliminarGrado,obtenerTodosLosGrados
};