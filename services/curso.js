const pool = require("../database/db.js");

// Función para registrar auditoría de curso
async function registrarAuditoriaCurso({
  id_curso,
  nombre_anterior, nombre_nuevo, 
  estado_anterior, estado_nuevo,observacion,
  operacion, usuario
}) {
  const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_curso (
      id_curso, nombre_curso_anterior, nombre_curso_nuevo, 
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;

  const values = [
    id_curso,
    nombre_anterior, nombre_nuevo, 
    estado_anterior, estado_nuevo,observacion,
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
  const { nombre_curso } = datos;

  const cursoExistente = await pool.query("SELECT * FROM tb_curso WHERE nombre_curso = $1", [nombre_curso]);
  if (cursoExistente.rowCount > 0) {
    throw new Error("Curso ya registrado");
  }
  const sqlInsert = `
    INSERT INTO tb_curso (nombre_curso, estado)
    VALUES ($1, true)
    RETURNING id_curso
  `;

  try {
    const result = await pool.query(sqlInsert, [nombre_curso]);
    const id_curso = result.rows[0].id_curso;

    await registrarAuditoriaCurso({
      id_curso,
      nombre_anterior: null,
      nombre_nuevo: nombre_curso,
      estado_anterior: null,
      estado_nuevo: true,
      observacion:'Nuevo registro',
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
  const { nombre_curso, estado,observacion } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_curso WHERE id_curso = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Curso no encontrado");
    }

    const anterior = resultAnterior.rows[0];
    const resultDuplicado = await pool.query(
      "SELECT * FROM tb_curso WHERE LOWER(nombre_curso) = LOWER($1) AND id_curso <> $2",
      [nombre_curso, id]
    );

    if (resultDuplicado.rowCount > 0) {
      throw new Error("Ya existe un curso con ese nombre");
    }

    const sqlUpdate = `
      UPDATE tb_curso
      SET nombre_curso = $1, estado = $2
      WHERE id_curso = $3
    `;

    await pool.query(sqlUpdate, [
      nombre_curso,
      estado,
      id
    ]);

    await registrarAuditoriaCurso({
      id_curso: id,
      nombre_anterior: anterior.nombre_curso,
      nombre_nuevo: nombre_curso,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
       observacion:observacion,
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
      nombre_nuevo: anterior.nombre_curso, 
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      observacion:'Registro eliminado',
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
