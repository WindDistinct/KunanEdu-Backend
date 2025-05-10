const db = require("../database/dbInstance.js");

const obtenerEmpleados = () => {
  const sql = "SELECT * FROM tb_empleado WHERE estado = 1";
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const insertarEmpleado = (datos) => {
    const {
    nombre_empleado,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    especialidad,
    dni,
    telefono,
    observacion,
    cargo
  } = datos;

  const sql = `
    INSERT INTO tb_empleado (
      nombre_empleado, apellido_paterno, apellido_materno, fecha_nacimiento,
      especialidad, dni, telefono, observacion, cargo, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

  return new Promise((resolve, reject) => {
    db.run(sql, [
      nombre_empleado, apellido_paterno, apellido_materno,
      fecha_nacimiento, especialidad, dni, telefono,
      observacion, cargo
    ], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};


const actualizarEmpleado = (id, datos) => {
  const {
    nombre_empleado,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    especialidad,
    dni,
    telefono,
    observacion,
    cargo,
    estado
  } = datos;

  const sql = `
    UPDATE tb_empleado SET
      nombre_empleado = ?, apellido_paterno = ?, apellido_materno = ?,
      fecha_nacimiento = ?, especialidad = ?, dni = ?, telefono = ?,
      observacion = ?, cargo = ?, estado = ?
    WHERE id_empleado = ?`;

  return new Promise((resolve, reject) => {
    db.run(sql, [
      nombre_empleado, apellido_paterno, apellido_materno,
      fecha_nacimiento, especialidad, dni, telefono,
      observacion, cargo, estado, id
    ], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const eliminarEmpleado = (id) => {
  const sql = `UPDATE tb_empleado SET estado = 0 WHERE id_empleado = ?`;
  return new Promise((resolve, reject) => {
    db.run(sql, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  obtenerEmpleados,
  insertarEmpleado,
  actualizarEmpleado,
 eliminarEmpleado
};