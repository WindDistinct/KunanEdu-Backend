const pool = require("../database/db.js");

async function registrarAuditoriaCursoSeccion({
  id_curso_seccion,
  curso_anterior, curso_nuevo,
  seccion_anterior, seccion_nuevo,
   docente_anterior, docente_nuevo,
  estado_anterior, estado_nuevo,observacion,
  operacion, usuario
}) {
  const fecha = new Date();

  const sqlAudit = `
    INSERT INTO tb_audit_curso_seccion (
      id_curso_seccion, curso_anterior, curso_nuevo,
     seccion_anterior, seccion_nuevo,
      docente_anterior, docente_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13)
  `;

  const values = [
    id_curso_seccion,
    curso_anterior, curso_nuevo,
    seccion_anterior, seccion_nuevo,
   docente_anterior, docente_nuevo,
    estado_anterior, estado_nuevo,observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de curso_seccion registrado con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de curso_seccion:", err);
    throw err;
  }
}



// Insertar aula
async function insertarCursoSeccion(datos, usuarioModificador) {
    const { curso, seccion,docente } = datos;

  
  const sqlInsert = `
    INSERT INTO tb_curso_seccion (curso, seccion,docente, estado)
    VALUES ($1, $2, $3,true)
    RETURNING id_curso_seccion
  `;

  try {
    const result = await pool.query(sqlInsert, [curso, seccion,docente]);
    const id_curso_seccion = result.rows[0].id_curso_seccion;

    await registrarAuditoriaCursoSeccion({
      id_curso_seccion,
      curso_anterior: null,
      curso_nuevo: curso,
      seccion_anterior: null,
      seccion_nuevo: seccion,
       docente_anterior: null,
      docente_nuevo: docente,
      estado_anterior: null,
      estado_nuevo: true,
      observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "curso_seccion insertado y auditado", id: id_curso_seccion };
  } catch (err) {
    console.error("❌ Error al insertar curso_seccion:", err);
    throw err;
  }
}
async function insertarMultiplesCursoSeccion(listaDatos, usuarioModificador) {
  const resultados = [];

  for (const datos of listaDatos) {
    const { curso, seccion, docente } = datos;

    const sqlInsert = `
      INSERT INTO tb_curso_seccion (curso, seccion, docente, estado)
      VALUES ($1, $2, $3, true)
      RETURNING id_curso_seccion
    `;

    const result = await pool.query(sqlInsert, [curso, seccion, docente]);
    const id_curso_seccion = result.rows[0].id_curso_seccion;

    await registrarAuditoriaCursoSeccion({
      id_curso_seccion,
      curso_anterior: null,
      curso_nuevo: curso,
      seccion_anterior: null,
      seccion_nuevo: seccion,
      docente_anterior: null,
      docente_nuevo: docente,
      estado_anterior: null,
      estado_nuevo: true,
       observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    resultados.push({ id_curso_seccion, curso, seccion, docente });
  }

  return resultados;
}

async function verificarCursosAsignados(idSeccion) {
  try {
    const result = await pool.query(
      `SELECT 1 FROM tb_curso_seccion
       WHERE seccion = $1 AND estado = true
       LIMIT 1`,
      [idSeccion]
    );

    return result.rowCount > 0;
  } catch (err) {
    console.error("❌ Error al verificar cursos asignados a la sección:", err);
    throw err;
  }
}

// Obtener aulas activas
async function obtenerCursoSeccion() { 
     const sql = `
     SELECT 
        cg.id_curso_seccion, 
        cg.docente as id_emp,
        e.nombre_emp || ' - ' ||  e.ape_pat_emp  || ' - ' ||e.ape_mat_emp as docente,
        cg.curso AS id_curso,
        cg.seccion AS id_seccion,
        cg.estado, 
        c.nombre_curso AS curso,
        g.nombre || ' - ' || m.anio || ' - ' || m.nivel || ' - ' ||p.descripcion || ' - ' ||p.anio AS seccion ,
        p.anio as periodo
        FROM tb_curso_seccion cg 
        JOIN tb_empleado e ON cg.docente= e.id_emp
        JOIN tb_curso c ON cg.curso = c.id_curso
        JOIN tb_seccion g ON cg.seccion = g.id_seccion
        JOIN tb_grado m ON g.grado=m.id_grado
		JOIN tb_periodo_escolar p on g.periodo=p.id_periodo   
        WHERE cg.estado = true 
      `;

  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener los curso_seccion activas:", err);
    throw err;
  }
}

// Obtener todas las aulas
async function obtenerTodasLosCursoSeccion() {
    const sql = `
      SELECT 
        cg.id_curso_seccion, 
        cg.docente as id_emp,
        e.nombre_emp || ' - ' ||  e.ape_pat_emp  || ' - ' ||e.ape_mat_emp as docente,
        cg.curso AS id_curso,
        cg.seccion AS id_seccion,
        cg.estado, 
        c.nombre_curso AS curso,
        g.nombre || ' - ' || m.anio || ' - ' || m.nivel || ' - ' ||p.descripcion || ' - ' ||p.anio AS seccion ,
        p.anio as periodo
        FROM tb_curso_seccion cg 
        JOIN tb_empleado e ON cg.docente= e.id_emp
        JOIN tb_curso c ON cg.curso = c.id_curso
        JOIN tb_seccion g ON cg.seccion = g.id_seccion
        JOIN tb_grado m ON g.grado=m.id_grado
		JOIN tb_periodo_escolar p on g.periodo=p.id_periodo   
      `;

  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los curso_seccion:", err);
    throw err;
  }
}
 
async function obtenerTodasLosCursoSeccionAudit() {
  const sql = "SELECT * FROM tb_audit_curso_seccion";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los curso_seccion de auditoria:", err);
    throw err;
  }
}
 
async function actualizarCursoSeccion(id, datos, usuarioModificador) {
   const { curso, seccion,docente, estado,observacion } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_curso_seccion WHERE id_curso_seccion = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Curso-Seccion no encontrado");
    }
 
    await pool.query(
      `UPDATE tb_curso_seccion
       SET curso = $1, seccion = $2, docente = $3,estado = $4
       WHERE id_curso_seccion = $5`,
      [curso, seccion, docente,estado, id]
    );

     await registrarAuditoriaCursoSeccion({
      id_curso_seccion:id,
      curso_anterior: null,
      curso_nuevo: curso,
      seccion_anterior: null,
      seccion_nuevo: seccion,
       docente_anterior: null,
      docente_nuevo: docente,
      estado_anterior: null,
      estado_nuevo: true,
      observacion:observacion,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso-Seccion actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar curso_seccion:", err);
    throw err;
  }
}
 
async function eliminarCursoSeccion(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_curso_seccion WHERE id_curso_seccion = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Curso-Seccion no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_curso_seccion SET estado = false WHERE id_curso_seccion = $1",
      [id]
    );

    await registrarAuditoriaCursoSeccion({
      id_curso_seccion: id,
      curso_anterior: anterior.curso,
      curso_nuevo: anterior.curso,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: anterior.seccion,
      docente_anterior: anterior.docente,
      docente_nuevo: anterior.docente,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
       observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Curso-Seccion eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar curso seccion:", err);
    throw err;
  }
}

module.exports = {
  insertarCursoSeccion,
  insertarMultiplesCursoSeccion,
  verificarCursosAsignados,
  obtenerTodasLosCursoSeccion,
  obtenerCursoSeccion,
  obtenerTodasLosCursoSeccionAudit,
  actualizarCursoSeccion,
  eliminarCursoSeccion
};
