const db = require("../database/dbInstance.js");

const obtenerCursos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_curso WHERE estado = 1", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodosLosCursos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_curso ", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

 

const insertarCruso = (datos) => {
  const { nombre_curso, grado, docente } = datos;

  const sql = `
    INSERT INTO tb_curso (nombre_curso, grado, docente, estado)
    VALUES (?, ?, ?, 1)
  `;

  return new Promise((resolve, reject) => {
    db.run(sql, [nombre_curso, grado, docente], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const actualizarCurso = (id, datos) => {
  const { nombre_curso, grado, docente, estado } = datos;

  const sql = `
    UPDATE tb_curso
    SET nombre_curso = ?, grado = ?, docente = ?,estado=?
    WHERE id_curso = ?
  `;

  return new Promise((resolve, reject) => {
    db.run(sql, [nombre_curso, grado, docente,estado, id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);  
    });
  });
};

const eliminarCurso = (id) => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE tb_curso SET estado = 0 WHERE id_curso = ?", [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  obtenerCursos, 
  insertarCruso,
  actualizarCurso,
  eliminarCurso,
  obtenerTodosLosCursos
};