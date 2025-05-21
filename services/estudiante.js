const db = require("../database/dbInstance.js");

function registrarAuditoriaAlumno({
  id_alumno,
  nombre_anterior, nombre_nuevo,
  dni_anterior, dni_nuevo,
  apellido_paterno_anterior, apellido_paterno_nuevo,
  apellido_materno_anterior, apellido_materno_nuevo,
  direccion_anterior, direccion_nueva,
  grado_anterior, grado_nuevo,
  telefono_anterior, telefono_nuevo,
  fecha_nacimiento_anterior, fecha_nacimiento_nueva,
  fecha_matricula_anterior, fecha_matricula_nueva,
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
        grado_anterior, grado_nuevo,
        telefono_anterior, telefono_nuevo,
        fecha_nacimiento_anterior, fecha_nacimiento_nueva,
        fecha_matricula_anterior, fecha_matricula_nueva,
        estado_anterior, estado_nuevo,
        operacion, fecha_modificacion, usuario_modificador
      ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      id_alumno,
      nombre_anterior, nombre_nuevo,
      dni_anterior, dni_nuevo,
      apellido_paterno_anterior, apellido_paterno_nuevo,
      apellido_materno_anterior, apellido_materno_nuevo,
      direccion_anterior, direccion_nueva,
      grado_anterior, grado_nuevo,
      telefono_anterior, telefono_nuevo,
      fecha_nacimiento_anterior, fecha_nacimiento_nueva,
      fecha_matricula_anterior, fecha_matricula_nueva,
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
    direccion, grado, telefono, fecha_nacimiento, fecha_matricula, estado
  } = datos;

  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_alumno WHERE id_alumno = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error('Alumno no encontrado'));

      const sqlUpdate = `
        UPDATE tb_alumno SET
          nombre_alumno = ?, dni_alumno = ?, apellido_paterno = ?, apellido_materno = ?,
          direccion = ?, grado = ?, telefono = ?, fecha_nacimiento = ?, fecha_matricula = ?, estado = ?
        WHERE id_alumno = ?
      `;
        db.run(sqlUpdate, [
        nombre_alumno, dni_alumno, apellido_paterno, apellido_materno,
        direccion, grado, telefono, fecha_nacimiento, fecha_matricula, estado, id
      ], function (err2) {
        if (err2) return reject(err2);
 
        const sqlMatriculaBuscar = `SELECT * FROM tb_matricula WHERE alumno = ?`;

        db.get(sqlMatriculaBuscar, [id], (err3, matriculaAnterior) => {
          if (err3) return reject(err3);
          if (!matriculaAnterior) return reject(new Error('Matrícula no encontrada'));

          const sqlUpdateMatricula = `UPDATE tb_matricula SET fecha_matricula = ? WHERE alumno = ?`;

          db.run(sqlUpdateMatricula, [fecha_matricula, id], function (err4) {
            if (err4) return reject(err4);

            const fecha_modificacion = new Date().toISOString();

            const sqlAuditMatricula = `
              INSERT INTO tb_audit_matricula (
                id_matricula,
                alumno,
                fecha_matricula_anterior,
                fecha_matricula_nueva,
                observacion_anterior,
                observacion_nueva,
                grado_anterior,
                grado_nuevo,
                estado_anterior,
                estado_nuevo,
                operacion,
                usuario_modificador,
                fecha_modificacion
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPDATE', ?, ?)
            `;

            db.run(sqlAuditMatricula, [
              matriculaAnterior.id_matricula,
              id,
              matriculaAnterior.fecha_matricula,
              fecha_matricula,
              matriculaAnterior.observacion,
              matriculaAnterior.observacion,  
              matriculaAnterior.grado,
              matriculaAnterior.grado,  
              matriculaAnterior.estado,
              matriculaAnterior.estado, 
              usuarioModificador.usuario,
              fecha_modificacion
            ], function (err5) {
              if (err5) return reject(err5);
 
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
                grado_anterior: anterior.grado,
                grado_nuevo: grado,
                telefono_anterior: anterior.telefono,
                telefono_nuevo: telefono,
                fecha_nacimiento_anterior: anterior.fecha_nacimiento,
                fecha_nacimiento_nueva: fecha_nacimiento,
                fecha_matricula_anterior: anterior.fecha_matricula,
                fecha_matricula_nueva: fecha_matricula,
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
          grado_anterior: anterior.grado,
          grado_nuevo: anterior.grado,
          telefono_anterior: anterior.telefono,
          telefono_nuevo: anterior.telefono,
          fecha_nacimiento_anterior: anterior.fecha_nacimiento,
          fecha_nacimiento_nueva: anterior.fecha_nacimiento,
          fecha_matricula_anterior: anterior.fecha_matricula,
          fecha_matricula_nueva: anterior.fecha_matricula,
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
        INSERT INTO tb_matricula (fecha_matricula, observacion, estado, alumno, grado)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(sqlMatricula, [fecha_matricula, '', 1, alumnoId, grado], function (err2) {
        if (err2) return reject(err2);

        const matriculaId = this.lastID;
 
        const sqlAuditMatricula = `
          INSERT INTO tb_audit_matricula (
            id_matricula,
            alumno,
            fecha_matricula_anterior,
            fecha_matricula_nueva,
            observacion_anterior,
            observacion_nueva,
            grado_anterior,
            grado_nuevo,
            estado_anterior,
            estado_nuevo,
            operacion,
            usuario_modificador,
            fecha_modificacion
          ) VALUES (?, ?, NULL, ?, NULL, ?, NULL, ?, NULL, ?, 'INSERT', ?, ?)
        `;

        const fecha_modificacion = new Date().toISOString();

        db.run(sqlAuditMatricula, [
          matriculaId,
          alumnoId,
          fecha_matricula,
          '',
          grado,
          1,
          usuarioModificador.usuario,
          fecha_modificacion
        ], function (err3) {
          if (err3) return reject(err3);
 
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
            grado_anterior: null,
            grado_nuevo: grado,
            telefono_anterior: null,
            telefono_nuevo: telefono,
            fecha_nacimiento_anterior: null,
            fecha_nacimiento_nueva: fecha_nacimiento,
            fecha_matricula_anterior: null,
            fecha_matricula_nueva: fecha_matricula,
            estado_anterior: null,
            estado_nuevo: 1,
            operacion: 'INSERT',
            usuario: usuarioModificador.usuario
          })
            .then(() => resolve({ alumnoId, matriculaId }))
            .catch(reject);
        });
      });
    });
  });
};
module.exports = {
  listarEstudiantes,actualizarEstudiante,eliminarEstudiante,registrarEstudiante,listarTodosLosEstudiantes
};