const db = require("../database/dbInstance.js");

function registrarAuditoriaNota({
  id_nota,nota_anterior,nota_nueva,
  estado_anterior,estado_nuevo,operacion,usuario}) {

  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sqlAudit = `INSERT INTO tb_audit_nota (id_nota, nota_anterior, nota_nueva,
        estado_anterior, estado_nuevo,operacion, fecha_modificacion, usuario_modificador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sqlAudit, [id_nota,nota_anterior,nota_nueva,
      estado_anterior,estado_nuevo,operacion,fecha,usuario], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}


const obtenerNotas = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_nota WHERE estado = 1", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const insertarNota = (datos, usuarioModificador) => {
  const { alumno, curso, periodo, trimestre, nota } = datos;

  return new Promise((resolve, reject) => {
    const sqlInsert = `
      INSERT INTO tb_nota (alumno, curso, periodo, trimestre, nota, estado)
      VALUES (?, ?, ?, ?, ?, 1)`;

    db.run(sqlInsert, [alumno, curso, periodo, trimestre, nota], function (err) {
      if (err) return reject(err);

      const id_nota = this.lastID;
      registrarAuditoriaNota({id_nota,nota_anterior: null,nota_nueva: nota,estado_anterior: null,
        estado_nuevo: 1,operacion: 'INSERT',usuario: usuarioModificador.usuario
      })
        .then(() => resolve({ mensaje: "Nota insertada y auditada", id: id_nota }))
        .catch(reject);
    });
  });
};
const obtenerTodasLasNotas = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_nota", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const actualizarNota = (id, datos, usuarioModificador) => {
  const { nota, estado } = datos;

  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_nota WHERE id_nota = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior || Object.keys(anterior).length === 0) return reject(new Error("Nota no encontrada"));
  
      const sqlUpdate = `
        UPDATE tb_nota SET nota = ?, estado = ?
        WHERE id_nota = ?`;

      db.run(sqlUpdate, [nota, estado, id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaNota({id_nota: id,nota_anterior: anterior.nota,nota_nueva: nota,
          estado_anterior: anterior.estado,estado_nuevo: estado,operacion: 'UPDATE',usuario: usuarioModificador.usuario})
          .then(() => resolve({ mensaje: "Nota actualizada y auditada" }))
          .catch(reject);
      });
    });
  });
};

const eliminarNota = (id, usuarioModificador) => {
  return new Promise((resolve, reject) => {
    const sqlBuscar = `SELECT * FROM tb_nota WHERE id_nota = ?`;

    db.get(sqlBuscar, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior || Object.keys(anterior).length === 0) return reject(new Error("Nota no encontrada"));

      const sqlUpdate = `UPDATE tb_nota SET estado = 0 WHERE id_nota = ?`;

      db.run(sqlUpdate, [id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaNota({id_nota: id,nota_anterior: anterior.nota,nota_nueva: anterior.nota,
          estado_anterior: anterior.estado,estado_nuevo: 0,operacion: 'DELETE',usuario: usuarioModificador.usuario})
          
          .then(() => resolve({ mensaje: "Nota eliminada (estado = 0) y auditada" }))
          .catch(reject);
      });
    });
  });
};


module.exports = {
  insertarNota,
  obtenerNotas,obtenerTodasLasNotas,
  actualizarNota,
  eliminarNota
};