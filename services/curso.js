const pool = require("../database/db.js");

// Función para registrar auditoría de curso
async function registrarAuditoriaCurso({
  id_curso,
  nombre_anterior, nombre_nuevo,
  docente_anterior, docente_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  const fecha = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  const sqlAudit = `
    INSERT INTO tb_audit_curso (
      id_curso, nombre_curso_anterior, nombre_curso_nuevo,
      docente_anterior, docente_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  const values = [
    id_curso,
    nombre_anterior, nombre_nuevo,
    docente_anterior, docente_nuevo,
    estado_anterior, estado_nuevo,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de curso registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de curso:", err);
    throw err;
  }
}

// Obtener cursos activos
async function obtenerCursos() {
  const sql = "SELECT * FROM tb_curso WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener cursos activos:", err);
    throw err;
  }
}

// Obtener todos los cursos
async function obtenerTodosLosCursos() {
  const sql = "SELECT * FROM tb_curso";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los cursos:", err);
    throw err;
  }
}
// Obtener todos los cursos de auditoria
async function obtenerTodosLosCursosAuditoria() {
  const sql = "SELECT * FROM tb_audit_curso";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los cursos de auditorias:", err);
    throw err;
  }
}
// Insertar curso
async function insertarCurso(datos, usuarioModificador) {
  const { nombre_curso, docente } = datos;

  const sqlInsert = `
    INSERT INTO tb_curso (nombre_curso, docente, estado)
    VALUES ($1, $2, true)
    RETURNING id_curso
  `;

  try {
    const result = await pool.query(sqlInsert, [nombre_curso, docente]);
    const id_curso = result.rows[0].id_curso;

    await registrarAuditoriaCurso({
      id_curso,
      nombre_anterior: null,
      nombre_nuevo: nombre_curso,
      docente_anterior: null,
      docente_nuevo: docente,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso registrado y auditado", id: id_curso };
  } catch (err) {
    console.error("❌ Error al insertar curso:", err);
    throw err;
  }
}

// Actualizar curso
async function actualizarCurso(id, datos, usuarioModificador) {
  const { nombre_curso, docente, estado } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_curso WHERE id_curso = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Curso no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_curso
      SET nombre_curso = $1, docente = $2, estado = $3
      WHERE id_curso = $4
    `;

    await pool.query(sqlUpdate, [
      nombre_curso,
      docente,
      estado,
      id
    ]);

    await registrarAuditoriaCurso({
      id_curso: id,
      nombre_anterior: anterior.nombre_curso,
      nombre_nuevo: nombre_curso,
      docente_anterior: anterior.docente,
      docente_nuevo: docente,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar curso:", err);
    throw err;
  }
}

// Eliminar curso (borrado lógico)
async function eliminarCurso(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_curso WHERE id_curso = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Curso no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_curso
      SET estado = false
      WHERE id_curso = $1
    `;

    await pool.query(sqlUpdate, [id]);

    await registrarAuditoriaCurso({
      id_curso: id,
      nombre_anterior: anterior.nombre_curso,
      nombre_nuevo: anterior.nombre_curso, // igual porque no cambia
      docente_anterior: anterior.docente,
      docente_nuevo: anterior.docente,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso eliminado (lógicamente) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar curso:", err);
    throw err;
  }
}

module.exports = {
  obtenerCursos,
  obtenerTodosLosCursos,
  insertarCurso,
  obtenerTodosLosCursosAuditoria,
  actualizarCurso,
  eliminarCurso
};
