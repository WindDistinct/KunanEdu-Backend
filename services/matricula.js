const db = require("../database/dbInstance.js");

function registrarAuditoriaMatricula({
  id_matricula,
  alumno_anterior, alumno_nuevo,
  grado_anterior, grado_nuevo,
  periodo_anterior, periodo_nuevo,
  fecha_matricula_anterior, fecha_matricula_nueva,
  observacion_anterior, observacion_nueva,
  estado_anterior, estado_nuevo,
  operacion,
  usuario
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sql = `
      INSERT INTO tb_audit_matricula (
        id_matricula,
         alumno_anterior, alumno_nuevo,
        grado_anterior, grado_nuevo,
        periodo_anterior, periodo_nuevo,
        fecha_matricula_anterior, fecha_matricula_nueva,
        observacion_anterior, observacion_nueva,
        estado_anterior, estado_nuevo,
        operacion, fecha_modificacion, usuario_modificador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)
    `;
    const valores = [
      id_matricula,
     alumno_anterior, alumno_nuevo,
      grado_anterior, grado_nuevo,
      periodo_anterior, periodo_nuevo,
      fecha_matricula_anterior, fecha_matricula_nueva,
      observacion_anterior, observacion_nueva,
      estado_anterior, estado_nuevo,
      operacion, fecha, usuario
    ];
    db.run(sql, valores, err => (err ? reject(err) : resolve()));
  });
}

 
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
   return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT * FROM tb_matricula WHERE id_matricula = ?`;

    db.get(sqlSelect, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Matrícula no encontrada"));

      const sqlUpdate = `UPDATE tb_matricula SET estado = 0 WHERE id_matricula = ?`;

      db.run(sqlUpdate, [id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaMatricula({
          id_matricula: id,
          alumno_anterior: anterior.alumno,
          alumno_nuevo: anterior.alumno,
          grado_anterior: anterior.grado,
          grado_nuevo: anterior.grado,
          periodo_anterior: anterior.periodo,
          periodo_nuevo: anterior.periodo,
          fecha_matricula_anterior: anterior.fecha_matricula,
          fecha_matricula_nueva: anterior.fecha_matricula,
          observacion_anterior: anterior.observacion,
          observacion_nueva: anterior.observacion,
          estado_anterior: anterior.estado,
          estado_nuevo: 0,
          operacion: 'DELETE',
          usuario: usuarioModificador.usuario
        })
        .then(() => resolve({ mensaje: "Matrícula eliminada (lógico)" }))
        .catch(reject);
      });
    });
  });
};

const actualizarMatricula = (id, datos, usuarioModificador) => {
  const { fecha_matricula, observacion, estado, alumno, grado, periodo } = datos;

  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_matricula WHERE id_matricula = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Matrícula no encontrada"));

      const sqlUpdate = `
        UPDATE tb_matricula SET
          fecha_matricula = ?, observacion = ?, estado = ?, alumno = ?, grado = ?, periodo = ?
        WHERE id_matricula = ?
      `;

      db.run(sqlUpdate, [
        fecha_matricula, observacion, estado, alumno, grado, periodo, id
      ], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaMatricula({
          id_matricula: id,
          alumno_anterior: anterior.alumno, alumno_nuevo: alumno,
          grado_anterior: anterior.grado, grado_nuevo: grado,
          periodo_anterior: anterior.periodo, periodo_nuevo: periodo,
          fecha_matricula_anterior: anterior.fecha_matricula, fecha_matricula_nueva: fecha_matricula,
          observacion_anterior: anterior.observacion, observacion_nueva: observacion,
          estado_anterior: anterior.estado, estado_nuevo: estado,
          operacion: 'UPDATE',
          usuario: usuarioModificador.usuario
        })
        .then(() => resolve({ mensaje: "Matrícula actualizada con éxito" }))
        .catch(reject);
      });
    });
  });
};

const insertarMatricula = (datos, usuarioModificador) => {
  const { fecha_matricula, observacion, estado, alumno, grado, periodo } = datos;

  return new Promise((resolve, reject) => {
    const check = `SELECT * FROM tb_matricula WHERE alumno = ? AND grado = ? AND periodo = ?`;
    db.get(check, [alumno, grado, periodo], (err, existente) => {
      if (err) return reject(err);
      if (existente) return reject(new Error('Ya existe matrícula para este alumno en ese grado y periodo.'));

      const sql = `
        INSERT INTO tb_matricula (
          fecha_matricula, observacion, estado, alumno, grado, periodo
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [fecha_matricula, observacion, estado, alumno, grado, periodo], function (err2) {
        if (err2) return reject(err2);

        const id_matricula = this.lastID;

        registrarAuditoriaMatricula({
          id_matricula,
            alumno_anterior: null, alumno_nuevo: alumno,
          grado_anterior: null, grado_nuevo: grado,
          periodo_anterior: null, periodo_nuevo: periodo,
          fecha_matricula_anterior: null, fecha_matricula_nueva: fecha_matricula,
          observacion_anterior: null, observacion_nueva: observacion,
          estado_anterior: null, estado_nuevo: estado,
          operacion: 'INSERT',
          usuario: usuarioModificador.usuario
        })
        .then(() => resolve({ mensaje: "Matrícula registrada correctamente", id_matricula }))
        .catch(reject);
      });
    });
  });
};
module.exports = { 
  listarMatricula,obtenerTodasLasMatriculas,actualizarMatricula,eliminarMatricula,insertarMatricula
};