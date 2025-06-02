const pool = require("../database/db.js");

// Auditoría de empleado
async function registrarAuditoriaEmpleado({
  id_emp,
  nombre_emp_anterior, nombre_emp_nuevo,
  ape_pat_emp_anterior, ape_pat_emp_nuevo,
  ape_mat_emp_anterior, ape_mat_emp_nuevo,
  fec_nac_anterior, fec_nac_nuevo,
  especialidad_anterior, especialidad_nuevo,
  dni_anterior, dni_nuevo,
  telefono_anterior, telefono_nuevo,
  observacion_anterior, observacion_nuevo,
  cargo_anterior, cargo_nuevo,
  usuario_anterior, usuario_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  const fecha = new Date().toISOString().split('T')[0];

  const sqlAudit = `
    INSERT INTO tb_audit_empleado (
      id_emp, nombre_emp_anterior, nombre_emp_nuevo,
      ape_pat_emp_anterior, ape_pat_emp_nuevo,
      ape_mat_emp_anterior, ape_mat_emp_nuevo,
      fec_nac_anterior, fec_nac_nuevo,
      especialidad_anterior, especialidad_nuevo,
      dni_anterior, dni_nuevo,
      telefono_anterior, telefono_nuevo,
      observacion_anterior, observacion_nuevo,
      cargo_anterior, cargo_nuevo,
      usuario_anterior, usuario_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23, $24, $25, $26
    )
  `;

  const values = [
    id_emp,
    nombre_emp_anterior, nombre_emp_nuevo,
    ape_pat_emp_anterior, ape_pat_emp_nuevo,
    ape_mat_emp_anterior, ape_mat_emp_nuevo,
    fec_nac_anterior, fec_nac_nuevo,
    especialidad_anterior, especialidad_nuevo,
    dni_anterior, dni_nuevo,
    telefono_anterior, telefono_nuevo,
    observacion_anterior, observacion_nuevo,
    cargo_anterior, cargo_nuevo,
    usuario_anterior, usuario_nuevo,
    estado_anterior, estado_nuevo,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de empleado registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de empleado:", err);
    throw err;
  }
}

// Insertar empleado
async function insertarEmpleado(datos, usuarioModificador) {
  const {
    nombre_emp, ape_pat_emp, ape_mat_emp,
    fec_nac, especialidad, dni, telefono,
    observacion, cargo, usuario
  } = datos;

  const sqlInsert = `
    INSERT INTO tb_empleado (
      nombre_emp, ape_pat_emp, ape_mat_emp,
      fec_nac, especialidad, dni, telefono,
      observacion, cargo, usuario, estado
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, true
    )
    RETURNING id_emp
  `;

  try {
    const result = await pool.query(sqlInsert, [
      nombre_emp, ape_pat_emp, ape_mat_emp,
      fec_nac, especialidad, dni, telefono,
      observacion, cargo, usuario
    ]);
    const id_emp = result.rows[0].id_emp;

    await registrarAuditoriaEmpleado({
      id_emp,
      nombre_emp_anterior: null,
      nombre_emp_nuevo: nombre_emp,
      ape_pat_emp_anterior: null,
      ape_pat_emp_nuevo: ape_pat_emp,
      ape_mat_emp_anterior: null,
      ape_mat_emp_nuevo: ape_mat_emp,
      fec_nac_anterior: null,
      fec_nac_nuevo: fec_nac,
      especialidad_anterior: null,
      especialidad_nuevo: especialidad,
      dni_anterior: null,
      dni_nuevo: dni,
      telefono_anterior: null,
      telefono_nuevo: telefono,
      observacion_anterior: null,
      observacion_nuevo: observacion,
      cargo_anterior: null,
      cargo_nuevo: cargo,
      usuario_anterior: null,
      usuario_nuevo: usuario,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Empleado insertado y auditado", id: id_emp };
  } catch (err) {
    console.error("❌ Error al insertar empleado:", err);
    throw err;
  }
}

// Obtener empleados activos
async function obtenerEmpleados() {
  const sql = "SELECT * FROM tb_empleado WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener empleados:", err);
    throw err;
  }
}

// Obtener todos los empleados
async function obtenerTodosLosEmpleados() {
  const sql = "SELECT * FROM tb_empleado";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los empleados:", err);
    throw err;
  }
}

