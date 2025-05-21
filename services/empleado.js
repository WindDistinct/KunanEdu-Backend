const db = require("../database/dbInstance.js");


function registrarAuditoriaEmpleado({
  id_empleado,
  nombre_anterior, nombre_nuevo,
  paterno_anterior, paterno_nuevo,
  materno_anterior, materno_nuevo,
  fecha_nac_anterior, fecha_nac_nueva,
  especialidad_anterior, especialidad_nueva,
  dni_anterior, dni_nuevo,
  telefono_anterior, telefono_nuevo,
  observacion_anterior, observacion_nueva,
  cargo_anterior, cargo_nuevo,
  estado_anterior, estado_nuevo,
  operacion,
  usuario_modificador
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();

    const sql = `
      INSERT INTO tb_audit_empleado (
        id_empleado,
        nombre_anterior, nombre_nuevo,
        paterno_anterior, paterno_nuevo,
        materno_anterior, materno_nuevo,
        fecha_nac_anterior, fecha_nac_nueva,
        especialidad_anterior, especialidad_nueva,
        dni_anterior, dni_nuevo,
        telefono_anterior, telefono_nuevo,
        observacion_anterior, observacion_nueva,
        cargo_anterior, cargo_nuevo,
        estado_anterior, estado_nuevo,
        operacion,
        fecha_modificacion,
        usuario_modificador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      id_empleado,
      nombre_anterior, nombre_nuevo,
      paterno_anterior, paterno_nuevo,
      materno_anterior, materno_nuevo,
      fecha_nac_anterior, fecha_nac_nueva,
      especialidad_anterior, especialidad_nueva,
      dni_anterior, dni_nuevo,
      telefono_anterior, telefono_nuevo,
      observacion_anterior, observacion_nueva,
      cargo_anterior, cargo_nuevo,
      estado_anterior, estado_nuevo,
      operacion,
      fecha,
      usuario_modificador
    ], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

const obtenerEmpleados = () => {
  const sql = "SELECT * FROM tb_empleado WHERE estado = 1";
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodosLosEmpleados = () => {
  const sql = "SELECT * FROM tb_empleado";
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const insertarEmpleado = (datos,usuarioModificador) => {
  const {
    nombre_empleado, apellido_paterno, apellido_materno,
    fecha_nacimiento, especialidad, dni, telefono,
    observacion, cargo
  } = datos;

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_empleado (
        nombre_empleado, apellido_paterno, apellido_materno,
        fecha_nacimiento, especialidad, dni, telefono,
        observacion, cargo, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(sql, [
      nombre_empleado, apellido_paterno, apellido_materno,
      fecha_nacimiento, especialidad, dni, telefono,
      observacion, cargo
    ], function (err) {
      if (err) return reject(err);

      registrarAuditoriaEmpleado({
        id_empleado: this.lastID,
        nombre_anterior: null, nombre_nuevo: nombre_empleado,
        paterno_anterior: null, paterno_nuevo: apellido_paterno,
        materno_anterior: null, materno_nuevo: apellido_materno,
        fecha_nac_anterior: null, fecha_nac_nueva: fecha_nacimiento,
        especialidad_anterior: null, especialidad_nueva: especialidad,
        dni_anterior: null, dni_nuevo: dni,
        telefono_anterior: null, telefono_nuevo: telefono,
        observacion_anterior: null, observacion_nueva: observacion,
        cargo_anterior: null, cargo_nuevo: cargo,
        estado_anterior: null, estado_nuevo: 1,
        operacion: 'INSERT',
        usuario_modificador: usuarioModificador.usuario
      })
        .then(() => resolve({ mensaje: "Empleado insertado y auditado" }))
        .catch(reject);
    });
  });
};


const actualizarEmpleado = (id, datos,usuarioModificador) => {
 const {
    nombre_empleado, apellido_paterno, apellido_materno,
    fecha_nacimiento, especialidad, dni, telefono,
    observacion, cargo, estado
  } = datos;

  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tb_empleado WHERE id_empleado = ?`, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Empleado no encontrado"));

      const sql = `
        UPDATE tb_empleado SET
          nombre_empleado = ?, apellido_paterno = ?, apellido_materno = ?,
          fecha_nacimiento = ?, especialidad = ?, dni = ?, telefono = ?,
          observacion = ?, cargo = ?, estado = ?
        WHERE id_empleado = ?
      `;

      db.run(sql, [
        nombre_empleado, apellido_paterno, apellido_materno,
        fecha_nacimiento, especialidad, dni, telefono,
        observacion, cargo, estado, id
      ], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaEmpleado({
          id_empleado: id,
          nombre_anterior: anterior.nombre_empleado, nombre_nuevo: nombre_empleado,
          paterno_anterior: anterior.apellido_paterno, paterno_nuevo: apellido_paterno,
          materno_anterior: anterior.apellido_materno, materno_nuevo: apellido_materno,
          fecha_nac_anterior: anterior.fecha_nacimiento, fecha_nac_nueva: fecha_nacimiento,
          especialidad_anterior: anterior.especialidad, especialidad_nueva: especialidad,
          dni_anterior: anterior.dni, dni_nuevo: dni,
          telefono_anterior: anterior.telefono, telefono_nuevo: telefono,
          observacion_anterior: anterior.observacion, observacion_nueva: observacion,
          cargo_anterior: anterior.cargo, cargo_nuevo: cargo,
          estado_anterior: anterior.estado, estado_nuevo: estado,
          operacion: 'UPDATE',
          usuario_modificador: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Empleado actualizado y auditado" }))
          .catch(reject);
      });
    });
  });
};

const eliminarEmpleado = (id,usuarioModificador) => {
 return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tb_empleado WHERE id_empleado = ?`, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Empleado no encontrado"));

      db.run(`UPDATE tb_empleado SET estado = 0 WHERE id_empleado = ?`, [id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaEmpleado({
          id_empleado: id,
          nombre_anterior: anterior.nombre_empleado, nombre_nuevo: anterior.nombre_empleado,
          paterno_anterior: anterior.apellido_paterno, paterno_nuevo: anterior.apellido_paterno,
          materno_anterior: anterior.apellido_materno, materno_nuevo: anterior.apellido_materno,
          fecha_nac_anterior: anterior.fecha_nacimiento, fecha_nac_nueva: anterior.fecha_nacimiento,
          especialidad_anterior: anterior.especialidad, especialidad_nueva: anterior.especialidad,
          dni_anterior: anterior.dni, dni_nuevo: anterior.dni,
          telefono_anterior: anterior.telefono, telefono_nuevo: anterior.telefono,
          observacion_anterior: anterior.observacion, observacion_nueva: anterior.observacion,
          cargo_anterior: anterior.cargo, cargo_nuevo: anterior.cargo,
          estado_anterior: anterior.estado, estado_nuevo: 0,
          operacion: 'DELETE',
          usuario_modificador: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Empleado eliminado y auditado correctamente" }))
          .catch(reject);
      });
    });
  });
};

module.exports = {
  obtenerEmpleados,
  insertarEmpleado,
  actualizarEmpleado,
 eliminarEmpleado,
 obtenerTodosLosEmpleados
};