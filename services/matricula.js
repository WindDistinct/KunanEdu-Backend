const pool = require("../database/db.js");

// Función para registrar auditoría de matrícula
async function registrarAuditoriaMatricula({
  id_matricula,
  fecha_matricula_anterior, fecha_matricula_nuevo,
  observacion_anterior, observacion_nuevo,
  alumno_anterior, alumno_nuevo,
  seccion_anterior, seccion_nuevo,
  condicion_anterior, condicion_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
 const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_matricula (
      id_matricula,
      fecha_matricula_anterior, fecha_matricula_nuevo,
      observacion_anterior, observacion_nuevo,
      alumno_anterior, alumno_nuevo,
      seccion_anterior, seccion_nuevo,
      condicion_anterior, condicion_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15, $16
    )
  `;

  const values = [
    id_matricula, 
    fecha_matricula_anterior, fecha_matricula_nuevo,
    observacion_anterior, observacion_nuevo,
    alumno_anterior, alumno_nuevo,
    seccion_anterior, seccion_nuevo,
    condicion_anterior, condicion_nuevo,
    estado_anterior, estado_nuevo,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de matrícula registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de matrícula:", err);
    throw err;
  }
}

// Insertar matrícula
async function insertarMatricula(datos, usuarioModificador) {
  const {
     fecha_matricula, observacion,
    alumno, seccion, condicion
  } = datos;

  const sqlInsert = `
    INSERT INTO tb_matricula (
       fecha_matricula, observacion,
      alumno, seccion, condicion, estado
    ) VALUES (
      $1, $2, $3, $4, $5, true
    )
    RETURNING id_matricula
  `;

  try {
    const result = await pool.query(sqlInsert, [
      fecha_matricula, observacion,
      alumno, seccion, condicion
    ]);
    const id_matricula = result.rows[0].id_matricula;

    await registrarAuditoriaMatricula({
      id_matricula,
      fecha_matricula_anterior: null,
      fecha_matricula_nuevo: fecha_matricula,
      observacion_anterior: null,
      observacion_nuevo: observacion,
      alumno_anterior: null,
      alumno_nuevo: alumno,
      seccion_anterior: null,
      seccion_nuevo: seccion,
      condicion_anterior: null,
      condicion_nuevo: condicion,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Matrícula insertada y auditada", id: id_matricula };
  } catch (err) {
    console.error("❌ Error al insertar matrícula:", err);
    throw err;
  }
}

// Obtener matrículas activas
async function obtenerMatriculas() {
  const sql = "SELECT * FROM tb_matricula WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener matrículas activas:", err);
    throw err;
  }
}

// Obtener todas las matrículas
async function obtenerTodasLasMatriculas() {
  const sql = "SELECT * FROM tb_matricula";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las matrículas:", err);
    throw err;
  }
}
// Obtener todas las matrículas de auditoria
async function obtenerTodasLasMatriculasAuditoria() {
  const sql = "SELECT * FROM tb_audit_matricula";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las matrículas de auditoria:", err);
    throw err;
  }
}

// Actualizar matrícula
async function actualizarMatricula(id, datos, usuarioModificador) {
  const {
     fecha_matricula, observacion,
    alumno, seccion, condicion, estado
  } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_matricula WHERE id_matricula = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Matrícula no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_matricula
      SET fecha_matricula = $1, observacion = $2,
          alumno = $3, seccion = $4, condicion = $5, estado = $6
      WHERE id_matricula = $7
    `;

    await pool.query(sqlUpdate, [
       fecha_matricula, observacion,
      alumno, seccion, condicion, estado, id
    ]);

    await registrarAuditoriaMatricula({
      id_matricula: id, 
      fecha_matricula_anterior: anterior.fecha_matricula,
      fecha_matricula_nuevo: fecha_matricula,
      observacion_anterior: anterior.observacion,
      observacion_nuevo: observacion,
      alumno_anterior: anterior.alumno,
      alumno_nuevo: alumno,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: seccion,
      condicion_anterior: anterior.condicion,
      condicion_nuevo: condicion,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Matrícula actualizada y auditada" };
  } catch (err) {
    console.error("❌ Error al actualizar matrícula:", err);
    throw err;
  }
}

// Eliminar matrícula (borrado lógico)
async function eliminarMatricula(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_matricula WHERE id_matricula = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Matrícula no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_matricula SET estado = false WHERE id_matricula = $1",
      [id]
    );

    await registrarAuditoriaMatricula({
      id_matricula: id, 
      fecha_matricula_anterior: anterior.fecha_matricula,
      fecha_matricula_nuevo: anterior.fecha_matricula,
      observacion_anterior: anterior.observacion,
      observacion_nuevo: anterior.observacion,
      alumno_anterior: anterior.alumno,
      alumno_nuevo: anterior.alumno,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: anterior.seccion,
      condicion_anterior: anterior.condicion,
      condicion_nuevo: anterior.condicion,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Matrícula eliminada (estado = false) y auditada" };
  } catch (err) {
    console.error("❌ Error al eliminar matrícula:", err);
    throw err;
  }
}

module.exports = {
  insertarMatricula,
  obtenerMatriculas,
  obtenerTodasLasMatriculasAuditoria,
  obtenerTodasLasMatriculas,
  actualizarMatricula,
  eliminarMatricula
};
