const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    // Hacer una consulta muy simple para probar
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a la base de datos!');
    console.log('Hora actual en el servidor:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Error en la conexión a la base de datos:', err);
  } finally {
    // await pool.end();
  }
})();

module.exports = pool;