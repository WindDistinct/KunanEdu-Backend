const pool = require("../database/db.js");
const { encrypt, compare } = require("../utils/handlePassword.js");
const { tokensign } = require("../utils/handleJwt.js");

// Auditoría de usuario
async function registrarAuditoriaUsuario({
  id_usuario,
  username_anterior, username_nuevo,
  estado_anterior, estado_nuevo,
  password_anterior, password_nuevo,
  rol_anterior, rol_nuevo,
  empleado_anterior,empleado_nuevo,observacion,
  operacion,
  usuario_modificador
}) {
  const fecha = new Date(); 

  const sqlAudit = `
    INSERT INTO tb_audit_usuario (
      id_usuario,
      username_anterior, username_nuevo,
      estado_anterior, estado_nuevo,
      password_anterior, password_nuevo,
      rol_anterior, rol_nuevo,
      empleado_anterior,empleado_nuevo,observacion,
      operacion,
      fecha_modificacion,
      usuario_modificador
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13,$14,$15)
  `;

  const values = [
    id_usuario,
    username_anterior, username_nuevo,
    estado_anterior, estado_nuevo,
    password_anterior, password_nuevo,
    rol_anterior, rol_nuevo,
    empleado_anterior,empleado_nuevo,observacion,
    operacion,
    fecha,
    usuario_modificador
  ];

  try {
    await pool.query(sqlAudit, values);
    console.log("✔ Auditoría de usuario registrada con éxito.");
  } catch (err) {
    console.error("❌ Error al registrar auditoría de usuario:", err);
    throw err;
  }
}

// Obtener usuarios activos
async function obtenerUsuario() {
  const sql = "SELECT * FROM tb_usuario WHERE estado = true";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener usuarios activos:", err);
    throw err;
  }
}

// Obtener todos los usuarios
async function obtenerTodosLosUsuario() {
  const sql = "SELECT * FROM tb_usuario";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los usuarios:", err);
    throw err;
  }
}
// Obtener todos los usuarios de auditoria
async function obtenerTodosLosUsuariosAudit() {
  const sql = "SELECT * FROM tb_audit_usuario";
  try {
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("❌ Error al obtener todos los usuarios de auditoria:", err);
    throw err;
  }
}

// Insertar usuario
async function insertarUsuario(datos, usuarioModificador) {
  const { username, password, rol,empleado } = datos;
  const hashedPassword = await encrypt(password);

  const sqlCheck = `
    SELECT 1 FROM tb_usuario WHERE empleado = $1
  `;

 
  try {
    const existe = await pool.query(sqlCheck, [empleado]);

    if (existe.rowCount > 0) {
      throw new Error("Este empleado ya tiene un usuario registrado.");
    }

    const sqlInsert = `
    INSERT INTO tb_usuario (username, estado, password, rol,empleado)
    VALUES ($1, true, $2, $3,$4)
    RETURNING id_usuario
    `;

    const result = await pool.query(sqlInsert, [username, hashedPassword, rol,empleado]);
    const id_usuario = result.rows[0].id_usuario;

    await registrarAuditoriaUsuario({
      id_usuario,
      username_anterior: null,
      username_nuevo: username,
      estado_anterior: null,
      estado_nuevo: true,
      password_anterior: null,
      password_nuevo: hashedPassword,
      rol_anterior: null,
      rol_nuevo: rol,
      empleado_anterior:null,
      empleado_nuevo:empleado,
      observacion:'Nuevo registro',
      operacion: 'INSERT',
      usuario_modificador: usuarioModificador.usuario
    });

    return { mensaje: 'Usuario registrado y auditado' };
  } catch (err) {
    console.error("❌ Error al insertar usuario:", err);
    throw err;
  }
}

