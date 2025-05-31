const pool = require("../database/db.js");

// Auditoría de asistencia
async function registrarAuditoriaAsistencia({
  id_asistencia,
  alumno_anterior, alumno_nuevo,
  fecha_anterior, fecha_nuevo,
  dia_anterior, dia_nuevo,
  asistio_anterior, asistio_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  const fecha = new Date().toISOString().split('T')[0];

  const sqlAudit = `
    INSERT INTO tb_audit_asistencia (
      id_asistencia,
      alumno_anterior, alumno_nuevo,
      fecha_anterior, fecha_nuevo,
      dia_anterior, dia_nuevo,
      asistio_anterior, asistio_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14
    )
  `;

  const values = [
    id_asistencia,
    alumno_anterior, alumno_nuevo,
    fecha_anterior, fecha_nuevo,
    dia_anterior, dia_nuevo,
    asistio_anterior, asistio_nuevo,
    estado_anterior, estado_nuevo,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de asistencia registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de asistencia:", err);
    throw err;
  }
}

// Insertar asistencia
async function insertarAsistencia(datos, usuarioModificador) {
  const { alumno, fecha, dia, asistio } = datos;

  const sqlInsert = `
    INSERT INTO tb_asistencia (
      alumno, fecha, dia, asistio, estado
    ) VALUES ($1, $2, $3, $4, true)
    RETURNING id_asistencia
  `;

  try {
    const result = await pool.query(sqlInsert, [
      alumno, fecha, dia, asistio
    ]);
    const id_asistencia = result.rows[0].id_asistencia;

    await registrarAuditoriaAsistencia({
      id_asistencia,
      alumno_anterior: null,
      alumno_nuevo: alumno,
      fecha_anterior: null,
      fecha_nuevo: fecha,
      dia_anterior: null,
      dia_nuevo: dia,
      asistio_anterior: null,
      asistio_nuevo: asistio,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Asistencia insertada y auditada", id: id_asistencia };
  } catch (err) {
    console.error("❌ Error al insertar asistencia:", err);
    throw err;
  }
}

// Obtener asistencias activas
async function obtenerAsistencias() {
  const sql = "SELECT * FROM tb_asistencia WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener asistencias:", err);
    throw err;
  }
}

// Obtener todas las asistencias
async function obtenerTodasLasAsistencias() {
  const sql = "SELECT * FROM tb_asistencia";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las asistencias:", err);
    throw err;
  }
}

// Actualizar asistencia
async function actualizarAsistencia(id, datos, usuarioModificador) {
  const { alumno, fecha, dia, asistio, estado } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_asistencia WHERE id_asistencia = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Asistencia no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_asistencia
      SET alumno = $1, fecha = $2, dia = $3,
          asistio = $4, estado = $5
      WHERE id_asistencia = $6
    `;

    await pool.query(sqlUpdate, [
      alumno, fecha, dia, asistio, estado, id
    ]);

    await registrarAuditoriaAsistencia({
      id_asistencia: id,
      alumno_anterior: anterior.alumno,
      alumno_nuevo: alumno,
      fecha_anterior: anterior.fecha,
      fecha_nuevo: fecha,
      dia_anterior: anterior.dia,
      dia_nuevo: dia,
      asistio_anterior: anterior.asistio,
      asistio_nuevo: asistio,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Asistencia actualizada y auditada" };
  } catch (err) {
    console.error("❌ Error al actualizar asistencia:", err);
    throw err;
  }
}

// Eliminar asistencia (borrado lógico)
async function eliminarAsistencia(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_asistencia WHERE id_asistencia = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Asistencia no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_asistencia SET estado = false WHERE id_asistencia = $1",
      [id]
    );

    await registrarAuditoriaAsistencia({
      id_asistencia: id,
      alumno_anterior: anterior.alumno,
      alumno_nuevo: anterior.alumno,
      fecha_anterior: anterior.fecha,
      fecha_nuevo: anterior.fecha,
      dia_anterior: anterior.dia,
      dia_nuevo: anterior.dia,
      asistio_anterior: anterior.asistio,
      asistio_nuevo: anterior.asistio,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Asistencia eliminada (estado = false) y auditada" };
  } catch (err) {
    console.error("❌ Error al eliminar asistencia:", err);
    throw err;
  }
}

module.exports = {
  insertarAsistencia,
  obtenerAsistencias,
  obtenerTodasLasAsistencias,
  actualizarAsistencia,
  eliminarAsistencia
};
