const db = require("../database/dbInstance.js");

function registrarAuditoriaPeriodo({
  id_periodo,
  anio_anterior, anio_nuevo,
  descripcion_anterior, descripcion_nueva,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sqlAudit = `
      INSERT INTO tb_audit_periodo (
        id_periodo, anio_anterior, anio_nuevo,
        descripcion_anterior, descripcion_nueva,
        estado_anterior, estado_nuevo,
        operacion, fecha_modificacion, usuario_modificador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlAudit, [
      id_periodo,
      anio_anterior, anio_nuevo,
      descripcion_anterior, descripcion_nueva,
      estado_anterior, estado_nuevo,
      operacion, fecha, usuario
    ], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

const insertarPeriodo = (datos, usuarioModificador) => {
  const { anio, descripcion } = datos;

  return new Promise((resolve, reject) => {
    const sqlInsert = `
      INSERT INTO tb_periodo_escolar (anio, descripcion, estado)
      VALUES (?, ?, 1)
    `;

    db.run(sqlInsert, [anio, descripcion], function (err) {
      if (err) return reject(err);

      const id_periodo = this.lastID;

      registrarAuditoriaPeriodo({
        id_periodo,
        anio_anterior: null,
        anio_nuevo: anio,
        descripcion_anterior: null,
        descripcion_nueva: descripcion,
        estado_anterior: null,
        estado_nuevo: 1,
        operacion: 'INSERT',
        usuario: usuarioModificador.usuario
      })
        .then(() => resolve({ mensaje: "Periodo insertado y auditado", id: id_periodo }))
        .catch(reject);
    });
  });
};

const obtenerPeriodos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_periodo_escolar WHERE estado = 1 ORDER BY anio DESC", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const obtenerTodosLosPeriodos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_periodo_escolar ORDER BY anio DESC", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const actualizarPeriodo = (id, datos, usuarioModificador) => {
  const { anio, descripcion, estado } = datos;

    return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_periodo_escolar WHERE id_periodo = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior || Object.keys(anterior).length === 0) return reject(new Error("Periodo no encontrado"));

      const sqlUpdate = `
        UPDATE tb_periodo_escolar
        SET anio = ?, descripcion = ?, estado = ?
        WHERE id_periodo = ?
      `;

      db.run(sqlUpdate, [anio, descripcion, estado, id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaPeriodo({
          id_periodo: id,
          anio_anterior: anterior.anio,
          anio_nuevo: anio,
          descripcion_anterior: anterior.descripcion,
          descripcion_nueva: descripcion,
          estado_anterior: anterior.estado,
          estado_nuevo: estado,
          operacion: 'UPDATE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Periodo actualizado y auditado" }))
          .catch(reject);
      });
    });
  });
};

const eliminarPeriodo = (id, usuarioModificador) => {
  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_periodo_escolar WHERE id_periodo = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior || Object.keys(anterior).length === 0) return reject(new Error("Periodo no encontrado"));

      const sql = `UPDATE tb_periodo_escolar SET estado = 0 WHERE id_periodo = ?`;

      db.run(sql, [id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaPeriodo({
          id_periodo: id,
          anio_anterior: anterior.anio,
          anio_nuevo: anterior.anio,
          descripcion_anterior: anterior.descripcion,
          descripcion_nueva: anterior.descripcion,
          estado_anterior: anterior.estado,
          estado_nuevo: 0,
          operacion: 'DELETE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Periodo eliminado (estado = 0) y auditado" }))
          .catch(reject);
      });
    });
  });
};
module.exports = {
  insertarPeriodo,
  obtenerPeriodos,obtenerTodosLosPeriodos,
  actualizarPeriodo,
  eliminarPeriodo
};