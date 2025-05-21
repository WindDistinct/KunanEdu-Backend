const cargoService = require("../services/cargo");

const listar = async (req, res) => {
  try {
    const cargos = await cargoService.obtenerCargos();
    res.json(cargos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const listarTodo = async (req, res) => {
  try {
    const cargos = await cargoService.obtenerTodosLosCargos();
    res.json(cargos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevoCargo = await cargoService.insertarCargo(req.body,req.user);
    res.status(201).json({ mensaje: "Cargo creado", id: nuevoCargo.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => { 
  try {
    const actualizado = await cargoService.actualizarCargo(req.params.id, req.body,req.user);
    if (actualizado === 0) return res.status(404).json({ error: "No encontrado" });
    res.json({ mensaje: "Cargo actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminar = async (req, res) => { 
  try {
    const eliminado = await cargoService.eliminarCargo(req.params.id,req.user);
    if (eliminado === 0) return res.status(404).json({ error: "No encontrado" });
    res.json({ mensaje: "Cargo eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crear,
  listar,
  actualizar,
  eliminar,
  listarTodo
};