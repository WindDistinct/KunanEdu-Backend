const pool = require("../database/db.js");

// Auditoría de empleado
async function registrarAuditoriaEmpleado({
  id_emp,
  nombre_emp_anterior, nombre_emp_nuevo,
  ape_pat_emp_anterior, ape_pat_emp_nuevo,
  ape_mat_emp_anterior, ape_mat_emp_nuevo,
  fec_nac_anterior, fec_nac_nuevo,
  especialidad_anterior, especialidad_nuevo,
  numero_documento_anterior, numero_documento_nuevo,
  telefono_anterior, telefono_nuevo,
  observacion,
  cargo_anterior, cargo_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_empleado (
      id_emp, nombre_emp_anterior, nombre_emp_nuevo,
      ape_pat_emp_anterior, ape_pat_emp_nuevo,
      ape_mat_emp_anterior, ape_mat_emp_nuevo,
      fec_nac_anterior, fec_nac_nuevo,
      especialidad_anterior, especialidad_nuevo,
      numero_documento_anterior, numero_documento_nuevo,
      telefono_anterior, telefono_nuevo,
      observacion,
      cargo_anterior, cargo_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23
    )
  `;

  const values = [
    id_emp,
    nombre_emp_anterior, nombre_emp_nuevo,
    ape_pat_emp_anterior, ape_pat_emp_nuevo,
    ape_mat_emp_anterior, ape_mat_emp_nuevo,
    fec_nac_anterior, fec_nac_nuevo,
    especialidad_anterior, especialidad_nuevo,
    numero_documento_anterior, numero_documento_nuevo,
    telefono_anterior, telefono_nuevo,
    observacion,
    cargo_anterior, cargo_nuevo,
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
    fec_nac, especialidad, tipo_documento,numero_documento, telefono,
    observacion, cargo
  } = datos;

    const existeEmpleado = await pool.query(
    'SELECT id_emp FROM tb_empleado WHERE numero_documento = $1',
    [numero_documento]
    );
    if (existeEmpleado.rowCount > 0) {
      throw new Error("El empleado con este numero documento ya está registrad");
    }
    

  const sqlInsert = `
    INSERT INTO tb_empleado (
      nombre_emp, ape_pat_emp, ape_mat_emp,
      fec_nac, especialidad, tipo_documento,numero_documento, telefono,
      observacion, cargo, estado
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9,$10, true
    )
    RETURNING id_emp
  `;

  try {
    const result = await pool.query(sqlInsert, [
      nombre_emp, ape_pat_emp, ape_mat_emp,
      fec_nac, especialidad, tipo_documento,numero_documento, telefono,
      observacion, cargo
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
      numero_documento_anterior: null,
      numero_documento_nuevo: numero_documento,
      telefono_anterior: null,
      telefono_nuevo: telefono,
      observacion:'Nuevo registro',
      cargo_anterior: null,
      cargo_nuevo: cargo,
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
// Obtener todos los profesores
async function obtenerTodosLosProfesores() {
  const sql = `SELECT 
  id_emp,
  nombre_emp || ' ' || ape_pat_emp || ' ' || ape_mat_emp AS nombre_completo,
  especialidad
  FROM tb_empleado
  WHERE cargo IN ('docente', 'tutor') AND estado = true`;
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los empleados:", err);
    throw err;
  }
}
async function obtenerCursosPorDocenteYPeriodo(idDocente, periodo) {
  const sql = `
    SELECT 
      e.cargo,
      e.id_emp || ' - ' || e.nombre_emp || ' ' || e.ape_pat_emp AS id_nombreEmpleado,
      u.username,
      s.id_curso_seccion,
      c.id_curso,
      c.nombre_curso,
      a.numero_aula,
      h.nombre AS seccion,
      g.anio || ' ' || g.nivel AS grado,
      h.periodo
    FROM tb_curso_seccion s
    JOIN tb_curso c ON s.curso = c.id_curso
    JOIN tb_empleado e ON s.docente = e.id_emp
    JOIN tb_seccion h ON s.seccion = h.id_seccion
    JOIN tb_grado g ON h.grado = g.id_grado
    JOIN tb_aula a ON h.aula = a.id_aula
    JOIN tb_usuario u ON e.id_emp = u.empleado
    WHERE e.id_emp = $1 AND h.periodo = $2 AND s.estado = true
  `;

  try {
    const result = await pool.query(sql, [idDocente, periodo]);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener cursos por docente y periodo:", err);
    throw err;
  }
}
async function obtenerTodosLosEmmpleadosUsuarios() {
  const sql = `SELECT 
  id_emp,
  nombre_emp || ' ' || ape_pat_emp || ' ' || ape_mat_emp AS nombre_completo,
  especialidad
  FROM tb_empleado
  WHERE cargo IN ('docente', 'tutor','consultor') AND estado = true`;
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los empleados:", err);
    throw err;
  }
}
// Obtener todos los empleados de auditoria
async function obtenerTodosLosEmpleadosAuditoria() {
  const sql = "SELECT * FROM tb_audit_empleado";
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
  let {
    nombre_emp, ape_pat_emp, ape_mat_emp,
    fec_nac, especialidad, tipo_documento, numero_documento,telefono,
    obs, cargo, estado
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
          fec_nac = $4, especialidad = $5, tipo_documento = $6, numero_documento= $7,telefono = $8,
          cargo = $9, estado = $10
      WHERE id_emp = $11
    `;

    await pool.query(sqlUpdate, [
      nombre_emp, ape_pat_emp, ape_mat_emp,
      fec_nac, especialidad, tipo_documento,numero_documento, telefono,
      cargo, estado, id
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
      numero_documento_anterior: anterior.numero_documento,
      numero_documento_nuevo: numero_documento,
      telefono_anterior: anterior.telefono,
      telefono_nuevo: telefono,
      observacion: obs,
      cargo_anterior: anterior.cargo,
      cargo_nuevo: cargo,
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
      numero_documento_anterior: anterior.numero_documento,
      numero_documento_nuevo: anterior.numero_documento,
      telefono_anterior: anterior.telefono,
      telefono_nuevo: anterior.telefono,
      observacion:'Registro eliminado',
      cargo_anterior: anterior.cargo,
      cargo_nuevo: anterior.cargo,
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
  obtenerTodosLosEmpleadosAuditoria,
  obtenerTodosLosEmpleados,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerTodosLosProfesores,
  obtenerCursosPorDocenteYPeriodo,
  obtenerTodosLosEmmpleadosUsuarios
};
