const db = require("../database/dbInstance.js");

const listarEstudiantes = () => {
  return new Promise((resolve, reject) => {
    db.all("select * from tb_alumno WHERE estado = 1", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};
const listarTodosLosEstudiantes = () => {
  return new Promise((resolve, reject) => {
    db.all("select * from tb_alumno", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

 
const actualizarEstudiante = (id, datos) => {
   const {
    nombre_alumno,
    dni_alumno,
    apellido_paterno,
    apellido_materno,
    direccion,
    grado,
    telefono,
    fecha_nacimiento,estado
  } = datos;

  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tb_alumno SET
        nombre_alumno = ?,
        dni_alumno = ?,
        apellido_paterno = ?,
        apellido_materno = ?,
        direccion = ?,
        grado = ?,
        telefono = ?,
        fecha_nacimiento = ?,estado=?
      WHERE id_alumno = ?
    `;

    db.run(
      sql,
      [
        nombre_alumno,
        dni_alumno,
        apellido_paterno,
        apellido_materno,
        direccion,
        grado,
        telefono,
        fecha_nacimiento,estado,
        id
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);  
      }
    );
  });
};

const eliminarEstudiante = (id) => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE tb_alumno SET estado = 0  WHERE id_alumno = ?", [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes); 
    });
  });
};
const registrarEstudiante = (datos) => {
  const {
    nombre_alumno,
    dni_alumno,
    apellido_paterno,
    apellido_materno,
    direccion,
    grado,
    telefono,
    fecha_nacimiento
  } = datos;
 const fecha_matricula = new Date().toISOString().split('T')[0]; 

    return new Promise((resolve, reject) => {
    const sqlAlumno = `
      INSERT INTO tb_alumno (
        nombre_alumno, dni_alumno, apellido_paterno, apellido_materno,
        direccion, grado, telefono, fecha_nacimiento, fecha_matricula, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(sqlAlumno, [
      nombre_alumno, dni_alumno, apellido_paterno, apellido_materno,
      direccion, grado, telefono, fecha_nacimiento, fecha_matricula
    ], function (err) {
      if (err) return reject(err);

      const alumnoId = this.lastID;

      const sqlMatricula = `
        INSERT INTO tb_matricula (fecha_matricula, observacion, alumno, grado)
        VALUES (?, ?, ?, ?)
      `;
      db.run(sqlMatricula, [fecha_matricula, '', alumnoId, grado], function (err2) {
        if (err2) return reject(err2);
        resolve({ alumnoId, matriculaId: this.lastID });
      });
    });
  });
};

module.exports = {
  listarEstudiantes,actualizarEstudiante,eliminarEstudiante,registrarEstudiante,listarTodosLosEstudiantes
};