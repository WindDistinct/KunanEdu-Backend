const pool = require("../database/db.js");

// Función para registrar auditoría de periodo
async function registrarAuditoriaPeriodo({
  id_periodo,
  anio_anterior, anio_nuevo,
  descripcion_anterior, descripcion_nuevo,
  progreso_anterior, progreso_nuevo,
  estado_anterior, estado_nuevo,observacion,
  operacion, usuario
}) {
  const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_periodo_escolar (
      id_periodo, anio_anterior, anio_nuevo,
      descripcion_anterior, descripcion_nuevo,
      progreso_anterior, progreso_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;

  const values = [
    id_periodo,
    anio_anterior, anio_nuevo,
    descripcion_anterior, descripcion_nuevo,
    progreso_anterior, progreso_nuevo,
    estado_anterior, estado_nuevo,observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de periodo registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de periodo:", err);
    throw err;
  }
}

// Insertar periodo
async function insertarPeriodo(datos, usuarioModificador) {
  const { anio, descripcion,progreso } = datos;
 
  const sqlCheck = `SELECT 1 FROM tb_periodo_escolar WHERE anio = $1`;
  const checkResult = await pool.query(sqlCheck, [anio]);

  if (checkResult.rowCount > 0) { 
    throw new Error("El periodo escolar ya existe");
  }

  const sqlInsert = `
    INSERT INTO tb_periodo_escolar (anio, descripcion, progreso, estado)
    VALUES ($1, $2, $3, true)
    RETURNING id_periodo
  `;

  try {
    const result = await pool.query(sqlInsert, [anio, descripcion, progreso]);
    const id_periodo = result.rows[0].id_periodo;

    await registrarAuditoriaPeriodo({
      id_periodo,
      anio_anterior: null,
      anio_nuevo: anio,
      descripcion_anterior: null,
      descripcion_nuevo: descripcion,
      progreso_anterior: null,
      progreso_nuevo: progreso,
      estado_anterior: null,
      estado_nuevo: true,
       observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Periodo insertado y auditado", id: id_periodo };
  } catch (err) {
    console.error("❌ Error al insertar periodo:", err);
    throw err;
  }
}

// Obtener periodos activos
async function obtenerPeriodos() {
  const sql = "SELECT * FROM tb_periodo_escolar WHERE progreso = 'En curso' ORDER BY anio DESC";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener periodos activos:", err);
    throw err;
  }
}

// Obtener todos los periodos
async function obtenerTodosLosPeriodos() {
  const sql = "SELECT * FROM tb_periodo_escolar ORDER BY anio DESC";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los periodos:", err);
    throw err;
  }
}
async function obtenerSeccionesPorPeriodo(id) {

     const sql = `
    select s.nombre, 
    s.id_seccion,
    s.grado AS id_grado,
    s.aula AS id_aula,
    a.numero_aula AS aula,
    g.nivel || ' - ' || g.anio AS grado
    FROM tb_seccion S
    JOIN tb_aula a ON s.aula = a.id_aula
    JOIN tb_grado g ON s.grado = g.id_grado
    WHERE s.periodo = $1 AND s.estado=true
    `;
 
 
  try {

    const result =  await pool.query(sql, [
      id
    ]);
 
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos las secciones por un periodo:", err);
    throw err;
  }
}
// Obtener todos los periodos de auditoria
async function obtenerTodosLosPeriodosAuditoria() {
  const sql = "SELECT * FROM tb_audit_periodo_escolar";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los periodos:", err);
    throw err;
  }
}

// Actualizar periodo
async function actualizarPeriodo(id, datos, usuarioModificador) {
  const { anio, descripcion, progreso, estado,observacion } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_periodo_escolar WHERE id_periodo = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Periodo no encontrado");
    }

    const duplicado = await pool.query(
      "SELECT id_periodo FROM tb_periodo_escolar WHERE anio = $1 AND id_periodo <> $2",
      [anio, id]
    );

    if (duplicado.rowCount > 0) {
      throw new Error("El anio de periodo escolar ya está en uso");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_periodo_escolar
      SET anio = $1, descripcion = $2, progreso = $3, estado = $4
      WHERE id_periodo = $5
    `;

    await pool.query(sqlUpdate, [
      anio,
      descripcion,
      progreso,
      estado,
      id
    ]);

    await registrarAuditoriaPeriodo({
      id_periodo: id,
      anio_anterior: anterior.anio,
      anio_nuevo: anio,
      descripcion_anterior: anterior.descripcion,
      descripcion_nuevo: descripcion,
      progreso_anterior: anterior.progreso,
      progreso_nuevo: progreso,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
        observacion:observacion,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Periodo actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar periodo:", err);
    throw err;
  }
}

// Eliminar periodo (borrado lógico)
async function eliminarPeriodo(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_periodo_escolar WHERE id_periodo = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Periodo no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_periodo_escolar SET estado = false WHERE id_periodo = $1",
      [id]
    );

    await registrarAuditoriaPeriodo({
      id_periodo: id,
      anio_anterior: anterior.anio,
      anio_nuevo: anterior.anio,
      descripcion_anterior: anterior.descripcion,
      descripcion_nuevo: anterior.descripcion,
      progreso_anterior: anterior.progreso,
      progreso_nuevo: anterior.progreso,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
        observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Periodo eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar periodo:", err);
    throw err;
  }
}

module.exports = {
  insertarPeriodo,
  obtenerTodosLosPeriodosAuditoria,
  obtenerPeriodos,
  obtenerTodosLosPeriodos,
  obtenerSeccionesPorPeriodo,
  actualizarPeriodo,
  eliminarPeriodo
};
