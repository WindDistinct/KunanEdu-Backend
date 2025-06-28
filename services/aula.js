const pool = require("../database/db.js");

// Auditoría de aula
async function registrarAuditoriaAula({
  id_aula,
  numero_anterior, numero_nuevo,
  aforo_anterior, aforo_nuevo,
  ubicacion_anterior, ubicacion_nueva,
  estado_anterior, estado_nuevo,
  observacion,
  operacion, usuario
}) {
 const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_aula (
      id_aula, numero_aula_anterior, numero_aula_nuevo,
      aforo_anterior, aforo_nuevo,
      ubicacion_anterior, ubicacion_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;

  const values = [
    id_aula,
    numero_anterior, numero_nuevo,
    aforo_anterior, aforo_nuevo,
    ubicacion_anterior, ubicacion_nueva,
    estado_anterior, estado_nuevo,observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de aula registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de aula:", err);
    throw err;
  }
}


// Insertar aula
async function insertarAula(datos, usuarioModificador) {
    const { numero_aula, aforo, ubicacion } = datos;
 
  const sqlCheck = `SELECT 1 FROM tb_aula WHERE numero_aula = $1`;
  const checkResult = await pool.query(sqlCheck, [numero_aula]);

  if (checkResult.rowCount > 0) { 
    throw new Error("El número de aula ya existe");
  }

  const sqlInsert = `
    INSERT INTO tb_aula (numero_aula, aforo, ubicacion, estado)
    VALUES ($1, $2, $3, true)
    RETURNING id_aula
  `;

  try {
    const result = await pool.query(sqlInsert, [
      numero_aula, aforo, ubicacion
    ]);
    const id_aula = result.rows[0].id_aula;

    await registrarAuditoriaAula({
      id_aula,
      numero_anterior: null,
      numero_nuevo: numero_aula,
      aforo_anterior: null,
      aforo_nuevo: aforo,
      ubicacion_anterior: null,
      ubicacion_nueva: ubicacion,
      estado_anterior: null,
      estado_nuevo: true,
       observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Aula insertada y auditada", id: id_aula };
  } catch (err) {
    console.error("❌ Error al insertar aula:", err);
    throw err;
  }
}

// Obtener aulas activas
async function obtenerAulas() {
  const sql = "SELECT * FROM tb_aula WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener aulas activas:", err);
    throw err;
  }
}

// Obtener todas las aulas
async function obtenerTodasLasAulas() {
  const sql = "SELECT * FROM tb_aula";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las aulas:", err);
    throw err;
  }
}

// Obtener todas las aulas de auditoria
async function obtenerTodasLasAulasAudit() {
  const sql = "SELECT * FROM tb_audit_aula";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todas las aulas de auditoria:", err);
    throw err;
  }
}

// Actualizar aula
async function actualizarAula(id, datos, usuarioModificador) {
  const { numero_aula, aforo, ubicacion, estado,observacion } = datos;

  try { 
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_aula WHERE id_aula = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Aula no encontrada");
    }
 
    const duplicado = await pool.query(
      "SELECT id_aula FROM tb_aula WHERE numero_aula = $1 AND id_aula <> $2",
      [numero_aula, id]
    );

    if (duplicado.rowCount > 0) {
      throw new Error("El número de aula ya está en uso");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_aula
      SET numero_aula = $1, aforo = $2, ubicacion = $3, estado = $4
      WHERE id_aula = $5
    `;

    await pool.query(sqlUpdate, [
      numero_aula, aforo, ubicacion, estado, id
    ]);

    await registrarAuditoriaAula({
      id_aula: id,
      numero_anterior: anterior.numero_aula,
      numero_nuevo: numero_aula,
      aforo_anterior: anterior.aforo,
      aforo_nuevo: aforo,
      ubicacion_anterior: anterior.ubicacion,
      ubicacion_nueva: ubicacion,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      observacion:observacion,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Aula actualizada y auditada",datos };
  } catch (err) {
    console.error("❌ Error al actualizar aula:", err);
    throw err;
  }
}

// Eliminar aula (borrado lógico)
async function eliminarAula(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_aula WHERE id_aula = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Aula no encontrada");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_aula SET estado = false WHERE id_aula = $1",
      [id]
    );

    await registrarAuditoriaAula({
      id_aula: id,
      numero_anterior: anterior.numero_aula,
      numero_nuevo: anterior.numero_aula,
      aforo_anterior: anterior.aforo,
      aforo_nuevo: anterior.aforo,
      ubicacion_anterior: anterior.ubicacion,
      ubicacion_nueva: anterior.ubicacion,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
       observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Aula eliminada (estado = false) y auditada" };
  } catch (err) {
    console.error("❌ Error al eliminar aula:", err);
    throw err;
  }
}

module.exports = {
  insertarAula,
  obtenerAulas,
  obtenerTodasLasAulasAudit,
  obtenerTodasLasAulas,
  actualizarAula,
  eliminarAula
};
