const pool = require("../database/db.js");

// Auditoría de alumno
async function registrarAuditoriaAlumno({
  id_alumno,
  nombre_anterior, nombre_nuevo,
  apellido_paterno_anterior, apellido_paterno_nuevo,
  apellido_materno_anterior, apellido_materno_nuevo,
  numero_documento_anterior, numero_documento_nuevo,
  direccion_anterior, direccion_nuevo,
  telefono_anterior, telefono_nuevo,
  fecha_nacimiento_anterior, fecha_nacimiento_nuevo,
  estado_anterior, estado_nuevo,observacion,
  operacion, usuario
}) {
  const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_alumno (
      id_alumno,
      nombre_anterior, nombre_nuevo,
      apellido_paterno_anterior, apellido_paterno_nuevo,
      apellido_materno_anterior, apellido_materno_nuevo,
      numero_documento_anterior, numero_documento_nuevo,
      direccion_anterior, direccion_nuevo,
      telefono_anterior, telefono_nuevo,
      fecha_nacimiento_anterior, fecha_nacimiento_nuevo,
      estado_anterior, estado_nuevo,observacion,
      operacion, fecha_modificacion, usuario_modificador
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19, $20, $21
    )
  `;

  const values = [
    id_alumno,
    nombre_anterior, nombre_nuevo,
    apellido_paterno_anterior, apellido_paterno_nuevo,
    apellido_materno_anterior, apellido_materno_nuevo,
    numero_documento_anterior, numero_documento_nuevo,
    direccion_anterior, direccion_nuevo,
    telefono_anterior, telefono_nuevo,
    fecha_nacimiento_anterior, fecha_nacimiento_nuevo,
    estado_anterior, estado_nuevo, observacion,
    operacion, fecha, usuario
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de alumno registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de alumno:", err);
    throw err;
  }
}

// Insertar alumno
async function insertarAlumno(datos, usuarioModificador) {
  const {
    nombre, apellido_paterno, apellido_materno,
    tipo_documento,numero_documento, direccion, telefono, fecha_nacimiento
  } = datos;

  const sqlInsert = `
    INSERT INTO tb_alumno (
      nombre, apellido_paterno, apellido_materno,
      tipo_documento,numero_documento, direccion, telefono, fecha_nacimiento, estado
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, true
    )
    RETURNING id_alumno
  `;

  try {
    const result = await pool.query(sqlInsert, [
      nombre, apellido_paterno, apellido_materno,
      tipo_documento,numero_documento, direccion, telefono, fecha_nacimiento
    ]);
    const id_alumno = result.rows[0].id_alumno;

    await registrarAuditoriaAlumno({
      id_alumno,
      nombre_anterior: null,
      nombre_nuevo: nombre,
      apellido_paterno_anterior: null,
      apellido_paterno_nuevo: apellido_paterno,
      apellido_materno_anterior: null,
      apellido_materno_nuevo: apellido_materno,
      numero_documento_anterior: null,
      numero_documento_nuevo: numero_documento,
      direccion_anterior: null,
      direccion_nuevo: direccion,
      telefono_anterior: null,
      telefono_nuevo: telefono,
      fecha_nacimiento_anterior: null,
      fecha_nacimiento_nuevo: fecha_nacimiento,
      estado_anterior: null,
      estado_nuevo: true,
      observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Alumno insertado y auditado", id: id_alumno };
  } catch (err) {
    console.error("❌ Error al insertar alumno:", err);
    throw err;
  }
}

// Obtener alumnos activos
async function obtenerAlumnos() {
  const sql = "SELECT * FROM tb_alumno WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener alumnos:", err);
    throw err;
  }
}
async function obtenerAlumnosAula(aula,cursoseccion) {
   const sql = `
  select d.id_curso_seccion, c.nombre_curso,s.nombre ||' '||g.anio as seccion,m.id_matricula,l.id_alumno,l.nombre ||' '||l.apellido_paterno||' '||l.apellido_materno  as nombre_completo ,a.numero_aula as numero_aula, s.nombre ||' '|| g.anio ||' '||g.nivel as seccion, p.anio as periodo from tb_matricula m
   JOIN tb_seccion s ON m.seccion=s.id_seccion
      JOIN tb_curso_seccion d ON s.id_seccion=d.seccion
	  JOIN tb_curso c ON d.curso=c.id_curso
    JOIN tb_periodo_escolar p ON s.periodo=p.id_periodo
    JOIN tb_grado g ON s.grado=g.id_grado
    JOIN tb_aula a ON s.aula=a.id_aula
    JOIN tb_alumno l ON m.alumno=l.id_alumno
    WHERE m.condicion='Matriculado' AND a.numero_aula=$1 AND d.id_curso_seccion=$2 AND s.estado=true 
  `;
  try {
    const result = await pool.query(sql, [aula,cursoseccion]);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener los alumnos:", err);
    throw err;
  }
}


async function obtenerAlumnosPorPeriodo(idPeriodo) {
  const sql = `
    SELECT DISTINCT a.id_alumno, a.nombre, a.apellido_paterno, a.apellido_materno,
           a.numero_documento, a.direccion, a.telefono, a.fecha_nacimiento, a.estado
    FROM tb_alumno a
    JOIN tb_matricula m ON a.id_alumno = m.alumno
    JOIN tb_seccion s ON m.seccion = s.id_seccion
    WHERE s.periodo = $1 AND m.condicion = 'Matriculado'
  `;
  try {
    const result = await pool.query(sql, [idPeriodo]);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener alumnos por periodo:", err);
    throw err;
  }
}




// Obtener todos los alumnos
async function obtenerTodosLosAlumnos() {
  const sql = "SELECT * FROM tb_alumno";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los alumnos:", err);
    throw err;
  }
}
// Obtener todos los alumnos de la tabla auditoria
async function obtenerTodosLosAlumnosAudit() {
  const sql = "SELECT * FROM tb_audit_alumno";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los alumnos de auditoria:", err);
    throw err;
  }
}
// Actualizar alumno
async function actualizarAlumno(id, datos, usuarioModificador) {
  const {
    nombre, apellido_paterno, apellido_materno,
    tipo_documento,numero_documento, direccion, telefono, fecha_nacimiento, estado,observacion
  } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_alumno WHERE id_alumno = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Alumno no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    const sqlUpdate = `
      UPDATE tb_alumno
      SET nombre = $1, apellido_paterno = $2, apellido_materno = $3,
          tipo_documento =$4, numero_documento = $5, direccion = $6, telefono = $7, fecha_nacimiento = $8,
          estado = $9
      WHERE id_alumno = $10
    `;

    await pool.query(sqlUpdate, [
      nombre, apellido_paterno, apellido_materno,
      tipo_documento, numero_documento,direccion, telefono, fecha_nacimiento,
      estado, id
    ]);

    await registrarAuditoriaAlumno({
      id_alumno: id,
      nombre_anterior: anterior.nombre,
      nombre_nuevo: nombre,
      apellido_paterno_anterior: anterior.apellido_paterno,
      apellido_paterno_nuevo: apellido_paterno,
      apellido_materno_anterior: anterior.apellido_materno,
      apellido_materno_nuevo: apellido_materno,
      numero_documento_anterior: anterior.numero_documento,
      numero_documento_nuevo: numero_documento,
      direccion_anterior: anterior.direccion,
      direccion_nuevo: direccion,
      telefono_anterior: anterior.telefono,
      telefono_nuevo: telefono,
      fecha_nacimiento_anterior: anterior.fecha_nacimiento,
      fecha_nacimiento_nuevo: fecha_nacimiento,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
       observacion: observacion,
      operacion: 'UPDATE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Alumno actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar alumno:", err);
    throw err;
  }
}

// Eliminar alumno (borrado lógico)
async function eliminarAlumno(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_alumno WHERE id_alumno = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Alumno no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_alumno SET estado = false WHERE id_alumno = $1",
      [id]
    );

    await registrarAuditoriaAlumno({
      id_alumno: id,
      nombre_anterior: anterior.nombre,
      nombre_nuevo: anterior.nombre,
      apellido_paterno_anterior: anterior.apellido_paterno,
      apellido_paterno_nuevo: anterior.apellido_paterno,
      apellido_materno_anterior: anterior.apellido_materno,
      apellido_materno_nuevo: anterior.apellido_materno,
      numero_documento_anterior: anterior.numero_documento,
      numero_documento_nuevo: anterior.numero_documento,
      direccion_anterior: anterior.direccion,
      direccion_nuevo: anterior.direccion,
      telefono_anterior: anterior.telefono,
      telefono_nuevo: anterior.telefono,
      fecha_nacimiento_anterior: anterior.fecha_nacimiento,
      fecha_nacimiento_nuevo: anterior.fecha_nacimiento,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario: usuarioModificador.usuario
    });

    return { mensaje: "Alumno eliminado (estado = false) y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar alumno:", err);
    throw err;
  }
}

module.exports = {
  insertarAlumno,
  obtenerAlumnos,
  obtenerTodosLosAlumnos,
  actualizarAlumno,
  eliminarAlumno,
  obtenerAlumnosAula,
  obtenerTodosLosAlumnosAudit, 
   obtenerAlumnosPorPeriodo
};
