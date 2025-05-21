const db = require("../database/dbInstance.js");


function registrarAuditoriaAula({
  id_aula,
  numero_anterior, numero_nuevo,
  grado_anterior, grado_nuevo,
  aforo_anterior, aforo_nuevo,
  ubicacion_anterior, ubicacion_nueva,
  estado_anterior, estado_nuevo,
  operacion, usuario
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sqlAudit = `
      INSERT INTO tb_audit_aula (
        id_aula, numero_anterior, numero_nuevo,
        grado_anterior, grado_nuevo,
        aforo_anterior, aforo_nuevo,
        ubicacion_anterior, ubicacion_nueva,
        estado_anterior, estado_nuevo,
        operacion, fecha_modificacion, usuario_modificador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlAudit, [
      id_aula,
      numero_anterior, numero_nuevo,
      grado_anterior, grado_nuevo,
      aforo_anterior, aforo_nuevo,
      ubicacion_anterior, ubicacion_nueva,
      estado_anterior, estado_nuevo,
      operacion, fecha, usuario
    ], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

const crearAula = (datos, usuarioModificador) => {

  const { numero_aula, grado, aforo, ubicacion } = datos;

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_aula (numero_aula, grado, aforo, ubicacion, estado)
      VALUES (?, ?, ?, ?, 1)
    `;

    db.run(sql, [numero_aula, grado, aforo, ubicacion], function (err) {
      if (err) return reject(err);

      const id_aula = this.lastID;

      registrarAuditoriaAula({
        id_aula,
        numero_anterior: null,
        numero_nuevo: numero_aula,
        grado_anterior: null,
        grado_nuevo: grado,
        aforo_anterior: null,
        aforo_nuevo: aforo,
        ubicacion_anterior: null,
        ubicacion_nueva: ubicacion,
        estado_anterior: null,
        estado_nuevo: 1,
        operacion: 'INSERT',
        usuario: usuarioModificador.usuario
      })
        .then(() => resolve({ mensaje: "Aula insertada y auditada", id: id_aula }))
        .catch(reject);
    });
  });
};

const obtenerAulas = () => {
  const sql = `SELECT * FROM tb_aula WHERE estado = 1`;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodasLasAulas = () => {
  const sql = `SELECT * FROM tb_aula`;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const actualizarAula = (id, datos,usuarioModificador) => {
  const { numero_aula, grado, aforo, ubicacion, estado } = datos;

  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tb_aula WHERE id_aula = ?`, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error('Aula no encontrada'));

      const sql = `
        UPDATE tb_aula
        SET numero_aula = ?, grado = ?, aforo = ?, ubicacion = ?, estado = ?
        WHERE id_aula = ?
      `;

      db.run(sql, [numero_aula, grado, aforo, ubicacion, estado, id], function (err) {
        if (err) return reject(err);

        registrarAuditoriaAula({
          id_aula: id,
          numero_anterior: anterior.numero_aula,
          numero_nuevo: numero_aula,
          grado_anterior: anterior.grado,
          grado_nuevo: grado,
          aforo_anterior: anterior.aforo,
          aforo_nuevo: aforo,
          ubicacion_anterior: anterior.ubicacion,
          ubicacion_nueva: ubicacion,
          estado_anterior: anterior.estado,
          estado_nuevo: estado,
          operacion: 'UPDATE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Aula actualizada y auditada" }))
          .catch(reject);
      });
    });
  });
};


const eliminarAula = (id,usuarioModificador) => {
 return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tb_aula WHERE id_aula = ?`, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error('Aula no encontrada'));

      const sql = `UPDATE tb_aula SET estado = 0 WHERE id_aula = ?`;

      db.run(sql, [id], function (err) {
        if (err) return reject(err);

        registrarAuditoriaAula({
          id_aula: id,
          numero_anterior: anterior.numero_aula,
          numero_nuevo: anterior.numero_aula,
          grado_anterior: anterior.grado,
          grado_nuevo: anterior.grado,
          aforo_anterior: anterior.aforo,
          aforo_nuevo: anterior.aforo,
          ubicacion_anterior: anterior.ubicacion,
          ubicacion_nueva: anterior.ubicacion,
          estado_anterior: anterior.estado,
          estado_nuevo: 0,
          operacion: 'DELETE',
          usuario: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Aula eliminada y auditada" }))
          .catch(reject);
      });
    });
  });
};



module.exports = {
  crearAula,
  obtenerAulas,
  actualizarAula,
  eliminarAula,
  obtenerTodasLasAulas
};