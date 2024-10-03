const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const Message = require("./models/Message");
const sequelize = require("./config/db");
const compression = require("compression");
const https = require("https");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
// Carregando os certificados SSL
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/getluvia.com.br/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/getluvia.com.br/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/getluvia.com.br/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const app = express();
const port = process.env.PORT || 3005;

// Configurações de CORS
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(compression());

// Configuração do body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Função para verificar a conexão com o banco de dados
async function checkDatabaseConnection() {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connection successful!");
  } catch (err) {
    console.error("Database connection error:", err.stack);
    process.exit(1);
  }
}

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true }); // Ajuste se quiser preservar dados
    console.log("Tabelas sincronizadas com sucesso!");
  } catch (error) {
    console.error("Erro ao sincronizar o banco de dados:", error);
  }
}

syncDatabase();

// Definição das rotas
app.get("/", (req, res) => res.send("Vai Corinthians! foi"));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Inicia o servidor HTTPS
checkDatabaseConnection().then(() => {
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(port, () => {
    console.log(`Servidor HTTPS rodando na porta https://localhost:${port}`);
  });
});
