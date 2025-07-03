const pool = require("../database/db.js");

// Auditoría de asistencia
async function registrarAuditoriaAsistencia({
  id_asistencia,
  id_matricula,
  fecha,
  dia,
  asistio_anterior, asistio_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_asistencia (
      id_asistencia,
      id_matricula,
      fecha,
      dia,
      asistio_anterior, asistio_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11
    )
  `;

  const values = [
    id_asistencia,
    id_matricula,
    fecha,
    dia,
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
  const { alumno, fecha, dia, asistio,cursoSeccion } = datos;

  const sqlInsert = `
    INSERT INTO tb_asistencia (
      alumno, fecha, dia, asistio,cursoSeccion, estado
    ) VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id_asistencia
  `;

  try {
    const result = await pool.query(sqlInsert, [
      alumno, fecha, dia, asistio,cursoSeccion
    ]);
    const id_asistencia = result.rows[0].id_asistencia;

    await registrarAuditoriaAsistencia({
      id_asistencia,
      id_matricula: alumno, 
      fecha: fecha,  
      dia: dia,
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

async function insertarMultiplesAsistencias(listaDatos, usuarioModificador) {
  const resultados = [];
  const sqlInsert = `
      INSERT INTO tb_asistencia (
        id_matricula, fecha, dia, asistio, id_curso_seccion, estado
      ) VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id_asistencia
    `;
  for (const datos of listaDatos) {
    const { id_matricula, fecha, dia, asistio, id_curso_seccion } = datos;

      const result = await pool.query(sqlInsert, [
        id_matricula,
        fecha,
        dia,
        asistio,
        id_curso_seccion,
      ]);

      const id_asistencia = result.rows[0].id_asistencia;

      /*
 await registrarAuditoriaAsistencia({
        id_asistencia,
        id_matricula: id_matricula, 
        fecha: fecha,  
        dia: dia,
        asistio_anterior: null,
        asistio_nuevo: asistio,
        estado_anterior: null,
        estado_nuevo: true,
        operacion: 'INSERT',
        usuario: usuarioModificador.usuario,
      });
      */
     

      resultados.push({ id: id_asistencia, mensaje: "Insertado con éxito" });
  }

  return resultados;
}
async function obtenerPorFechaYCurso(cursoSeccion, fecha) {
  const sql = `
    SELECT a.id_matricula, a.asistio
    FROM tb_asistencia a
    JOIN tb_matricula m ON a.id_matricula = m.id_matricula
	JOIN tb_curso_seccion cs ON m.seccion=cs.seccion
    WHERE cs.id_curso_seccion = $1 AND a.fecha = $2 AND a.estado = true
  `;

  try {
    const result = await pool.query(sql, [cursoSeccion, fecha]);
    return result.rows; // [{ id_matricula: ..., asistio: ... }, ...]
  } catch (err) {
    console.error("❌ Error en asistenciaService.obtenerPorFechaYCurso:", err);
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
// Obtener todas las asistencias de auditoria
async function obtenerTodasLasAsistenciasAuditoria() {
  const sql = "SELECT * FROM tb_audit_asistencia";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las asistencias de auditoria:", err);
    throw err;
  }
}
// Actualizar asistencia
async function actualizarAsistencia(id, datos, usuarioModificador) {
  const { asistio, estado } = datos;

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
      SET 
          asistio = $1, estado = $2
      WHERE id_asistencia = $3
    `;

    await pool.query(sqlUpdate, [
       asistio, estado, id
    ]);

    await registrarAuditoriaAsistencia({
      id_asistencia: id,
      alumno_anterior: anterior.alumno,
      alumno_nuevo: anterior.alumno,
      fecha_anterior: anterior.fecha,
      fecha_nuevo: anterior.fecha,
      dia_anterior: anterior.dia,
      dia_nuevo: anterior.dia,
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
  obtenerTodasLasAsistenciasAuditoria,obtenerPorFechaYCurso,
  eliminarAsistencia,insertarMultiplesAsistencias
};
