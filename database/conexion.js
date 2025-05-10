const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = process.env.DB_PATH;

const connection = () => {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error("Error al conectar con SQLite:", err.message);
    } else {
      console.log("Conectado a la base de datos SQLite");
    }
  });
};

module.exports = connection;