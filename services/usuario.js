const db = require("../database/dbInstance.js"); 
const {encrypt,compare}=require('../utils/handlePassword.js')
const {tokensign}=require('../utils/handleJwt.js') 


function registrarAuditoriaUsuario({
  id_usuario,
  usuario_anterior, usuario_nuevo,
  estado_anterior, estado_nuevo,
  password_anterior, password_nuevo,
  rol_anterior, rol_nuevo,
  operacion,
  usuario_modificador
}) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    const sqlAudit = `
      INSERT INTO tb_audit_usuario (
        id_usuario,
        usuario_anterior, usuario_nuevo,
        estado_anterior, estado_nuevo,
        password_anterior, password_nuevo,
        rol_anterior, rol_nuevo,
        operacion,
        fecha_modificacion,
        usuario_modificador
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlAudit, [
      id_usuario,
      usuario_anterior, usuario_nuevo,
      estado_anterior, estado_nuevo,
      password_anterior, password_nuevo,
      rol_anterior, rol_nuevo,
      operacion,
      fecha,
      usuario_modificador
    ], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}



const obtenerUsuario = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_usuario WHERE estado = 1", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const obtenerTodosLosUsuario = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tb_usuario", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

 
const insertarUsuario = async (datos,usuarioModificador) => {
   const { usuario, password, rol } = datos;
  const hashedPassword = await encrypt(password);

   return new Promise((resolve, reject) => {
    const sqlInsert = `
      INSERT INTO tb_usuario (usuario, estado, password, rol)
      VALUES (?, 1, ?, ?)
    `;

    db.run(sqlInsert, [usuario, hashedPassword, rol], function (err) {
      if (err) return reject(err);

      registrarAuditoriaUsuario({
        id_usuario: this.lastID,
        usuario_anterior: null,
        usuario_nuevo: usuario,
        estado_anterior: null,
        estado_nuevo: 1,
        password_anterior: null,
        password_nuevo: hashedPassword,
        rol_anterior: null,
        rol_nuevo: rol,
        operacion: 'INSERT',
        usuario_modificador: usuarioModificador.usuario
      })
        .then(() => resolve({ mensaje: 'Usuario registrado y auditado' }))
        .catch(reject);
    });
  });
};

const loginUsuario = async ({usuario, password}) => {
    
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM tb_usuario WHERE usuario = ?`;
    
    db.get(sql, [usuario], async (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);  
      const passwordValido = await compare(password, row.password); 
      if (!passwordValido) return resolve(false); 

       const token = await tokensign(row);


      resolve({ token, usuario: row.usuario, rol: row.rol });
    });
  });
};


const actualizarUsuario =async  (id, datos, usuarioModificador) => {
  const { usuario, password, rol, estado } = datos;
  const hashedPassword = await encrypt(password);

   return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tb_usuario WHERE id_usuario = ?`, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Usuario no encontrado"));

      const sqlUpdate = `
        UPDATE tb_usuario
        SET usuario = ?, password = ?, rol = ?, estado = ?
        WHERE id_usuario = ?
      `;

      db.run(sqlUpdate, [usuario, hashedPassword, rol, estado, id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaUsuario({
          id_usuario: id,
          usuario_anterior: anterior.usuario,
          usuario_nuevo: usuario,
          estado_anterior: anterior.estado,
          estado_nuevo: estado,
          password_anterior: anterior.password,
          password_nuevo: hashedPassword,
          rol_anterior: anterior.rol,
          rol_nuevo: rol,
          operacion: 'UPDATE',
          usuario_modificador: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Usuario actualizado y auditado" }))
          .catch(reject);
      });
    });
  });
};


const eliminarUsuario = (id,usuarioModificador) => {
   return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tb_usuario WHERE id_usuario = ?`, [id], (err, anterior) => {
      if (err) return reject(err);
      if (!anterior) return reject(new Error("Usuario no encontrado"));

      db.run(`UPDATE tb_usuario SET estado = 0 WHERE id_usuario = ?`, [id], function (err2) {
        if (err2) return reject(err2);

        registrarAuditoriaUsuario({
          id_usuario: id,
          usuario_anterior: anterior.usuario,
          usuario_nuevo: anterior.usuario,
          estado_anterior: anterior.estado,
          estado_nuevo: 0,
          password_anterior: anterior.password,
          password_nuevo: anterior.password,
          rol_anterior: anterior.rol,
          rol_nuevo: anterior.rol,
          operacion: 'DELETE',
          usuario_modificador: usuarioModificador.usuario
        })
          .then(() => resolve({ mensaje: "Usuario eliminado y auditado" }))
          .catch(reject);
      });
    });
  });
};

const obtenerPerfil = async (id_usuario) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id_usuario, usuario, rol FROM tb_usuario WHERE id_usuario = ?`;

    db.get(sql, [id_usuario], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve(row);
    });
  });
};

module.exports = {
  obtenerUsuario,
  obtenerTodosLosUsuario,
  insertarUsuario,
  actualizarUsuario,loginUsuario,obtenerPerfil,
  eliminarUsuario}