const bcrypt = require("bcrypt"); // Adiciona o bcrypt
const jwt = require("jsonwebtoken"); // Certifique-se de importar o jwt também
const sequelize = require("../../config/db"); // Certifique-se de importar seu banco de dados corretamente
const userService = require("../../service/authService");

const activeTokens = {};

async function getUsers(req, res) {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users", err.stack);
    res.status(500).send("Server error");
  }
}

async function register(req, res) {
  const { username, password, email } = req.body;
  try {
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const currentDate = new Date();

    const [result] = await sequelize.query(
      'INSERT INTO admins (email, password, username, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      {
        bind: [email, hashedPassword, username, currentDate, currentDate],
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.status(201).json({ message: "Cadastrado com sucesso!", result });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error.message);
    res
      .status(500)
      .json({ message: "Erro ao registrar usuário", error: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const [results] = await sequelize.query(
      "SELECT * FROM admins WHERE email = $1",
      {
        bind: [email],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const admin = results;

    if (!admin) {
      return res.status(400).json({ message: "Email Inválido!" });
    }

    const isPass = await bcrypt.compare(password, admin.password);
    if (!isPass) {
      return res.status(400).json({ message: "Senha Inválida!" });
    }

    // Use o mesmo segredo em todo o código
    const secret = process.env.SECRET_KEY;
    const token = jwt.sign({ adminId: admin.id }, secret, {
      expiresIn: "4h",
    });

    // Armazene o token ativo para o usuário
    activeTokens[admin.id] = token;

    res.status(200).json({ message: "Login Realizado!", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao fazer login", error: error.message });
  }
}

async function verify(req, res) {
  const { token } = req.body;

  try {
    const secret = process.env.SECRET_KEY; // Altere para o mesmo segredo usado no login
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(200).json({ valid: false });
      }

      const userId = decoded.adminId; // Certifique-se de que o campo usado aqui é o correto
      if (activeTokens[userId] === token) {
        return res.status(200).json({ valid: true });
      } else {
        return res.status(200).json({ valid: false });
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "Erro ao verificar token" });
  }
}

async function logout(req, res) {
  // Corrigido para receber req e res
  const userId = req.user.id;
  try {
    delete activeTokens[userId];
    res.clearCookie("token");
    res.status(200).json({ msg: "Logout realizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ msg: "Erro ao realizar logout" });
  }
}

module.exports = {
  getUsers,
  register,
  login,
  verify,
  logout,
};
