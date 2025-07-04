const pool = require("../database/db.js");

// Auditoría de asistencia
async function registrarAuditoriaAsistencia({
  id_asistencia,
  id_matricula,
  fecha,
  dia,
  asistio_anterior, asistio_nuevo,
  estado_anterior, estado_nuevo,id_curso_seccion,
  operacion, usuario
}) {
  const fechaA = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_asistencia (
      id_asistencia,
      id_matricula,
      fecha,
      dia,
      asistio_anterior, asistio_nuevo,
      estado_anterior, estado_nuevo,id_curso_seccion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12
    )
  `;

  const values = [
    id_asistencia,
    id_matricula,
    fecha,
    dia,
    asistio_anterior, asistio_nuevo,
    estado_anterior, estado_nuevo,id_curso_seccion,
    operacion, fechaA, usuario
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
      id_curso_seccion:cursoSeccion,
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
  const fechaModificacion = new Date();

  for (const datos of listaDatos) {
    const { id_matricula, fecha, asistio, dia, id_curso_seccion } = datos;

    const resultado = await pool.query(
      `SELECT * FROM tb_asistencia 
       WHERE id_matricula = $1 AND fecha = $2 AND id_curso_seccion = $3`,
      [id_matricula, fecha, id_curso_seccion]
    );

    if (resultado.rowCount > 0) {
      // Existe → actualizar
      const asistenciaExistente = resultado.rows[0];

      await pool.query(
        `UPDATE tb_asistencia 
         SET asistio = $1 
         WHERE id_matricula = $2 AND fecha = $3 AND id_curso_seccion = $4`,
        [asistio, id_matricula, fecha, id_curso_seccion]
      );

      await registrarAuditoriaAsistencia({
        id_asistencia: asistenciaExistente.id_asistencia,
        id_matricula,
        fecha,
        dia,
        asistio_anterior: asistenciaExistente.asistio,
        asistio_nuevo: asistio,
        estado_anterior: asistenciaExistente.estado,
        estado_nuevo: asistenciaExistente.estado, // No cambia en este caso
        id_curso_seccion,
        operacion: "UPDATE",
        usuario: usuarioModificador.usuario
      });
    } else {
      // No existe → insertar
      const insert = await pool.query(
        `INSERT INTO tb_asistencia (id_matricula, fecha, dia, asistio, id_curso_seccion, estado)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id_asistencia`,
        [id_matricula, fecha, dia, asistio, id_curso_seccion]
      );

      const idAsistencia = insert.rows[0].id_asistencia;

      await registrarAuditoriaAsistencia({
        id_asistencia: idAsistencia,
        id_matricula,
        fecha,
        dia,
        asistio_anterior: null,
        asistio_nuevo: asistio,
        estado_anterior: null,
        estado_nuevo: true,
        id_curso_seccion,
        operacion: "INSERT",
        usuario: usuarioModificador.usuario
      });
    }
  }
}

async function obtenerReportePorCursoPeriodoMes(cursoSeccion, periodo, mes) {
  const sql = `
    SELECT 
      a.id_asistencia,
      a.fecha,
      a.dia,
      a.asistio,
       al.nombre || ' ' || al.apellido_paterno || ' ' || al.apellido_materno AS alumno,
      cs.id_curso_seccion,
      c.nombre_curso,
      p.anio || ' ' || p.descripcion AS periodo
    FROM tb_asistencia a
    JOIN tb_matricula m ON a.id_matricula = m.id_matricula
    JOIN tb_alumno al ON m.alumno = al.id_alumno
    JOIN tb_seccion s ON m.seccion = s.id_seccion
    JOIN tb_periodo_escolar p ON s.periodo = p.id_periodo
    JOIN tb_curso_seccion cs ON s.id_seccion = cs.seccion
    JOIN tb_curso c ON cs.curso = c.id_curso
    WHERE cs.id_curso_seccion = $1
      AND p.id_periodo = $2
      AND EXTRACT(MONTH FROM a.fecha) = $3
      AND a.estado = true
    ORDER BY a.fecha, alumno
  `;
  const result = await pool.query(sql, [cursoSeccion, periodo, mes]);
  return result.rows;
}

async function obtenerPorFechaYCurso(cursoSeccion, fecha) {
  const sql = `
     SELECT a.id_matricula, a.asistio
    FROM tb_asistencia a 
    WHERE a.id_curso_seccion = $1 AND a.fecha = $2 AND a.estado = true
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
      id_asistencia:id,
      id_matricula: anterior.id_matricula, 
      fecha: anterior.fecha,  
      dia: anterior.dia,
      asistio_anterior: anterior.asistio,
      asistio_nuevo: asistio,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      id_curso_seccion:anterior.id_curso_seccion,
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
      id_asistencia:id,
      id_matricula: anterior.id_matricula, 
      fecha: anterior.fecha,  
      dia: anterior.dia,
      asistio_anterior: anterior.asistio,
      asistio_nuevo: anterior.asistio,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
       id_curso_seccion:anterior.id_curso_seccion,
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
  obtenerTodasLasAsistencias,obtenerReportePorCursoPeriodoMes,
  actualizarAsistencia,
  obtenerTodasLasAsistenciasAuditoria,obtenerPorFechaYCurso,
  eliminarAsistencia,insertarMultiplesAsistencias
};
