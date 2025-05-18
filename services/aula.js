const db = require("../database/dbInstance.js");

const crearAula = (datos) => {
  const { numero_aula, grado, aforo, ubicacion } = datos;
  const estado = 1;
  const sql = `INSERT INTO tb_aula (numero_aula, grado, aforo, ubicacion, estado) VALUES (?, ?, ?, ?, ?)`;

  return new Promise((resolve, reject) => {
    db.run(sql, [numero_aula, grado, aforo, ubicacion, estado], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

const obtenerAulas = () => {
  const sql = `SELECT * FROM tb_aula WHERE estado = 1`;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodasLasAulas = () => {
  const sql = `SELECT * FROM tb_aula`;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const actualizarAula = (id, datos) => {
  const { numero_aula, grado, aforo, ubicacion,estado } = datos;
  const sql = `UPDATE tb_aula SET numero_aula = ?, grado = ?, aforo = ?, ubicacion = ?,estado=? WHERE id_aula = ?`;

  return new Promise((resolve, reject) => {
    db.run(sql, [numero_aula, grado, aforo, ubicacion,estado, id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const eliminarAula = (id) => {
  const sql = `UPDATE tb_aula SET estado = 0 WHERE id_aula = ?`;

  return new Promise((resolve, reject) => {
    db.run(sql, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  crearAula,
  obtenerAulas,
  actualizarAula,
  eliminarAula,
  obtenerTodasLasAulas
};