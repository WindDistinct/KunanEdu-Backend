const matriculaService = require("../services/matricula");

const listado = async (req, res) => {
    try {
        const matriculas = await matriculaService.listarMatricula();
        res.json(matriculas);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};

module.exports = { listado};