const pool = require("../database/db.js");

// Auditoría de examen
async function registrarAuditoriaExamen({
  id_examen,
  matricula_anterior, matricula_nuevo,
  curso_seccion_anterior, curso_seccion_nuevo,
  bimestre_anterior, bimestre_nuevo,
  nota_anterior, nota_nuevo,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
 const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_examen (
      id_examen, 
      matricula_anterior, matricula_nuevo,
     curso_seccion_anterior, curso_seccion_nuevo,
      bimestre_anterior, bimestre_nuevo,
      nota_anterior, nota_nuevo,
      estado_anterior, estado_nuevo,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  `;

  const values = [
    id_examen,
    matricula_anterior, matricula_nuevo,
  curso_seccion_anterior, curso_seccion_nuevo,
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
  const { matricula, cursoseccion, bimestre, nota } = datos;

  const sqlInsert = `
    INSERT INTO tb_examen (matricula, curso_seccion, bimestre, nota, estado)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id_examen
  `;

  try {
    const result = await pool.query(sqlInsert, [matricula, cursoseccion, bimestre, nota]);
    const id_examen = result.rows[0].id_examen;

    await registrarAuditoriaExamen({
      id_examen,
      matricula_anterior: null,
      matricula_nuevo: matricula,
      curso_seccion_anterior: null,
      curso_seccion_nuevo: cursoseccion,
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
async function obtenerNotasPorBimestre(aula,bimestre,cursoseccion) {
   const sql = `
  SELECT 
      x.nota,
      m.id_matricula,
      l.id_alumno,
      l.nombre || ' ' || l.apellido_paterno || ' ' || l.apellido_materno AS nombre_completo,
      a.numero_aula,
      s.nombre || ' ' || g.anio || ' ' || g.nivel AS seccion,
      p.anio AS periodo
    FROM tb_examen x
    JOIN tb_matricula m ON x.matricula = m.id_matricula
    JOIN tb_alumno l ON m.alumno = l.id_alumno
    JOIN tb_seccion s ON m.seccion = s.id_seccion
    JOIN tb_aula a ON s.aula = a.id_aula
    JOIN tb_grado g ON s.grado = g.id_grado
    JOIN tb_periodo_escolar p ON s.periodo = p.id_periodo
    WHERE m.condicion = 'Matriculado'
      AND s.estado = true
      AND a.numero_aula=$1 AND x.bimestre=$2
      AND x.curso_seccion = $3

  `;
  try {
    const result = await pool.query(sql, [aula,bimestre,cursoseccion]);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener los alumnos:", err);
    throw err;
  }
}
async function obtenerNotasPorCurso(docente,periodo,cursoseccion) {
   const sql = `
SELECT  
e.id_examen,
cs.id_curso_seccion,
m.id_matricula,
e.estado,
  a.id_alumno,
  a.nombre || ' ' || a.apellido_paterno || ' ' || a.apellido_materno AS nombre_completo,
  c.nombre_curso,
  e.nota,
  e.bimestre, 
  s.nombre AS seccion,
  g.nivel,
  doc.id_emp,
  g.anio, 
  au.numero_aula
FROM tb_examen e
JOIN tb_matricula m ON e.matricula = m.id_matricula
JOIN tb_alumno a ON m.alumno = a.id_alumno
JOIN tb_curso_seccion cs ON e.curso_seccion = cs.id_curso_seccion 
JOIN tb_empleado doc ON cs.docente = doc.id_emp
JOIN tb_seccion s ON m.seccion = s.id_seccion 
JOIN tb_grado g ON s.grado = g.id_grado
JOIN tb_aula au ON s.aula = au.id_aula
JOIN tb_curso_grado cg 
  ON cs.curso = cg.curso 
  AND s.grado = cg.grado
  JOIN tb_curso c ON cg.curso = c.id_curso
JOIN tb_periodo_escolar pe ON s.periodo = pe.id_periodo
WHERE m.condicion = 'Matriculado' AND s.estado = true
AND doc.id_emp=$1 AND pe.id_periodo=$2 AND cs.id_curso_seccion=$3

  `;
  try {
    const result = await pool.query(sql, [docente,periodo,cursoseccion]);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener las notas por curso:", err);
    throw err;
  }
}

async function insertarMultiplesNotas(listaNotas, usuarioModificador) {
  const resultados = [];

  for (const datos of listaNotas) {
    const { matricula, cursoseccion, bimestre, nota } = datos;

    const sqlInsert = `
      INSERT INTO tb_examen (matricula, curso_seccion, bimestre, nota, estado)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id_examen
    `;

    const result = await pool.query(sqlInsert, [matricula, cursoseccion, bimestre, nota]);
    const id_examen = result.rows[0].id_examen;

    await registrarAuditoriaExamen({
      id_examen,
      matricula_anterior: null,
      matricula_nuevo: matricula,
      curso_seccion_anterior: null,
      curso_seccion_nuevo: cursoseccion,
      bimestre_anterior: null,
      bimestre_nuevo: bimestre,
      nota_anterior: null,
      nota_nuevo: nota,
      estado_anterior: null,
      estado_nuevo: true,
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    resultados.push({ id_examen, matricula, cursoseccion, bimestre, nota });
  }

  return resultados;
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
// Obtener todos los exámenes de auditoria
async function obtenerTodosLosExamenesAuditoria() {
  const sql = "SELECT * FROM tb_audit_examen";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los exámenes de auditoria:", err);
    throw err;
  }
}
// Obtener todos los exámenes
async function obtenerExamenesAlumno(id) {
   const sql = `
    SELECT 
      a.id_alumno,
      CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) AS nombre_alumno,
      c.nombre_curso,
      s.nombre AS nombre_seccion,
      e.bimestre,
      e.nota
    FROM tb_examen e
    JOIN tb_curso c ON c.id_curso = e.curso
    JOIN tb_seccion_alumno sa ON sa.id_seccion_alumno = e.seccion
    JOIN tb_alumno a ON a.id_alumno = sa.alumno
    JOIN tb_seccion s ON s.id_seccion = sa.seccion
    WHERE a.id_alumno = $1
    ORDER BY c.nombre_curso, e.bimestre
  `;
   try {
    const result = await pool.query(sql, [id]);
    return result.rows;
  }  catch (err) {
    console.error("❌ Error al obtener todos los exámenes:", err);
    throw err;
  }
}
// Actualizar examen
async function actualizarExamen(id, datos, usuarioModificador) {
  const { matricula, cursoseccion, bimestre, nota, estado } = datos;

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
      SET matricula = $1, curso_seccion = $2, bimestre = $3, nota = $4, estado = $5
      WHERE id_examen = $6
    `;

    await pool.query(sqlUpdate, [
      matricula, cursoseccion, bimestre, nota, estado, id
    ]);

    await registrarAuditoriaExamen({
      id_examen: id,
      matricula_anterior: anterior.matricula,
      matricula_nuevo: matricula,
      curso_seccion_anterior: anterior.cursoseccion,
      curso_seccion_nuevo: cursoseccion,
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

      const sqlUpdate = `
      UPDATE tb_examen
      SET estado = false
      WHERE id_examen = $1
    `;

    await pool.query(sqlUpdate, [id]);

     
    await registrarAuditoriaExamen({
      id_examen: id,
      matricula_anterior: anterior.matricula,
      matricula_nuevo: anterior.matricula,
      curso_seccion_anterior: anterior.cursoseccion,
      curso_seccion_nuevo: anterior.cursoseccion,
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
  obtenerNotasPorCurso,
  obtenerNotasPorBimestre,
  obtenerExamenes,
  obtenerTodosLosExamenes,
  actualizarExamen,insertarMultiplesNotas,
  eliminarExamen,
  obtenerExamenesAlumno,
  obtenerTodosLosExamenesAuditoria
};
