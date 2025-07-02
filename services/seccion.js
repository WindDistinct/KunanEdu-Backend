const pool = require("../database/db.js");

// Función para registrar auditoría de sección
async function registrarAuditoriaSeccion({
  id_seccion,
  aula_anterior, aula_nuevo,
  grado_anterior, grado_nuevo,
  nombre_anterior, nombre_nuevo,
  periodo_anterior, periodo_nuevo,
  estado_anterior, estado_nuevo,observacion,
  operacion, usuario
}) {
 const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_seccion (
      id_seccion, aula_anterior, aula_nuevo,
      grado_anterior, grado_nuevo,
      nombre_anterior, nombre_nuevo,
      periodo_anterior, periodo_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14, $15
    )
  `;

  const values = [
    id_seccion,
    aula_anterior, aula_nuevo,
    grado_anterior, grado_nuevo,
    nombre_anterior, nombre_nuevo,
    periodo_anterior, periodo_nuevo,
    estado_anterior, estado_nuevo,observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de sección registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de sección:", err);
    throw err;
  }
}

// Insertar sección
async function insertarSeccion(datos, usuarioModificador) {
  const { aula, grado, nombre, periodo } = datos;

  const existeAula = await pool.query(
  `SELECT 1 FROM tb_seccion WHERE aula = $1 AND periodo = $2 AND estado=true`,
    [aula, periodo]
  );

  if (existeAula.rowCount > 0) {
    throw new Error("El aula ya está asignada a otra sección (activa) en el mismo periodo");
  }

  const sqlInsert = `
    INSERT INTO tb_seccion (
      aula, grado, nombre, periodo, estado
    ) VALUES ($1, $2, $3, $4, true)
    RETURNING id_seccion
  `;

  try {
    const result = await pool.query(sqlInsert, [
      aula, grado, nombre, periodo
    ]);
    const id_seccion = result.rows[0].id_seccion;

    await registrarAuditoriaSeccion({
      id_seccion,
      aula_anterior: null,
      aula_nuevo: aula,
      grado_anterior: null,
      grado_nuevo: grado,
      nombre_anterior: null,
      nombre_nuevo: nombre,
      periodo_anterior: null,
      periodo_nuevo: periodo,
      estado_anterior: null,
      estado_nuevo: true,
      observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Sección insertada y auditada", id: id_seccion };
  } catch (err) {
    console.error("❌ Error al insertar sección:", err);
    throw err;
  }
}

// Obtener secciones activas
async function obtenerSecciones() {

   const sql = `
    SELECT 
    s.id_seccion,
    s.nombre,
    s.estado,
    s.aula AS id_aula,
    a.numero_aula AS aula,
    s.grado AS id_grado,
    g.nivel || ' - ' || g.anio AS grado,
    s.periodo AS id_periodo,
    p.anio AS periodo
    FROM tb_seccion s
    JOIN tb_aula a ON s.aula = a.id_aula
    JOIN tb_grado g ON s.grado = g.id_grado
    JOIN tb_periodo_escolar p ON s.periodo = p.id_periodo
    WHERE s.estado = true
    ORDER BY p.anio;
    `;
 
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener secciones:", err);
    throw err;
  }
}
async function obtenerSeccionesPorGradoPeriodo(grado,periodo) {
   const sql = `
 SELECT * FROM tb_seccion WHERE grado = $1 AND periodo = $2 AND estado = true;

  `;
  try {
    const result = await pool.query(sql, [grado,periodo]);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener las secciones:", err);
    throw err;
  }
}
// Obtener todas las secciones
async function obtenerTodasLasSecciones() {
    const sql = `
    SELECT 
      s.id_seccion,
      s.nombre,
      s.estado,
      s.aula AS id_aula,
      a.numero_aula AS aula,
      s.grado AS id_grado,
      g.nivel || ' - ' || g.anio AS grado,
      s.periodo AS id_periodo,
      p.anio AS periodo
    FROM tb_seccion s
    JOIN tb_aula a ON s.aula = a.id_aula
    JOIN tb_grado g ON s.grado = g.id_grado
    JOIN tb_periodo_escolar p ON s.periodo = p.id_periodo
    ORDER BY p.anio;
  `;
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las secciones:", err);
    throw err;
  }
}
// Obtener todas las secciones de aduditoria
async function obtenerTodasLasSeccionesAuditoria() {
  const sql = "SELECT * FROM tb_audit_seccion";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las secciones:", err);
    throw err;
  }
}
// Actualizar sección
async function actualizarSeccion(id, datos, usuarioModificador) {
  const { aula, grado, nombre, periodo, estado,observacion } = datos;
 
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_seccion WHERE id_seccion = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Sección no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    if (estado === true || aula !== anterior.aula || periodo !== anterior.periodo) {
      const conflicto = await pool.query(
        `SELECT 1 FROM tb_seccion 
        WHERE aula = $1 AND periodo = $2 AND estado = true AND id_seccion != $3`,
        [aula, periodo, id]
      );
      if (conflicto.rowCount > 0) {
        throw new Error("El aula ya está asignada a otra sección activa en el mismo periodo");
      }
    }
    
    const sqlUpdate = `
      UPDATE tb_seccion
      SET aula = $1, grado = $2, nombre = $3, periodo = $4, estado = $5
      WHERE id_seccion = $6
    `;

    await pool.query(sqlUpdate, [
      aula, grado, nombre, periodo, estado, id
    ]);

    await registrarAuditoriaSeccion({
      id_seccion: id,
      aula_anterior: anterior.aula,
      aula_nuevo: aula,
      grado_anterior: anterior.grado,
      grado_nuevo: grado,
      nombre_anterior: anterior.nombre,
      nombre_nuevo: nombre,
      periodo_anterior: anterior.periodo,
      periodo_nuevo: periodo,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      observacion:observacion,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Sección actualizada y auditada" };
  } catch (err) {
    console.error("❌ Error al actualizar sección:", err);
    throw err;
  }
}

// Eliminar sección (borrado lógico)
async function eliminarSeccion(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_seccion WHERE id_seccion = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Sección no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_seccion SET estado = false WHERE id_seccion = $1",
      [id]
    );

    await registrarAuditoriaSeccion({
      id_seccion: id,
      aula_anterior: anterior.aula,
      aula_nuevo: anterior.aula,
      grado_anterior: anterior.grado,
      grado_nuevo: anterior.grado,
      nombre_anterior: anterior.nombre,
      nombre_nuevo: anterior.nombre,
      periodo_anterior: anterior.periodo,
      periodo_nuevo: anterior.periodo,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
       observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Sección eliminada (estado = false) y auditada" };
  } catch (err) {
    console.error("❌ Error al eliminar sección:", err);
    throw err;
  }
}

module.exports = {
  insertarSeccion,
  obtenerSecciones,
  obtenerTodasLasSecciones,
  actualizarSeccion,
  eliminarSeccion,
  obtenerSeccionesPorGradoPeriodo,
  obtenerTodasLasSeccionesAuditoria
};