// Actualizar empleado
async function actualizarEmpleado(id, datos, usuarioModificador) {
  const {
    nombre_emp, ape_pat_emp, ape_mat_emp,
    fec_nac, especialidad, dni, telefono,
    observacion, cargo, usuario, estado
  } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_empleado WHERE id_emp = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Empleado no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_empleado
      SET nombre_emp = $1, ape_pat_emp = $2, ape_mat_emp = $3,
          fec_nac = $4, especialidad = $5, dni = $6, telefono = $7,
          observacion = $8, cargo = $9, usuario = $10, estado = $11
      WHERE id_emp = $12
    `;

    await pool.query(sqlUpdate, [
      nombre_emp, ape_pat_emp, ape_mat_emp,
      fec_nac, especialidad, dni, telefono,
      observacion, cargo, usuario, estado, id
    ]);

    await registrarAuditoriaEmpleado({
      id_emp: id,
      nombre_emp_anterior: anterior.nombre_emp,
      nombre_emp_nuevo: nombre_emp,
      ape_pat_emp_anterior: anterior.ape_pat_emp,
      ape_pat_emp_nuevo: ape_pat_emp,
      ape_mat_emp_anterior: anterior.ape_mat_emp,
      ape_mat_emp_nuevo: ape_mat_emp,
      fec_nac_anterior: anterior.fec_nac,
      fec_nac_nuevo: fec_nac,
      especialidad_anterior: anterior.especialidad,
      especialidad_nuevo: especialidad,
      dni_anterior: anterior.dni,
      dni_nuevo: dni,
      telefono_anterior: anterior.telefono,
      telefono_nuevo: telefono,
      observacion_anterior: anterior.observacion,
      observacion_nuevo: observacion,
      cargo_anterior: anterior.cargo,
      cargo_nuevo: cargo,
      usuario_anterior: anterior.usuario,
      usuario_nuevo: usuario,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Empleado actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar empleado:", err);
    throw err;
  }
}

// Eliminar empleado (borrado lógico)
async function eliminarEmpleado(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_empleado WHERE id_emp = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Empleado no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_empleado SET estado = false WHERE id_emp = $1",
      [id]
    );

    await registrarAuditoriaEmpleado({
      id_emp: id,
      nombre_emp_anterior: anterior.nombre_emp,
      nombre_emp_nuevo: anterior.nombre_emp,
      ape_pat_emp_anterior: anterior.ape_pat_emp,
      ape_pat_emp_nuevo: anterior.ape_pat_emp,
      ape_mat_emp_anterior: anterior.ape_mat_emp,
      ape_mat_emp_nuevo: anterior.ape_mat_emp,
      fec_nac_anterior: anterior.fec_nac,
      fec_nac_nuevo: anterior.fec_nac,
      especialidad_anterior: anterior.especialidad,
      especialidad_nuevo: anterior.especialidad,
      dni_anterior: anterior.dni,
      dni_nuevo: anterior.dni,
      telefono_anterior: anterior.telefono,
      telefono_nuevo: anterior.telefono,
      observacion_anterior: anterior.observacion,
      observacion_nuevo: anterior.observacion,
      cargo_anterior: anterior.cargo,
      cargo_nuevo: anterior.cargo,
      usuario_anterior: anterior.usuario,
      usuario_nuevo: anterior.usuario,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Empleado eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar empleado:", err);
    throw err;
  }
}

module.exports = {
  insertarEmpleado,
  obtenerEmpleados,
  obtenerTodosLosEmpleados,
  actualizarEmpleado,
  eliminarEmpleado
};
