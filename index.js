const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000 

app.listen(port, () => {
  console.log("Servidor activo en el puerto: " + port);
})

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


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


module.exports = { app };