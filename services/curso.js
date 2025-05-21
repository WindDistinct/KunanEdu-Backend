const db = require("../database/dbInstance.js");

function registrarAuditoriaCurso({
  id_curso,
  nombre_anterior, nombre_nuevo,
  grado_anterior, grado_nuevo,
  docente_anterior, docente_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sqlAudit = `
      INSERT INTO tb_audit_curso (
        id_curso, nombre_anterior, nombre_nuevo,
        grado_anterior, grado_nuevo,
        docente_anterior, docente_nuevo,
        estado_anterior, estado_nuevo,
        operacion, fecha_modificacion, usuario_modificador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlAudit, [
      id_curso,
      nombre_anterior, nombre_nuevo,
      grado_anterior, grado_nuevo,
      docente_anterior, docente_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha, usuario
    ], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

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

 

const insertarCurso = (datos,usuarioModificador) => {
  const { nombre_curso, grado, docente } = datos;

  return new Promise((resolve, reject) => {
    const sqlInsert = `
      INSERT INTO tb_curso (nombre_curso, grado, docente, estado)
      VALUES (?, ?, ?, 1)
    `;

    db.run(sqlInsert, [nombre_curso, grado, docente], function (err) {
      if (err) return reject(err);

      const idCurso = this.lastID;

      registrarAuditoriaCurso({
        id_curso: idCurso,
        nombre_anterior: null,
        nombre_nuevo: nombre_curso,
        grado_anterior: null,
        grado_nuevo: grado,
        docente_anterior: null,
        docente_nuevo: docente,
        estado_anterior: null,
        estado_nuevo: 1,
        operacion: 'INSERT',
        usuario: usuarioModificador.usuario
      })
        .then(() => resolve({ mensaje: "Curso registrado y auditado", id: idCurso }))
        .catch(reject);
    });
  });
};

const actualizarCurso = (id, datos,usuarioModificador) => {
   const { nombre_curso, grado, docente, estado } = datos;

  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_curso WHERE id_curso = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Curso no encontrado"));

      const sqlUpdate = `
        UPDATE tb_curso SET nombre_curso = ?, grado = ?, docente = ?, estado = ?
        WHERE id_curso = ?
      `;

      db.run(sqlUpdate, [nombre_curso, grado, docente, estado, id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaCurso({
          id_curso: id,
          nombre_anterior: anterior.nombre_curso,
          nombre_nuevo: nombre_curso,
          grado_anterior: anterior.grado,
          grado_nuevo: grado,
          docente_anterior: anterior.docente,
          docente_nuevo: docente,
          estado_anterior: anterior.estado,
          estado_nuevo: estado,
          operacion: 'UPDATE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Curso actualizado y auditado" }))
          .catch(reject);
      });
    });
  });
};

const eliminarCurso = (id,usuarioModificador) => {
  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_curso WHERE id_curso = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Curso no encontrado"));

      const sqlEliminar = `UPDATE tb_curso SET estado = 0 WHERE id_curso = ?`;

      db.run(sqlEliminar, [id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaCurso({
          id_curso: id,
          nombre_anterior: anterior.nombre_curso,
          nombre_nuevo: anterior.nombre_curso,
          grado_anterior: anterior.grado,
          grado_nuevo: anterior.grado,
          docente_anterior: anterior.docente,
          docente_nuevo: anterior.docente,
          estado_anterior: anterior.estado,
          estado_nuevo: 0,
          operacion: 'DELETE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Curso eliminado (lógicamente) y auditado" }))
          .catch(reject);
      });
    });
  });
};

module.exports = {
  obtenerCursos, 
  insertarCurso,
  actualizarCurso,
  eliminarCurso,
  obtenerTodosLosCursos
};