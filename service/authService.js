// /services/userService.js
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Serviço para buscar todos os usuários
async function getUsers() {
  const result = await sequelize.query("SELECT * FROM admin");
  return result.rows;
}

async function register(user, password, email) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result, metadata] = await sequelize.query(
      'INSERT INTO admin (email, password, "user") VALUES ($1, $2, $3) RETURNING *',
      {
        bind: [email, hashedPassword, user],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    return result[0];
  } catch (error) {
    console.error("Erro ao registrar usuário:", error.message);
    throw new Error("Erro ao registrar usuário");
  }
}

async function login(email, password) {
  const result = await sequelize.query("SELECT * FROM admin WHERE email = $1", [
    email,
  ]);
  const admin = result.rows[0];

  if (!admin) {
    throw new Error("Email Inválido!");
  }

  const isPass = await bcrypt.compare(password, admin.password);
  if (!isPass) {
    throw new Error("Senha Inválida");
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.SECRET_KEY, {
    expiresIn: "4h",
  });

  return { message: "Logado!", token };
}

module.exports = {
  getUsers,
  register,
  login,
};
