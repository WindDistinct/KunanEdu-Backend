const pool = require("../database/db.js");

async function registrarAuditoriaCursoGrado({
  id_curso_grado,
  curso_anterior, curso_nuevo,
  grado_anterior, grado_nuevo,
  estado_anterior, estado_nuevo,observacion,
  operacion, usuario
}) {
  const fecha = new Date();

  const sqlAudit = `
    INSERT INTO tb_audit_curso_grado (
      id_curso_grado, curso_anterior, curso_nuevo,
      grado_anterior, grado_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11)
  `;

  const values = [
    id_curso_grado,
    curso_anterior, curso_nuevo,
    grado_anterior, grado_nuevo,
    estado_anterior, estado_nuevo,observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de curso_grado registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de curso_grado:", err);
    throw err;
  }
}



// Insertar aula
async function insertarCursoGrado(datos, usuarioModificador) {
    const { curso, grado } = datos;

  // Verificar duplicado
  const sqlCheck = `
    SELECT 1 FROM tb_curso_grado WHERE curso = $1 AND grado = $2 AND estado = true
  `;
  const checkResult = await pool.query(sqlCheck, [curso, grado]);
  if (checkResult.rowCount > 0) {
    throw new Error("Ya existe una relación activa entre este curso y grado");
  }

  const sqlInsert = `
    INSERT INTO tb_curso_grado (curso, grado, estado)
    VALUES ($1, $2, true)
    RETURNING id_curso_grado
  `;

  try {
    const result = await pool.query(sqlInsert, [curso, grado]);
    const id_curso_grado = result.rows[0].id_curso_grado;

    await registrarAuditoriaCursoGrado({
      id_curso_grado,
      curso_anterior: null,
      curso_nuevo: curso,
      grado_anterior: null,
      grado_nuevo: grado,
      estado_anterior: null,
      estado_nuevo: true,
      observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso-Grado insertado y auditado", id: id_curso_grado };
  } catch (err) {
    console.error("❌ Error al insertar curso_grado:", err);
    throw err;
  }
}

// Obtener aulas activas
async function obtenerCursoGrado() { 
     const sql = `
      SELECT 
      cg.id_curso_grado, 
      cg.curso AS id_curso,
      cg.grado AS id_grado,
      cg.estado, 
      c.nombre_curso AS curso,
      g.nivel || ' - ' || g.anio AS grado 
    FROM tb_curso_grado cg
    JOIN tb_curso c ON cg.curso = c.id_curso
    JOIN tb_grado g ON cg.grado = g.id_grado
    WHERE cg.estado = true
      `;

  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener los curso_grado activas:", err);
    throw err;
  }
}
async function obtenerCursoPorGrado(id) {

     const sql = `
      select 
      s.grado AS id_grado,
      s.curso AS id_curso,
      a.nombre_curso AS curso,
      g.nivel || ' - ' || g.anio AS grado
      FROM tb_curso_grado S
      JOIN tb_curso a ON s.curso = a.id_curso
      JOIN tb_grado g ON s.grado = g.id_grado
      WHERE s.estado =  true AND s.grado=$1  
    `;
 
 
  try {

    const result =  await pool.query(sql, [
      id
    ]);
 
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los cursos por grado:", err);
    throw err;
  }
}
// Obtener todas las aulas
async function obtenerTodasLasCursoGrado() {
    const sql = `
     SELECT 
      cg.id_curso_grado, 
      cg.curso AS id_curso,
      cg.grado AS id_grado,
      cg.estado, 
      c.nombre_curso AS curso,
      g.nivel || ' - ' || g.anio AS grado 
    FROM tb_curso_grado cg
    JOIN tb_curso c ON cg.curso = c.id_curso
    JOIN tb_grado g ON cg.grado = g.id_grado
      `;

  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas los curso_grado:", err);
    throw err;
  }
}
 
async function obtenerTodasLasCursoGradoAudit() {
  const sql = "SELECT * FROM tb_audit_curso_grado";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los curso_grado de auditoria:", err);
    throw err;
  }
}
 
async function actualizarCursoGrado(id, datos, usuarioModificador) {
   const { curso, grado, estado,observacion } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_curso_grado WHERE id_curso_grado = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Curso-Grado no encontrado");
    }

    const anterior = resultAnterior.rows[0];
    const resultDuplicado = await pool.query(
        `SELECT 1 FROM tb_curso_grado 
        WHERE curso = $1 AND grado = $2 AND estado = true AND id_curso_grado <> $3`,
        [curso, grado, id]
      );

      if (resultDuplicado.rowCount > 0) {
        throw new Error("Ya existe una relación activa entre este curso y grado");
      }
    await pool.query(
      `UPDATE tb_curso_grado
       SET curso = $1, grado = $2, estado = $3
       WHERE id_curso_grado = $4`,
      [curso, grado, estado, id]
    );

    await registrarAuditoriaCursoGrado({
      id_curso_grado: id,
      curso_anterior: anterior.curso,
      curso_nuevo: curso,
      grado_anterior: anterior.grado,
      grado_nuevo: grado,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      observacion:observacion,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso-Grado actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar curso_grado:", err);
    throw err;
  }
}
 
async function eliminarCursoGrado(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_curso_grado WHERE id_curso_grado = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Curso-Grado no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_curso_grado SET estado = false WHERE id_curso_grado = $1",
      [id]
    );

    await registrarAuditoriaCursoGrado({
      id_curso_grado: id,
      curso_anterior: anterior.curso,
      curso_nuevo: anterior.curso,
      grado_anterior: anterior.grado,
      grado_nuevo: anterior.grado,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
       observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso-Grado eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar curso_grado:", err);
    throw err;
  }
}

module.exports = {
  insertarCursoGrado,
  obtenerCursoGrado,
  obtenerCursoPorGrado,
  obtenerTodasLasCursoGradoAudit,
  obtenerTodasLasCursoGrado,
  actualizarCursoGrado,
  eliminarCursoGrado
};
