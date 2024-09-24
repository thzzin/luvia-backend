const express = require("express");
const bodyParser = require("body-parser"); // Importa o body-parser
const pool = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const Message = require("./models/Message"); // Certifique-se de importar o modelo correto
const sequelize = require("./config/db");
const compression = require("compression"); // Importa o pacote compression

const https = require("https"); // Importa o módulo https
const fs = require("fs"); // Importa o módulo fs para lidar com arquivos

// Carregando os certificados SSL

let credentials;

const app = express();
const port = process.env.PORT || 3005; // Porta do backend (3005)

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const coiso = process.env.PRODUCAO;
console.log("coiso: ", coiso);
let corsOptions;

if (!coiso) {
  corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: false,
    optionsSuccessStatus: 204,
  };
} else {
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

  credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };

  corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  };
}

app.use(cors(corsOptions));
app.use(compression());

// Configura o body-parser para analisar JSON
app.use(bodyParser.json()); // Middleware para parsing de JSON
app.use(bodyParser.urlencoded({ extended: true })); // Middleware para parsing de URL-encoded

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
    // Sincroniza todos os modelos que ainda não foram criados no banco de dados
    await sequelize.sync({ force: false }); // force: false não apaga dados existentes
    console.log("Tabelas sincronizadas com sucesso!");
  } catch (error) {
    console.error("Erro ao sincronizar o banco de dados:", error);
  }
}

syncDatabase();

// Definição das rotas utilizando os controladores
app.get("/", (req, res) => res.send("Vai Corinthians! foi"));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Inicia o servidor HTTPS após verificar a conexão com o banco de dados
checkDatabaseConnection().then(() => {
  if (!coiso) {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } else {
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port, () => {
      console.log(`Servidor HTTPS rodando na porta https://localhost:${port}`);
    });
  }
});
