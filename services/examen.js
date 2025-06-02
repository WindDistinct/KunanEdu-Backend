const pool = require("../database/db.js");

// Auditoría de examen
async function registrarAuditoriaExamen({
  id_examen,
  curso_anterior, curso_nuevo,
  seccion_anterior, seccion_nuevo,
  bimestre_anterior, bimestre_nuevo,
  nota_anterior, nota_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  const fecha = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  const sqlAudit = `
    INSERT INTO tb_audit_examen (
      id_examen, curso_anterior, curso_nuevo,
      seccion_anterior, seccion_nuevo,
      bimestre_anterior, bimestre_nuevo,
      nota_anterior, nota_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  `;

  const values = [
    id_examen,
    curso_anterior, curso_nuevo,
    seccion_anterior, seccion_nuevo,
    bimestre_anterior, bimestre_nuevo,
    nota_anterior, nota_nuevo,
    estado_anterior, estado_nuevo,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de examen registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de examen:", err);
    throw err;
  }
}

// Insertar examen
async function insertarExamen(datos, usuarioModificador) {
  const { curso, seccion, bimestre, nota } = datos;

  const sqlInsert = `
    INSERT INTO tb_examen (curso, seccion, bimestre, nota, estado)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id_examen
  `;

  try {
    const result = await pool.query(sqlInsert, [curso, seccion, bimestre, nota]);
    const id_examen = result.rows[0].id_examen;

    await registrarAuditoriaExamen({
      id_examen,
      curso_anterior: null,
      curso_nuevo: curso,
      seccion_anterior: null,
      seccion_nuevo: seccion,
      bimestre_anterior: null,
      bimestre_nuevo: bimestre,
      nota_anterior: null,
      nota_nuevo: nota,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Examen insertado y auditado", id: id_examen };
  } catch (err) {
    console.error("❌ Error al insertar examen:", err);
    throw err;
  }
}

// Obtener exámenes activos
async function obtenerExamenes() {
  const sql = "SELECT * FROM tb_examen WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener exámenes activos:", err);
    throw err;
  }
}

// Obtener todos los exámenes
async function obtenerTodosLosExamenes() {
  const sql = "SELECT * FROM tb_examen";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los exámenes:", err);
    throw err;
  }
}

// Actualizar examen
async function actualizarExamen(id, datos, usuarioModificador) {
  const { curso, seccion, bimestre, nota, estado } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_examen WHERE id_examen = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Examen no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_examen
      SET curso = $1, seccion = $2, bimestre = $3, nota = $4, estado = $5
      WHERE id_examen = $6
    `;

    await pool.query(sqlUpdate, [
      curso, seccion, bimestre, nota, estado, id
    ]);

    await registrarAuditoriaExamen({
      id_examen: id,
      curso_anterior: anterior.curso,
      curso_nuevo: curso,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: seccion,
      bimestre_anterior: anterior.bimestre,
      bimestre_nuevo: bimestre,
      nota_anterior: anterior.nota,
      nota_nuevo: nota,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Examen actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar examen:", err);
    throw err;
  }
}

// Eliminar examen (borrado lógico)
async function eliminarExamen(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_examen WHERE id_examen = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Examen no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_examen SET estado = false WHERE id_examen = $1",
      [id]
    );

    await registrarAuditoriaExamen({
      id_examen: id,
      curso_anterior: anterior.curso,
      curso_nuevo: anterior.curso,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: anterior.seccion,
      bimestre_anterior: anterior.bimestre,
      bimestre_nuevo: anterior.bimestre,
      nota_anterior: anterior.nota,
      nota_nuevo: anterior.nota,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Examen eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar examen:", err);
    throw err;
  }
}

module.exports = {
  insertarExamen,
  obtenerExamenes,
  obtenerTodosLosExamenes,
  actualizarExamen,
  eliminarExamen
};
