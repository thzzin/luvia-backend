const axios = require('axios');

const accessToken = 'XrxKkrt2YbCNkC8JRffWx4uU'; // Substitua pelo seu token de acesso

// Função que busca os flows da página
async function getPageFlow(req, res) {
  const url = 'https://api.manychat.com/fb/page/getFlows';

  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Aqui ta a resposta do client', response.data); // Para verificar a resposta completa

    // Envia a resposta diretamente para o cliente
    res.json({ status: 'success', data: response.data });

  } catch (error) {
    console.error('Error fetching page info:', error.response ? error.response.data : error.message);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar flows.' });
  }
}

module.exports = {
  getPageFlow,
};
