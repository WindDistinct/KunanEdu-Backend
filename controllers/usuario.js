const usuarioService = require("../services/usuario");

const listar = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerUsuario();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevoUsuario = await usuarioService.insertarUsuario(req.body);
    res.status(201).json({ mensaje: "Usuario creado", id: nuevoUsuario.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const actualizado = await usuarioService.actualizarUsuario(id, req.body);
    if (actualizado === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = await usuarioService.eliminarUsuario(id);
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
  eliminar
};