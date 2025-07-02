const pool = require("../database/db.js");

// Función para registrar auditoría de matrícula
async function registrarAuditoriaMatricula({
  id_matricula,
  alumno_anterior, alumno_nuevo,
  seccion_anterior, seccion_nuevo,
  condicion_anterior, condicion_nuevo,
  estado_anterior, estado_nuevo,observacion,
  operacion, usuario
}) {
 const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_matricula (
      id_matricula,
      fecha_matricula_nuevo,
      alumno_anterior, alumno_nuevo,
      seccion_anterior, seccion_nuevo,
      condicion_anterior, condicion_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14
    )
  `;

  const values = [
    id_matricula, 
    fecha, 
    alumno_anterior, alumno_nuevo,
    seccion_anterior, seccion_nuevo,
    condicion_anterior, condicion_nuevo,
    estado_anterior, estado_nuevo,observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de matrícula registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de matrícula:", err);
    throw err;
  }
}

// Insertar matrícula
async function insertarMatricula(datos, usuarioModificador) {
  const {
    observacion,
    alumno, seccion, condicion
  } = datos;



  try {

    const existe = await pool.query(
      `SELECT 1 FROM tb_matricula WHERE alumno = $1 AND seccion = $2`,
      [alumno, seccion]
    );

    if (existe.rowCount > 0) {
      throw new Error("El alumno ya está matriculado en esta sección");
    }

    const matriculaEnMismoPeriodo = await pool.query(`
      SELECT 1
      FROM tb_matricula m
      JOIN tb_seccion s1 ON m.seccion = s1.id_seccion
      WHERE m.alumno = $1
        AND m.estado = true
        AND s1.periodo = (
          SELECT periodo FROM tb_seccion s2 WHERE s2.id_seccion = $2
        )
        AND s1.id_seccion != $2
    `, [alumno, seccion]);

    if (matriculaEnMismoPeriodo.rowCount > 0) {
      throw new Error("El alumno ya está matriculado en otra sección del mismo periodo");
    }


      const sqlInsert = `
        INSERT INTO tb_matricula (
          fecha_matricula, observacion,
          alumno, seccion, condicion, estado
        ) VALUES (
          $1, $2, $3, $4, $5, true
        )
        RETURNING id_matricula
      `;

    const result = await pool.query(sqlInsert, [
      new Date(), observacion,
      alumno, seccion, condicion
    ]);
    const id_matricula = result.rows[0].id_matricula;

    await registrarAuditoriaMatricula({
      id_matricula, 
      alumno_anterior: null,
      alumno_nuevo: alumno,
      seccion_anterior: null,
      seccion_nuevo: seccion,
      condicion_anterior: null,
      condicion_nuevo: condicion,
      estado_anterior: null,
      estado_nuevo: true,
       observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Matrícula insertada y auditada", id: id_matricula };
  } catch (err) {
    console.error("❌ Error al insertar matrícula:", err);
    throw err;
  }
}

// Obtener matrículas activas
async function obtenerMatriculas() {
   const sql = `
      SELECT 
      cg.id_matricula, 
      cg.fecha_matricula,
      cg.alumno AS id_alumno,
      cg.seccion AS id_seccion,
      cg.condicion,
      cg.observacion,
        cg.estado, 
        c.nombre || ' - ' || c.apellido_paterno || '  ' || c.apellido_materno  AS alumno,
        g.nombre || ' - ' || d.anio || ' ' ||  d.nivel  || ' - ' || p.descripcion|| ' ' || p.anio AS seccion 
      FROM tb_matricula cg
      JOIN tb_alumno c ON cg.alumno = c.id_alumno
      JOIN tb_seccion g ON cg.seccion = g.id_seccion
    JOIN tb_grado d ON g.grado = d.id_grado
    JOIN tb_periodo_escolar p ON g.periodo = p.id_periodo
    WHERE cg.estado = true 
      `;
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener matrículas activas:", err);
    throw err;
  }
}

// Obtener todas las matrículas
async function obtenerTodasLasMatriculas() {
  const sql = `
      SELECT 
      cg.id_matricula, 
      cg.alumno AS id_alumno, cg.fecha_matricula,
      cg.seccion AS id_seccion,
      cg.condicion,
      cg.observacion,
        cg.estado, 
        c.nombre || ' - ' || c.apellido_paterno || '  ' || c.apellido_materno  AS alumno,
        g.nombre || ' - ' || d.anio || ' ' ||  d.nivel  || ' - ' || p.descripcion|| ' ' || p.anio AS seccion 
      FROM tb_matricula cg
      JOIN tb_alumno c ON cg.alumno = c.id_alumno
      JOIN tb_seccion g ON cg.seccion = g.id_seccion
    JOIN tb_grado d ON g.grado = d.id_grado
    JOIN tb_periodo_escolar p ON g.periodo = p.id_periodo  
      `;
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las matrículas:", err);
    throw err;
  }
}
// Obtener todas las matrículas de auditoria
async function obtenerTodasLasMatriculasAuditoria() {
  const sql = "SELECT * FROM tb_audit_matricula";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las matrículas de auditoria:", err);
    throw err;
  }
}

// Actualizar matrícula
async function actualizarMatricula(id, datos, usuarioModificador) {
  const {
    obs,
    alumno, seccion, condicion, estado
  } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_matricula WHERE id_matricula = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Matrícula no encontrada");
    }

    const anterior = resultAnterior.rows[0]; 
    const existe = await pool.query(
      `SELECT 1 
       FROM tb_matricula 
       WHERE alumno = $1 
         AND seccion = $2 
         AND id_matricula <> $3`,
      [alumno, seccion, id]
    );

    if (existe.rowCount > 0) {
      throw new Error("El alumno ya está matriculado en esta sección");
    }
 
    const matriculaEnMismoPeriodo = await pool.query(`
      SELECT 1
      FROM tb_matricula m
      JOIN tb_seccion s1 ON m.seccion = s1.id_seccion
      WHERE m.alumno = $1
        AND m.estado = true
        AND m.id_matricula <> $2
        AND s1.periodo = (
          SELECT periodo FROM tb_seccion s2 WHERE s2.id_seccion = $3
        )
        AND s1.id_seccion != $3
    `, [alumno, id, seccion]);

    if (matriculaEnMismoPeriodo.rowCount > 0) {
      throw new Error("El alumno ya está matriculado en otra sección del mismo periodo");
    }


    const sqlUpdate = `
      UPDATE tb_matricula
      SET 
          alumno = $1, seccion = $2, condicion = $3, estado = $4
      WHERE id_matricula = $5
    `;

    await pool.query(sqlUpdate, [
      alumno, seccion, condicion, estado, id
    ]);

    await registrarAuditoriaMatricula({
      id_matricula: id,  
      alumno_anterior: anterior.alumno,
      alumno_nuevo: alumno,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: seccion,
      condicion_anterior: anterior.condicion,
      condicion_nuevo: condicion,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      observacion: obs,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Matrícula actualizada y auditada" };
  } catch (err) {
    console.error("❌ Error al actualizar matrícula:", err);
    throw err;
  }
}

// Eliminar matrícula (borrado lógico)
async function eliminarMatricula(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_matricula WHERE id_matricula = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Matrícula no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_matricula SET estado = false WHERE id_matricula = $1",
      [id]
    );

    await registrarAuditoriaMatricula({
      id_matricula: id,  
      alumno_anterior: anterior.alumno,
      alumno_nuevo: anterior.alumno,
      seccion_anterior: anterior.seccion,
      seccion_nuevo: anterior.seccion,
      condicion_anterior: anterior.condicion,
      condicion_nuevo: anterior.condicion,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Matrícula eliminada (estado = false) y auditada" };
  } catch (err) {
    console.error("❌ Error al eliminar matrícula:", err);
    throw err;
  }
}

module.exports = {
  insertarMatricula,
  obtenerMatriculas,
  obtenerTodasLasMatriculasAuditoria,
  obtenerTodasLasMatriculas,
  actualizarMatricula,
  eliminarMatricula
};
