const db = require("../database/dbInstance.js");

 
const listarMatricula = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_matricula WHERE estado = 1", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodasLasMatriculas = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_matricula", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const eliminarMatricula = (id, usuarioModificador) => {
  const fecha_modificacion = new Date().toISOString();

  return new Promise((resolve, reject) => { 
    const sqlSelect = `SELECT * FROM tb_matricula WHERE id_matricula = ?`;
    db.get(sqlSelect, [id], (err, anterior) => {
      if (err) return reject(err);
       if (!anterior || Object.keys(anterior).length === 0) return reject(new Error("EstMatrículaudiante no encontrado"));
 
 
      const sqlUpdate = `UPDATE tb_matricula SET estado = 0 WHERE id_matricula = ?`;
      db.run(sqlUpdate, [id], function (err2) {
        if (err2) return reject(err2);
 
        const sqlAudit = `
          INSERT INTO tb_audit_matricula (
            id_matricula,
            alumno,
            grado_anterior,
            grado_nuevo,
            fecha_matricula_anterior,
            fecha_matricula_nueva,
            observacion_anterior,
            observacion_nueva,
            estado_anterior,
            estado_nuevo,
            operacion,
            usuario_modificador,
            fecha_modificacion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DELETE', ?, ?)
        `;

        db.run(sqlAudit, [
          id,
          anterior.alumno,
          anterior.grado,
          anterior.grado,  
          anterior.fecha_matricula,
          anterior.fecha_matricula,  
          anterior.observacion,
          anterior.observacion,  
          anterior.estado,
          0,  
          usuarioModificador.usuario,
          fecha_modificacion
        ], function (err3) {
          if (err3) return reject(err3);
          resolve(this.changes);
        });
      });
    });
  });
};

const actualizarMatricula = (id_matricula, datos, usuarioModificador) => {
   const {
    fecha_matricula,
    observacion,
    grado,
    estado
  } = datos;

  const fecha_modificacion = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT * FROM tb_matricula WHERE id_matricula = ?`;
    db.get(sqlSelect, [id_matricula], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior || Object.keys(anterior).length === 0) return reject(new Error("Matrícula no encontrada"));
 
      const sqlAlumnoAnterior = `SELECT * FROM tb_alumno WHERE id_alumno = ?`;
      db.get(sqlAlumnoAnterior, [anterior.alumno], (err2, anteriorAlumno) => {
        if (err2) return reject(err2);
        if (!anteriorAlumno) return reject(new Error("Alumno no encontrado"));
 
        const sqlUpdate = `
          UPDATE tb_matricula
          SET fecha_matricula = ?, observacion = ?, grado = ?, estado = ?
          WHERE id_matricula = ?
        `;
        db.run(sqlUpdate, [fecha_matricula, observacion, grado, estado, id_matricula], function (err3) {
          if (err3) return reject(err3);
 
          const sqlUpdateAlumno = `
            UPDATE tb_alumno
            SET fecha_matricula = ?
            WHERE id_alumno = ?
          `;
          db.run(sqlUpdateAlumno, [fecha_matricula, anterior.alumno], function (err4) {
            if (err4) return reject(err4);
 
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
              id_matricula,
              anterior.alumno,
              anterior.fecha_matricula,
              fecha_matricula,
              anterior.observacion,
              observacion,
              anterior.grado,
              grado,
              anterior.estado,
              estado,
              usuarioModificador.usuario,
              fecha_modificacion
            ], function (err5) {
              if (err5) return reject(err5);
 
              const sqlAlumnoActual = `SELECT * FROM tb_alumno WHERE id_alumno = ?`;
              db.get(sqlAlumnoActual, [anterior.alumno], (err6, alumnoActual) => {
                if (err6) return reject(err6);
                if (!alumnoActual) return reject(new Error("Alumno no encontrado"));
 
                const sqlAuditAlumno = `
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
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(sqlAuditAlumno, [
                  anterior.alumno,

                  anteriorAlumno.nombre_alumno, alumnoActual.nombre_alumno,
                  anteriorAlumno.dni_alumno, alumnoActual.dni_alumno,
                  anteriorAlumno.apellido_paterno, alumnoActual.apellido_paterno,
                  anteriorAlumno.apellido_materno, alumnoActual.apellido_materno,
                  anteriorAlumno.direccion, alumnoActual.direccion,
                  anteriorAlumno.grado, alumnoActual.grado,
                  anteriorAlumno.telefono, alumnoActual.telefono,
                  anteriorAlumno.fecha_nacimiento, alumnoActual.fecha_nacimiento,
                  anteriorAlumno.fecha_matricula, alumnoActual.fecha_matricula,
                  anteriorAlumno.estado, alumnoActual.estado,

                  'UPDATE',
                  fecha_modificacion,
                  usuarioModificador.usuario
                ], function (err7) {
                  if (err7) return reject(err7);
                  resolve({ mensaje: "Matrícula y auditorías actualizadas correctamente" });
                });
              });
            });
          });
        });
      });
    });
  });
};
module.exports = { 
  listarMatricula,obtenerTodasLasMatriculas,actualizarMatricula,eliminarMatricula
};