const usuarioService = require("../services/usuario");

const listar = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerUsuario();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerTodosLosUsuario();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const listarAuditoria = async (req, res) => {
    try {
        const usuarios = await usuarioService.obtenerTodosLosUsuariosAudit();
        res.json(usuarios);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};
const perfilUsuario  = async (req, res) => {
  try {
    const id_usuario = req.user.id;  
    const perfil = await usuarioService.obtenerPerfil(id_usuario);
    if (!perfil) {return res.status(404).json({ error: "Usuario no encontrado" });}
    res.json(perfil);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try { 
    const nuevoUsuario = await usuarioService.insertarUsuario(req.body,req.user);
    res.status(201).json({ mensaje: "Usuario creado", id: nuevoUsuario.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const login = async (req, res) => {  
  try {
    const resultado = await usuarioService.loginUsuario(req.body); 
    if (resultado === null)
      return res.status(404).json({ error: "Usuario no encontrado" });

    if (resultado === false)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    res.json({
      mensaje: "Login exitoso",
      token: resultado.token,
      usuario: resultado.usuario,
      rol: resultado.rol,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const actualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const actualizado = await usuarioService.actualizarUsuario(id, req.body,req.user);
    if (actualizado === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = await usuarioService.eliminarUsuario(id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crear,
  listar,
  actualizar,
  listarTodo,
  eliminar,
  login,
  perfilUsuario ,
  listarAuditoria
};