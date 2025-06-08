const pool = require("../database/db.js");

// Auditoría de seccion-alumno
async function registrarAuditoriaSeccionAlumno({
  id_seccion_alumno,
  seccion_anterior, seccion_nuevo,
  alumno_anterior, alumno_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
 const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_seccion_alumno (
      id_seccion_alumno,
      seccion_anterior, seccion_nuevo,
      alumno_anterior, alumno_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )
  `;

  const values = [
    id_seccion_alumno,
    seccion_anterior, seccion_nuevo,
    alumno_anterior, alumno_nuevo,
    estado_anterior, estado_nuevo,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de seccion-alumno registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de seccion-alumno:", err);
    throw err;
  }
}

// Insertar relación sección-alumno
async function insertarSeccionAlumno(datos, usuarioModificador) {
  const { seccion, alumno } = datos;

  const sqlInsert = `
    INSERT INTO tb_seccion_alumno (
      seccion, alumno, estado
    ) VALUES ($1, $2, true)
    RETURNING id_seccion_alumno
  `;

  try {
    const result = await pool.query(sqlInsert, [seccion, alumno]);
    const id_seccion_alumno = result.rows[0].id_seccion_alumno;

    await registrarAuditoriaSeccionAlumno({
      id_seccion_alumno,
      seccion_anterior: null,
      seccion_nuevo: seccion,
      alumno_anterior: null,
      alumno_nuevo: alumno,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Sección-alumno insertado y auditado", id: id_seccion_alumno };
  } catch (err) {
    console.error("❌ Error al insertar sección-alumno:", err);
    throw err;
  }
}

// Obtener relaciones activas
async function obtenerSeccionAlumnos() {
  const sql = "SELECT * FROM tb_seccion_alumno WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener relaciones activas:", err);
    throw err;
  }
}

// Obtener todas las relaciones
async function obtenerTodasLasSeccionAlumnos() {
  const sql = "SELECT * FROM tb_seccion_alumno";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las relaciones:", err);
    throw err;
  }
}
// Obtener todas las secciones auditorias
async function obtenerTodasLasSeccionAlumnosAuditoria() {
  const sql = "SELECT * FROM tb_audit_seccion_alumno";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las relaciones:", err);
    throw err;
  }
}
// Actualizar relación
async function actualizarSeccionAlumno(id, datos, usuarioModificador) {
  const { seccion, alumno, estado } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_seccion_alumno WHERE id_seccion_alumno = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Relación sección-alumno no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_seccion_alumno
      SET seccion = $1, alumno = $2, estado = $3
      WHERE id_seccion_alumno = $4
    `;

    await pool.query(sqlUpdate, [seccion, alumno, estado, id]);

    await registrarAuditoriaSeccionAlumno({
      id_seccion_alumno: id,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: seccion,
      alumno_anterior: anterior.alumno,
      alumno_nuevo: alumno,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Relación sección-alumno actualizada y auditada" };
  } catch (err) {
    console.error("❌ Error al actualizar relación sección-alumno:", err);
    throw err;
  }
}

// Eliminar relación (borrado lógico)
async function eliminarSeccionAlumno(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_seccion_alumno WHERE id_seccion_alumno = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Relación sección-alumno no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_seccion_alumno SET estado = false WHERE id_seccion_alumno = $1",
      [id]
    );

    await registrarAuditoriaSeccionAlumno({
      id_seccion_alumno: id,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: anterior.seccion,
      alumno_anterior: anterior.alumno,
      alumno_nuevo: anterior.alumno,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Relación sección-alumno eliminada (estado = false) y auditada" };
  } catch (err) {
    console.error("❌ Error al eliminar relación sección-alumno:", err);
    throw err;
  }
}

module.exports = {
  insertarSeccionAlumno,
  obtenerTodasLasSeccionAlumnosAuditoria,
  obtenerSeccionAlumnos,
  obtenerTodasLasSeccionAlumnos,
  actualizarSeccionAlumno,
  eliminarSeccionAlumno
};
