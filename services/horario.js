const pool = require("../database/db.js");

// Auditoría de horario
async function registrarAuditoriaHorario({
  id_horario,
  curso_anterior, curso_nuevo,
  seccion_anterior, seccion_nuevo,
  dia_anterior, dia_nuevo,
  hora_inicio_anterior, hora_inicio_nuevo,
  hora_fin_anterior, hora_fin_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_horario (
      id_horario,
      curso_anterior, curso_nuevo,
      seccion_anterior, seccion_nuevo,
      dia_anterior, dia_nuevo,
      hora_inicio_anterior, hora_inico_nuevo,
      hora_fin_anterior, hora_fin_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14, $15, $16
    )
  `;

  const values = [
    id_horario,
    curso_anterior, curso_nuevo,
    seccion_anterior, seccion_nuevo,
    dia_anterior, dia_nuevo,
    hora_inicio_anterior, hora_inicio_nuevo,
    hora_fin_anterior, hora_fin_nuevo,
    estado_anterior, estado_nuevo,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de horario registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de horario:", err);
    throw err;
  }
}

// Insertar horario
async function insertarHorario(datos, usuarioModificador) {
  const { curso, seccion, dia, hora_inicio, hora_fin } = datos;

  const sqlInsert = `
    INSERT INTO tb_horario (
      curso, seccion, dia, hora_inicio, hora_fin, estado
    ) VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id_horario
  `;

  try {
    const result = await pool.query(sqlInsert, [
      curso, seccion, dia, hora_inicio, hora_fin
    ]);
    const id_horario = result.rows[0].id_horario;

    await registrarAuditoriaHorario({
      id_horario,
      curso_anterior: null,
      curso_nuevo: curso,
      seccion_anterior: null,
      seccion_nuevo: seccion,
      dia_anterior: null,
      dia_nuevo: dia,
      hora_inicio_anterior: null,
      hora_inicio_nuevo: hora_inicio,
      hora_fin_anterior: null,
      hora_fin_nuevo: hora_fin,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Horario insertado y auditado", id: id_horario };
  } catch (err) {
    console.error("❌ Error al insertar horario:", err);
    throw err;
  }
}

// Obtener horarios activos
async function obtenerHorarios() {
  const sql = "SELECT * FROM tb_horario WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener horarios:", err);
    throw err;
  }
}

// Obtener todos los horarios
async function obtenerTodosLosHorarios() {
  const sql = "SELECT * FROM tb_horario";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los horarios:", err);
    throw err;
  }
}
// Obtener todos los horarios de auditoria
async function obtenerTodosLosHorariosAuditoria() {
  const sql = "SELECT * FROM tb_audit_horario";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los horarios auditoria:", err);
    throw err;
  }
}

// Actualizar horario
async function actualizarHorario(id, datos, usuarioModificador) {
  const { curso, seccion, dia, hora_inicio, hora_fin, estado } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_horario WHERE id_horario = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Horario no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_horario
      SET curso = $1, seccion = $2, dia = $3,
          hora_inicio = $4, hora_fin = $5, estado = $6
      WHERE id_horario = $7
    `;

    await pool.query(sqlUpdate, [
      curso, seccion, dia, hora_inicio, hora_fin, estado, id
    ]);

    await registrarAuditoriaHorario({
      id_horario: id,
      curso_anterior: anterior.curso,
      curso_nuevo: curso,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: seccion,
      dia_anterior: anterior.dia,
      dia_nuevo: dia,
      hora_inicio_anterior: anterior.hora_inicio,
      hora_inicio_nuevo: hora_inicio,
      hora_fin_anterior: anterior.hora_fin,
      hora_fin_nuevo: hora_fin,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Horario actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar horario:", err);
    throw err;
  }
}

// Eliminar horario (borrado lógico)
async function eliminarHorario(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_horario WHERE id_horario = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Horario no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_horario SET estado = false WHERE id_horario = $1",
      [id]
    );

    await registrarAuditoriaHorario({
      id_horario: id,
      curso_anterior: anterior.curso,
      curso_nuevo: anterior.curso,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: anterior.seccion,
      dia_anterior: anterior.dia,
      dia_nuevo: anterior.dia,
      hora_inicio_anterior: anterior.hora_inicio,
      hora_inicio_nuevo: anterior.hora_inicio,
      hora_fin_anterior: anterior.hora_fin,
      hora_fin_nuevo: anterior.hora_fin,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Horario eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar horario:", err);
    throw err;
  }
}

module.exports = {
  insertarHorario,
  obtenerHorarios,
  obtenerTodosLosHorarios,
  obtenerTodosLosHorariosAuditoria,
  actualizarHorario,
  eliminarHorario
};
