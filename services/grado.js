const pool = require("../database/db.js");

// Auditoría de grado
async function registrarAuditoriaGrado({
  id_grado,
  nivel_anterior, nivel_nuevo,
  anio_anterior, anio_nuevo,
  estado_anterior, estado_nuevo,
  observacion,
  operacion, usuario
}) {
 const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_grado (
      id_grado, nivel_anterior, nivel_nuevo,
      anio_anterior, anio_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11)
  `;

  const values = [
    id_grado,
    nivel_anterior, nivel_nuevo,
    anio_anterior, anio_nuevo,
    estado_anterior, estado_nuevo,observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de grado registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de grado:", err);
    throw err;
  }
}

// Insertar grado
async function insertarGrado(datos, usuarioModificador) {
  const { nivel, anio } = datos;

  const sqlVerificar = `
    SELECT id_grado FROM tb_grado
    WHERE nivel = $1 AND anio = $2
  `;

  const sqlInsert = `
    INSERT INTO tb_grado (nivel, anio, estado)
    VALUES ($1, $2, true)
    RETURNING id_grado
  `;

  try {
    
    const existe = await pool.query(sqlVerificar, [nivel, anio]);
    if (existe.rows.length > 0) {
      throw new Error(`Ya existe un grado con nivel "${nivel}" y año "${anio}".`);
    }
 
    const result = await pool.query(sqlInsert, [
      nivel, anio,
    ]);
    const id_grado = result.rows[0].id_grado;
 
    await registrarAuditoriaGrado({
      id_grado,
      nivel_anterior: null,
      nivel_nuevo: nivel,
      anio_anterior: null,
      anio_nuevo: anio,
      estado_anterior: null,
      estado_nuevo: true,
      observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario,
    });

    return { mensaje: "Grado insertado y auditado", id: id_grado };
  } catch (err) {
    console.error("❌ Error al insertar grado:", err);
    throw err;
  }
}

// Obtener grados activos
async function obtenerGrados() {
  const sql = `
      SELECT * FROM tb_grado where estado=true
      ORDER BY 
        CASE nivel
          WHEN 'inicial' THEN 1
          WHEN 'primaria' THEN 2
          WHEN 'secundaria' THEN 3
          ELSE 4
        END,
        anio;
    `;
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener grados activos:", err);
    throw err;
  }
}

// Obtener todos los grados
async function obtenerTodosLosGrados() {
  const sql = `
      SELECT * FROM tb_grado
      ORDER BY 
        CASE nivel
          WHEN 'inicial' THEN 1
          WHEN 'primaria' THEN 2
          WHEN 'secundaria' THEN 3
          ELSE 4
        END,
        anio;
    `;
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los grados:", err);
    throw err;
  }
}
// Obtener todos los grados de auditoria
async function obtenerTodosLosGradosAuditoria() {
  const sql = "SELECT * FROM tb_audit_grado";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los grados de auditoria:", err);
    throw err;
  }
}
// Actualizar grado
async function actualizarGrado(id, datos, usuarioModificador) {
  const { nivel, anio, estado,observacion } = datos;

  try { 
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_grado WHERE id_grado = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Grado no encontrado");
    }

    const anterior = resultAnterior.rows[0];
 
    const existeDuplicado = await pool.query(
      `SELECT id_grado FROM tb_grado
       WHERE nivel = $1 AND anio = $2 AND id_grado <> $3`,
      [nivel, anio, id]
    );

    if (existeDuplicado.rowCount > 0) {
      throw new Error(`Ya existe otro grado con nivel "${nivel}" y año "${anio}".`);
    }
 
    const sqlUpdate = `
      UPDATE tb_grado
      SET nivel = $1, anio = $2, estado = $3
      WHERE id_grado = $4
    `;

    await pool.query(sqlUpdate, [
      nivel, anio, estado, id
    ]);
 
    await registrarAuditoriaGrado({
      id_grado: id,
      nivel_anterior: anterior.nivel,
      nivel_nuevo: nivel,
      anio_anterior: anterior.anio,
      anio_nuevo: anio,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      observacion:observacion,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Grado actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar grado:", err);
    throw err;
  }
}

 
// Eliminar grado (borrado lógico)
async function eliminarGrado(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_grado WHERE id_grado = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Grado no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_grado SET estado = false WHERE id_grado = $1",
      [id]
    );

    await registrarAuditoriaGrado({
      id_grado: id,
      nivel_anterior: anterior.nivel,
      nivel_nuevo: anterior.nivel,
      anio_anterior: anterior.anio,
      anio_nuevo: anterior.anio,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Grado eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar grado:", err);
    throw err;
  }
}

module.exports = {
  insertarGrado,
  obtenerGrados,
  obtenerTodosLosGrados,
  actualizarGrado,
  obtenerTodosLosGradosAuditoria,
  eliminarGrado
};
