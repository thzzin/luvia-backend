const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Certifique-se de ajustar o caminho

async function checkToken(req, res, next) {
  const token = req.headers["authorization"];
  
  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET_KEY; // Certifique-se que o SECRET_KEY está no .env

    // Decodifica o token JWT
    const decoded = jwt.verify(token, secret);
    
    // Agora acessa `decoded.adminId` como foi definido no login
    if (!decoded || !decoded.adminId) {
      console.log('Token inválido!');
      return res.status(401).json({ msg: "Token inválido!" });
    }


    // Busca o Admin com base no adminId decodificado do token
    const admin = await Admin.findOne({ where: { id: decoded.adminId } });
    if (!admin) {
      console.log('Usuário não encontrado');
      return res.status(401).json({ msg: "Usuário não encontrado!" });
    }

    // Anexa o adminId ao objeto req para uso posterior
    req.user = {
      id: admin.id,
      phone: admin.phone
    };

    next();
  } catch (err) {
    console.error('Erro ao verificar o token:', err);
    res.status(400).json({ msg: "O Token é inválido!" });
  }
}

module.exports = checkToken;