// Login de usuario
async function loginUsuario({ username, password }) {
  const sql = "SELECT * FROM tb_usuario WHERE username = $1";

  try {
    const result = await pool.query(sql, [username]);
    const row = result.rows[0];

    if (!row) return null;

    const passwordValido = await compare(password, row.password);
    if (!passwordValido) return false;

    const token = await tokensign(row);

    return { token, username: row.username, rol: row.rol,usuario:row.empleado };
  } catch (err) {
    console.error("❌ Error en login:", err);
    throw err;
  }
}

// Actualizar usuario
async function actualizarUsuario(id, datos, usuarioModificador) {
  const { username, password, rol, estado,empleado,observacion } = datos;

  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_usuario WHERE id_usuario = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Usuario no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    const checkEmpleado = await pool.query(
      "SELECT 1 FROM tb_usuario WHERE empleado = $1 AND id_usuario <> $2",
      [empleado, id]
    );

    if (checkEmpleado.rowCount > 0) {
      throw new Error("Este empleado ya está asignado a otro usuario.");
    }
    
    let hashedPassword = anterior.password; // por defecto conservar contraseña anterior

    if (password && password.trim() !== "") {
      hashedPassword = await encrypt(password); // solo si se quiere cambiar
    }

    const sqlUpdate = `
      UPDATE tb_usuario
      SET username = $1, password = $2, rol = $3,empleado=$4, estado = $5
      WHERE id_usuario = $6
    `;

    await pool.query(sqlUpdate, [
      username,
      hashedPassword,
      rol,
      empleado,
      estado,
      id,
    ]);

    await registrarAuditoriaUsuario({
      id_usuario: id,
      username_anterior: anterior.username,
      username_nuevo: username,
      estado_anterior: anterior.estado,
      estado_nuevo: estado,
      password_anterior: anterior.password,
      password_nuevo: hashedPassword,
      rol_anterior: anterior.rol,
      rol_nuevo: rol,
      empleado_anterior:anterior.empleado,
      empleado_nuevo:empleado,
      observacion:observacion,
      operacion: "UPDATE",
      usuario_modificador: usuarioModificador.usuario,
    });

    return { mensaje: "Usuario actualizado y auditado" };
  } catch (err) {
    console.error("❌ Error al actualizar usuario:", err);
    throw err;
  }
}

// Eliminar usuario (borrado lógico)
async function eliminarUsuario(id, usuarioModificador) {
  try {
    const resultAnterior = await pool.query(
      "SELECT * FROM tb_usuario WHERE id_usuario = $1",
      [id]
    );

    if (resultAnterior.rowCount === 0) {
      throw new Error("Usuario no encontrado");
    }

    const anterior = resultAnterior.rows[0];

    await pool.query(
      "UPDATE tb_usuario SET estado = false WHERE id_usuario = $1",
      [id]
    );

    await registrarAuditoriaUsuario({
      id_usuario: id,
      username_anterior: anterior.username,
      username_nuevo: anterior.username,
      estado_anterior: anterior.estado,
      estado_nuevo: false,
      password_anterior: anterior.password,
      password_nuevo: anterior.password,
      rol_anterior: anterior.rol,
      rol_nuevo: anterior.rol,
      empleado_anterior:anterior.empleado,
      empleado_nuevo:anterior.empleado,
      observacion:'Registro eliminado',
      operacion: 'DELETE',
      usuario_modificador: usuarioModificador.usuario
    });

    return { mensaje: "Usuario eliminado y auditado" };
  } catch (err) {
    console.error("❌ Error al eliminar usuario:", err);
    throw err;
  }
}

// Obtener perfil de usuario
async function obtenerPerfil(id_usuario) {
  const sql = `
    SELECT id_usuario, username, rol
    FROM tb_usuario
    WHERE id_usuario = $1
  `;

  try {
    const result = await pool.query(sql, [id_usuario]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error al obtener perfil:", err);
    throw err;
  }
}

module.exports = {
  obtenerUsuario,
  obtenerTodosLosUsuario,
  insertarUsuario,
  actualizarUsuario,
  loginUsuario,
  obtenerPerfil,
  obtenerTodosLosUsuariosAudit,
  eliminarUsuario
};
