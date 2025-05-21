const db = require("../database/dbInstance.js");


const auditarGrado = (datos) => {
  const {
    id_grado,nombre_anterior, nombre_nuevo,descripcion_anterior, descripcion_nueva,
    estado_anterior, estado_nuevo,operacion, fecha_modificacion,usuario_modificador} = datos;

  const sqlAudit = `INSERT INTO tb_audit_grado (id_grado,nombre_anterior, nombre_nuevo,descripcion_anterior, descripcion_nueva,
      estado_anterior, estado_nuevo,operacion, fecha_modificacion, usuario_modificador
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

  return new Promise((resolve, reject) => {
    db.run(sqlAudit, [id_grado,nombre_anterior, nombre_nuevo,descripcion_anterior, descripcion_nueva,
      estado_anterior, estado_nuevo,operacion, fecha_modificacion, usuario_modificador], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
};


const insertarGrado = (datos, usuarioModificador) => {
   const { nombre_grado, descripcion_grado } = datos;
   return new Promise((resolve, reject) => {

    const sqlInsert = `INSERT INTO tb_grado (nombre_grado, descripcion_grado, estado)
    VALUES (?, ?, 1)`;

    db.run(sqlInsert, [nombre_grado, descripcion_grado], function (err) {
      if (err) return reject(err);

        const id_grado = this.lastID;
        const fecha = new Date().toISOString();
        auditarGrado({id_grado,nombre_anterior: null,nombre_nuevo: nombre_grado,descripcion_anterior: null,
          descripcion_nueva: descripcion_grado,estado_anterior: null,estado_nuevo: 1,operacion: 'INSERT',
          fecha_modificacion: fecha,usuario_modificador: usuarioModificador.usuario})
          .then(() => resolve({ mensaje: "Grado insertado y auditado", id: id_grado }))
          .catch(reject);
    });
  });
};

const obtenerGrados = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_grado WHERE estado = 1", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodosLosGrados = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_grado", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const actualizarGrado = (id, datos, usuarioModificador) => {
   const { nombre_grado, descripcion_grado, estado } = datos;

  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM tb_grado WHERE id_grado = ?", [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Grado no encontrado"));

      const sqlUpdate = `UPDATE tb_grado SET nombre_grado = ?, descripcion_grado = ?, estado = ? WHERE id_grado = ?`;

      db.run(sqlUpdate, [nombre_grado, descripcion_grado, estado, id], function (err2) {
        if (err2) return reject(err2);

        const fecha = new Date().toISOString();
        auditarGrado({id_grado: id,nombre_anterior: anterior.nombre_grado,nombre_nuevo: nombre_grado,
          descripcion_anterior: anterior.descripcion_grado,descripcion_nueva: descripcion_grado,estado_anterior: anterior.estado,
          estado_nuevo: estado,operacion: 'UPDATE',fecha_modificacion: fecha,usuario_modificador: usuarioModificador.usuario})
          .then(() => resolve({ mensaje: "Grado actualizado y auditado" }))
          .catch(reject);
      });
    });
  });
};

const eliminarGrado = (id, usuarioModificador) => {
   return new Promise((resolve, reject) => {

    db.get("SELECT * FROM tb_grado WHERE id_grado = ?", [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Grado no encontrado"));

      db.run("UPDATE tb_grado SET estado = 0 WHERE id_grado = ?", [id], function (err2) {
        if (err2) return reject(err2);

        const fecha = new Date().toISOString();
        auditarGrado({id_grado: id,nombre_anterior: anterior.nombre_grado,nombre_nuevo: anterior.nombre_grado,
          descripcion_anterior: anterior.descripcion_grado,descripcion_nueva: anterior.descripcion_grado,estado_anterior: anterior.estado,
          estado_nuevo: 0,operacion: 'DELETE',fecha_modificacion: fecha,usuario_modificador: usuarioModificador.usuario})
          
          .then(() => resolve({ mensaje: "Grado eliminado (estado = 0) y auditado" }))
          .catch(reject);
      });
    });
  });
};


module.exports = {
  insertarGrado,
  obtenerGrados,
  actualizarGrado,
  eliminarGrado,obtenerTodosLosGrados
};