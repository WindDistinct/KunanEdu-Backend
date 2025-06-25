const pool = require("../database/db.js");

// Insertar nota
async function insertarNota(datos, usuarioModificador) {
    const { id_examen, id_matricula, nota } = datos;

    const sqlInsert = `
        INSERT INTO tb_nota (id_examen, id_matricula, nota, estado)
        VALUES ($1, $2, $3, true)
        RETURNING id_nota
    `;

    try {
        const result = await pool.query(sqlInsert, [id_examen, id_matricula, nota]);
        const id_nota = result.rows[0].id_nota;
        return { mensaje: "Nota insertada y auditada", id: id_nota };
    } catch (err) {
        console.error("❌ Error al insertar nota:", err);
        throw err;
    }
}

// Obtener notas activas
async function obtenerNotas() {
    const sql = "SELECT * FROM tb_nota WHERE estado = true";
    try {
        const result = await pool.query(sql);
        return result.rows;
    } catch (err) {
        console.error("❌ Error al obtener notas activas:", err);
        throw err;
    }
}

// Obtener todas las notas
async function obtenerTodasLasNotas() {
    const sql = "SELECT * FROM tb_nota";
    try {
        const result = await pool.query(sql);
        return result.rows;
    } catch (err) {
        console.error("❌ Error al obtener todas las notas:", err);
        throw err;
    }
}

// Actualizar nota
async function actualizarNota(id, datos, usuarioModificador) {
    const { id_matricula, id_examen, nota, estado } = datos;

    try {
        const resultAnterior = await pool.query("SELECT * FROM tb_nota WHERE id_nota = $1", [id]);

        if (resultAnterior.rowCount === 0) {
            throw new Error("Nota no encontrada");
        }

        const sqlUpdate = `
            UPDATE tb_nota
            SET id_matricula = $1, id_examen = $2, nota = $3, estado = $4
            WHERE id_nota = $5
        `;

        await pool.query(sqlUpdate, [id_matricula, id_examen, nota, estado, id]);
        return { mensaje: "Nota actualizada y auditada" };
    } catch (err) {
        console.error("❌ Error al actualizar nota:", err);
        throw err;
    }
}

// Eliminar nota (borrado lógico)
async function eliminarNota(id, usuarioModificador) {
    try {
        const resultAnterior = await pool.query("SELECT * FROM tb_nota WHERE id_nota = $1", [id]);

        if (resultAnterior.rowCount === 0) {
            throw new Error("Nota no encontrada");
        }

        await pool.query("UPDATE tb_nota SET estado = false WHERE id_nota = $1", [id]);
        return { mensaje: "Nota eliminada (estado = false)" };
    } catch (err) {
        console.error("❌ Error al eliminar nota:", err);
        throw err;
    }
}

// Generar reporte completo por alumno y periodo
async function generarReporte(periodoId, alumnoId) {
    const sqlMatricula = `
        SELECT s.nombre AS seccion, g.nombre_grado AS grado
        FROM tb_matricula m
        JOIN tb_seccion s ON m.id_seccion = s.id_seccion
        JOIN tb_grado g ON s.id_grado = g.id_grado
        WHERE m.id_alumno = $1
          AND s.id_periodo = $2
          AND m.condicion = 'Matriculado'
          AND m.estado = true
          AND s.estado = true
        LIMIT 1
    `;

    let seccionNombre = "", gradoNombre = "";

    try {
        const matriculaRes = await pool.query(sqlMatricula, [alumnoId, periodoId]);

        if (matriculaRes.rows.length === 0) {
            throw new Error("No se encontró matrícula activa para este alumno en ese periodo.");
        }

        seccionNombre = matriculaRes.rows[0].seccion;
        gradoNombre = matriculaRes.rows[0].grado;
    } catch (err) {
        console.error("❌ Error al obtener matrícula del alumno:", err);
        throw err;
    }

    const sql = `
        SELECT 
            c.nombre_curso AS curso,
            e.bimestre,
            n.nota
        FROM tb_nota n
        JOIN tb_examen e ON n.id_examen = e.id_examen
        JOIN tb_matricula m ON n.id_matricula = m.id_matricula
        JOIN tb_alumno a ON m.id_alumno = a.id_alumno
        JOIN tb_seccion s ON m.id_seccion = s.id_seccion
        JOIN tb_grado g ON s.id_grado = g.id_grado
        JOIN tb_curso_seccion cs ON e.id_curso_seccion = cs.id_curso_seccion
        JOIN tb_curso c ON cs.id_curso = c.id_curso
        WHERE 
            a.id_alumno = $1
            AND s.nombre = $2
            AND g.nombre_grado = $3
            AND s.id_periodo = $4
            AND m.condicion = 'Matriculado'
            AND s.estado = true
            AND n.estado = true
    `;

    try {
        const result = await pool.query(sql, [alumnoId, seccionNombre, gradoNombre, periodoId]);
        const rows = result.rows;

        const reporte = {
            Curso: {},
            "Promedios Generales": {
                "Por Bimestre": {},
                "Promedio Total": 0
            }
        };

        const bimestresAcumulados = {};
        let sumaTotal = 0;
        let cantidadNotas = 0;

        for (const { curso, bimestre, nota } of rows) {
            if (!reporte.Curso[curso]) {
                reporte.Curso[curso] = { Notas: {}, Promedio: 0, Estado: "" };
            }

            reporte.Curso[curso].Notas[`Bimestre ${bimestre}`] = nota;
            reporte.Curso[curso].Promedio += nota;

            bimestresAcumulados[bimestre] = bimestresAcumulados[bimestre] || { suma: 0, count: 0 };
            bimestresAcumulados[bimestre].suma += nota;
            bimestresAcumulados[bimestre].count++;

            sumaTotal += nota;
            cantidadNotas++;
        }

        for (const curso in reporte.Curso) {
            const data = reporte.Curso[curso];
            const cantidad = Object.keys(data.Notas).length;
            data.Promedio = parseFloat((data.Promedio / cantidad).toFixed(2));
            data.Estado = data.Promedio >= 11 ? "Aprobado" : "Desaprobado";
        }

        for (const bimestre in bimestresAcumulados) {
            const { suma, count } = bimestresAcumulados[bimestre];
            reporte["Promedios Generales"]["Por Bimestre"][`Bimestre ${bimestre}`] = parseFloat((suma / count).toFixed(2));
        }

        reporte["Promedios Generales"]["Promedio Total"] = parseFloat((sumaTotal / cantidadNotas).toFixed(2));

        return reporte;
    } catch (err) {
        console.error("❌ Error al generar el reporte final:", err);
        throw err;
    }
}

module.exports = {
    insertarNota,
    obtenerNotas,
    obtenerTodasLasNotas,
    actualizarNota,
    eliminarNota,
    generarReporte
};
