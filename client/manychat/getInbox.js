const axios = require('axios'); // Se estiver usando Node.js, ou use diretamente em seu projeto frontend

const accessToken = 'XrxKkrt2YbCNkC8JRffWx4uU'; // Substitua pelo seu token de acesso
const idEntrada = 'vkhNXgzMrmQdXzKAmsSkhdVq'
const validuser = 'WxfBf6ZCcMF3rSGPQ6tXrK8T'
const saveMessageAndAvatar = require('../../service/profileService')
async function getInbox() {
    const url = 'https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/inboxes';
    const params = {
      "name": "Thzzin ",
      "avatar": "",
      "channel": {
        "type": "thzzin",
        "website_url": "acme.com",
        "welcome_title": "teste",
        "welcome_tagline": "teste",
        "agent_away_message": "asdasd",
        "widget_color": "#009CE0"
      }
    }
    try {
        const response = await axios.post(
          url, // URL da API
          params, // O corpo da requisição deve estar aqui
          {
            headers: {
              'Content-Type': 'application/json',
              'api_access_token': `${accessToken}` // O header vai no segundo argumento
            }
          }
        );
      //console.log('response', response); // Para verificar a resposta completa
      const inbox = response.data;
  
      return {inbox};
    } catch (error) {
      console.error('Error em buscar chats:', error.response ? error.response.data : error.message);
      throw error;
    }
}

module.exports = {
  getInbox
}