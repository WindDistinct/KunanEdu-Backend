const db = require("../database/dbInstance.js");

function registrarAuditoriaAlumno({
  id_alumno,
  nombre_anterior, nombre_nuevo,
  dni_anterior, dni_nuevo,
  apellido_paterno_anterior, apellido_paterno_nuevo,
  apellido_materno_anterior, apellido_materno_nuevo,
  direccion_anterior, direccion_nueva, 
  telefono_anterior, telefono_nuevo,
  fecha_nacimiento_anterior, fecha_nacimiento_nueva, 
  estado_anterior, estado_nuevo,
  operacion,
  usuario
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sql = `
      INSERT INTO tb_audit_alumno (
        id_alumno,
        nombre_anterior, nombre_nuevo,
        dni_anterior, dni_nuevo,
        apellido_paterno_anterior, apellido_paterno_nuevo,
        apellido_materno_anterior, apellido_materno_nuevo,
        direccion_anterior, direccion_nueva, 
        telefono_anterior, telefono_nuevo,
        fecha_nacimiento_anterior, fecha_nacimiento_nueva, 
        estado_anterior, estado_nuevo,
        operacion, fecha_modificacion, usuario_modificador
      ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      id_alumno,
      nombre_anterior, nombre_nuevo,
      dni_anterior, dni_nuevo,
      apellido_paterno_anterior, apellido_paterno_nuevo,
      apellido_materno_anterior, apellido_materno_nuevo,
      direccion_anterior, direccion_nueva, 
      telefono_anterior, telefono_nuevo,
      fecha_nacimiento_anterior, fecha_nacimiento_nueva, 
      estado_anterior, estado_nuevo,
      operacion, fecha, usuario
    ];

    db.run(sql, valores, function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}


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

 
const actualizarEstudiante = (id, datos,usuarioModificador) => { 
    const {
    nombre_alumno, dni_alumno, apellido_paterno, apellido_materno,
    direccion, telefono, fecha_nacimiento, estado
  } = datos;

  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_alumno WHERE id_alumno = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error('Alumno no encontrado'));

      const sqlUpdate = `
        UPDATE tb_alumno SET
          nombre_alumno = ?, dni_alumno = ?, apellido_paterno = ?, apellido_materno = ?,
          direccion = ?, telefono = ?, fecha_nacimiento = ?, estado = ?
        WHERE id_alumno = ?
      `;
        db.run(sqlUpdate, [
        nombre_alumno, dni_alumno, apellido_paterno, apellido_materno,
        direccion, telefono, fecha_nacimiento, estado, id
      ], function (err2) {
        if (err2) return reject(err2);
          registrarAuditoriaAlumno({
            id_alumno: id,
            nombre_anterior: anterior.nombre_alumno,
            nombre_nuevo: nombre_alumno,
            dni_anterior: anterior.dni_alumno,
            dni_nuevo: dni_alumno,
            apellido_paterno_anterior: anterior.apellido_paterno,
            apellido_paterno_nuevo: apellido_paterno,
            apellido_materno_anterior: anterior.apellido_materno,
            apellido_materno_nuevo: apellido_materno,
            direccion_anterior: anterior.direccion,
            direccion_nueva: direccion,
            telefono_anterior: anterior.telefono,
            telefono_nuevo: telefono,
            fecha_nacimiento_anterior: anterior.fecha_nacimiento,
            fecha_nacimiento_nueva: fecha_nacimiento,
            estado_anterior: anterior.estado,
            estado_nuevo: estado,
            operacion: 'UPDATE',
            usuario: usuarioModificador.usuario
          })
            .then(() => resolve({ mensaje: "Alumno y matrícula actualizados con auditoría" }))
            .catch(reject);
      });
    });
  });
};


const eliminarEstudiante = (id,usuarioModificador) => {
    return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT * FROM tb_alumno WHERE id_alumno = ?`;

    db.get(sqlSelect, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior || Object.keys(anterior).length === 0) return reject(new Error("Estudiante no encontrado"));

      const sqlUpdate = `UPDATE tb_alumno SET estado = 0 WHERE id_alumno = ?`;

      db.run(sqlUpdate, [id], function (err2) {
        if (err2) return reject(err2);
 
        registrarAuditoriaAlumno({
          id_alumno: id,
          nombre_anterior: anterior.nombre_alumno,
          nombre_nuevo: anterior.nombre_alumno,
          dni_anterior: anterior.dni_alumno,
          dni_nuevo: anterior.dni_alumno,
          apellido_paterno_anterior: anterior.apellido_paterno,
          apellido_paterno_nuevo: anterior.apellido_paterno,
          apellido_materno_anterior: anterior.apellido_materno,
          apellido_materno_nuevo: anterior.apellido_materno,
          direccion_anterior: anterior.direccion,
          direccion_nueva: anterior.direccion, 
          telefono_anterior: anterior.telefono,
          telefono_nuevo: anterior.telefono,
          fecha_nacimiento_anterior: anterior.fecha_nacimiento,
          fecha_nacimiento_nueva: anterior.fecha_nacimiento, 
          estado_anterior: anterior.estado,
          estado_nuevo: 0,
          operacion: 'DELETE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve(this.changes))
          .catch(reject);
      });
    });
  });
};

const registrarEstudiante = (datos,usuarioModificador) => {
   const {
    nombre_alumno,
    dni_alumno,
    apellido_paterno,
    apellido_materno,
    direccion, 
    telefono,
    fecha_nacimiento
  } = datos;


  return new Promise((resolve, reject) => {
    const sqlAlumno = `
      INSERT INTO tb_alumno (
        nombre_alumno, dni_alumno, apellido_paterno, apellido_materno,
        direccion, telefono, fecha_nacimiento, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(sqlAlumno, [
      nombre_alumno, dni_alumno, apellido_paterno, apellido_materno,
      direccion, telefono, fecha_nacimiento
    ], function (err) {
      if (err) return reject(err);

      const alumnoId = this.lastID; 
      registrarAuditoriaAlumno({
        id_alumno: alumnoId,
        nombre_anterior: null,
        nombre_nuevo: nombre_alumno,
        dni_anterior: null,
        dni_nuevo: dni_alumno,
        apellido_paterno_anterior: null,
        apellido_paterno_nuevo: apellido_paterno,
        apellido_materno_anterior: null,
        apellido_materno_nuevo: apellido_materno,
        direccion_anterior: null,
        direccion_nueva: direccion, 
        telefono_anterior: null,
        telefono_nuevo: telefono,
        fecha_nacimiento_anterior: null,
        fecha_nacimiento_nueva: fecha_nacimiento, 
        estado_anterior: null,
        estado_nuevo: 1,
        operacion: 'INSERT',
        usuario: usuarioModificador.usuario
      })
        .then(() => resolve({ alumnoId }))
        .catch(reject);
       
    });
  });
};
module.exports = {
  listarEstudiantes,actualizarEstudiante,eliminarEstudiante,registrarEstudiante,listarTodosLosEstudiantes
};