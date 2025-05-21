const express = require("express");
const cors = require("cors");

const estudianteRouter = require("./routes/estudiante");
const gradoRouter = require("./routes/grado");
const cargoRouter = require("./routes/cargo");
const usuarioRouter = require("./routes/usuario");
const empleadoRouter = require("./routes/empleado");
const cursoRouter = require("./routes/curso");
const aulaRouter = require("./routes/aula");
const matriculaRouter = require("./routes/matricula");
const periodoEscolarRouter = require("./routes/periodo");
const notaRouter = require("./routes/nota");








const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/estudiante", estudianteRouter);
app.use("/api/grado", gradoRouter);
app.use("/api/cargo", cargoRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/empleado", empleadoRouter);
app.use("/api/curso", cursoRouter);
app.use("/api/aula", aulaRouter);
app.use("/api/matricula", matriculaRouter);
app.use("/api/periodo", periodoEscolarRouter);
app.use("/api/nota", notaRouter);









module.exports = { app };