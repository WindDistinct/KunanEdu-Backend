const db = require("../database/dbInstance.js");

function registrarAuditoriaCargo({
  id_cargo,
  nombre_anterior, nombre_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sqlAudit = `
      INSERT INTO tb_audit_cargo (
        id_cargo, nombre_anterior, nombre_nuevo,
        estado_anterior, estado_nuevo,
        operacion, fecha_modificacion, usuario_modificador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlAudit, [
      id_cargo,
      nombre_anterior, nombre_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha, usuario
    ], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

const obtenerCargos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_cargo WHERE estado = 1", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const obtenerTodosLosCargos = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_cargo", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const insertarCargo = (datos,usuarioModificador) => {
  const { nombre_cargo } = datos;

 return new Promise((resolve, reject) => {
    const sqlInsert = `INSERT INTO tb_cargo (nombre_cargo, estado) VALUES (?, 1)`;

    db.run(sqlInsert, [nombre_cargo], function (err) {
      if (err) return reject(err);

      const id_cargo = this.lastID;

      registrarAuditoriaCargo({
        id_cargo,
        nombre_anterior: null,
        nombre_nuevo: nombre_cargo,
        estado_anterior: null,
        estado_nuevo: 1,
        operacion: 'INSERT',
        usuario: usuarioModificador.usuario
      })
        .then(() => resolve({ mensaje: "Cargo insertado y auditado", id: id_cargo }))
        .catch(reject);
    });
  });
};

const actualizarCargo = (id, datos,usuarioModificador) => {
  const { nombre_cargo, estado } = datos;

   return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_cargo WHERE id_cargo = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Cargo no encontrado"));

      const sqlUpdate = `UPDATE tb_cargo SET nombre_cargo = ?, estado = ? WHERE id_cargo = ?`;

      db.run(sqlUpdate, [nombre_cargo, estado, id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaCargo({
          id_cargo: id,
          nombre_anterior: anterior.nombre_cargo,
          nombre_nuevo: nombre_cargo,
          estado_anterior: anterior.estado,
          estado_nuevo: estado,
          operacion: 'UPDATE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Cargo actualizado y auditado" }))
          .catch(reject);
      });
    });
  });
};

const eliminarCargo = (id,usuarioModificador) => {
  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_cargo WHERE id_cargo = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Cargo no encontrado"));

      const sql = `UPDATE tb_cargo SET estado = 0 WHERE id_cargo = ?`;

      db.run(sql, [id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaCargo({
          id_cargo: id,
          nombre_anterior: anterior.nombre_cargo,
          nombre_nuevo: anterior.nombre_cargo,
          estado_anterior: anterior.estado,
          estado_nuevo: 0,
          operacion: 'DELETE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Cargo eliminado (estado = 0) y auditado" }))
          .catch(reject);
      });
    });
  });
};

module.exports = { obtenerTodosLosCargos,obtenerCargos, insertarCargo, actualizarCargo, eliminarCargo };