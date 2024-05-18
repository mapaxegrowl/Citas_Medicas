import express from "express";
import { engine } from "express-handlebars";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import _ from "lodash";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

// Configuración necesaria para obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del motor de plantillas Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Configura el middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());

let users = [];

// Ruta para servir la página principal
app.get("/", (req, res) => {
  res.render("index");
});

// Ruta para consultar todos los usuarios registrados
app.get("/users", (req, res) => {
  const usersByGender = _.groupBy(users, "gender");

  console.log(chalk.bgWhite.blue(JSON.stringify(usersByGender, null, 2)));

  res.render("users", { users: usersByGender });
});

// Ruta para registrar un nuevo usuario
app.post("/register", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const userData = response.data.results[0];

    const newUser = {
      id: uuidv4(),
      name: `${userData.name.first} ${userData.name.last}`,
      email: userData.email,
      gender: userData.gender,
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    users.push(newUser);
    res.json(newUser);
    console.log(chalk.bgWhite.green("Usuario registrado con éxito"));
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(chalk.bgGreen.black(`http://localhost:${PORT}`));
});
