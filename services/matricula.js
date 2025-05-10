const db = require("../database/dbInstance.js");

const listarMatricula = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM tb_matricula`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = { 
  listarMatricula
};