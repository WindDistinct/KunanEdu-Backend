const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const port = process.env.PORT || 4000;

// Routers
const estudianteRouter = require("./routes/alumno");
const gradoRouter = require("./routes/grado");
const usuarioRouter = require("./routes/usuario");
const empleadoRouter = require("./routes/empleado");
const cursoRouter = require("./routes/curso");
const aulaRouter = require("./routes/aula");
const matriculaRouter = require("./routes/matricula");
const periodoEscolarRouter = require("./routes/periodo");
const examenRouter = require("./routes/examen");
const seccionRouter = require("./routes/seccion");
const seccion_alumnoRouter = require("./routes/seccion_alumno");
const asistenciaRouter = require("./routes/asistencia");
const horarioRouter = require("./routes/horario");
const curso_gradoRouter = require("./routes/curso_grado");
const curso_seccionRouter = require("./routes/curso_seccion");
const notaRouter = require("./routes/nota");


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/estudiante", estudianteRouter);
app.use("/api/grado", gradoRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/empleado", empleadoRouter);
app.use("/api/curso", cursoRouter);
app.use("/api/aula", aulaRouter);
app.use("/api/matricula", matriculaRouter);
app.use("/api/periodo", periodoEscolarRouter);
app.use("/api/examen", examenRouter);
app.use("/api/seccion", seccionRouter);
app.use("/api/seccion_alumno", seccion_alumnoRouter);
app.use("/api/asistencia", asistenciaRouter);
app.use("/api/horario", horarioRouter);
app.use("/api/curso_grado", curso_gradoRouter);
app.use("/api/curso_seccion", curso_seccionRouter);
app.use("/api/nota", notaRouter);



// Ping periódico cada 10 minutos a tu propia URL de Render
cron.schedule("*/10 * * * *", async () => {
  try {
    const response = await axios.get("https://kunanedu-backend.onrender.com/api/usuario/all");
    console.log("Ping exitoso:", response.status);
  } catch (error) {
    console.error("Error al hacer ping:", error.message);
  }
});

app.listen(port, () => {
  console.log("Servidor activo en el puerto: " + port);
});

module.exports = { app };
