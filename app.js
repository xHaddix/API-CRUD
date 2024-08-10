const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config(); // Cargar variables de entorno desde el archivo .env

app.use(bodyParser.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Prueba 1 servidor operativo");
});

// Importar las rutas
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

// Usar middleware para las rutas
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

// Función asíncrona para conectarse a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.DB_CONNECT, // Usa la variable de entorno para la conexión
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Conexión exitosa a la base de datos");
  } catch (err) {
    console.error("Error en la conexión a la base de datos", err);
    process.exit(1); // Termina el proceso en caso de error en la conexión
  }
};

// Llama a la función para conectarse a la base de datos
connectDB();

// Listening en el que se escucha al puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
