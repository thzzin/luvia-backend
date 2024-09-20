const axios = require('axios'); // Se estiver usando Node.js, ou use diretamente em seu projeto frontend
const { col } = require('sequelize');
const accessToken = 'XrxKkrt2YbCNkC8JRffWx4uU'; // Substitua pelo seu token de acesso
const profileService = require('../../service/profileService')
async function getPageInfo() {
  const url = 'https://chatwoot.impulsaprecisao.com.br/api/v1/profile';
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': `${accessToken}`
      }
    });  
    //console.log(response.data); // Para verificar a resposta completa
    const pageInfo = response.data;

    return {
      pageInfo
    };
  } catch (error) {
    console.error('Error fetching page info:', error.response ? error.response.data : error.message);
    throw error;
  }
}
async function getConversation() {
  const url = 'https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/conversations';
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': `${accessToken}`,
      },
    });

    const pageInfo = response.data.data.payload;
    // Percorre cada conversa
    // for (const conversation of pageInfo) {

    //   // Extrai o thumbnail do sender (meta -> sender -> thumbnail)
    //   const thumbnailUrl = conversation.meta.sender.thumbnail;
    //   // Extrai e salva mensagens e avatares
    //   for (const message of conversation.messages) {
    //     const content = message.content; // Conteúdo da mensagem
  
    //     // Salvar a mensagem e o avatar no banco de dados
    //     await profileService.saveMessageAndAvatar({
    //       conversationId: conversation.id,
    //       content: content,
    //       avatarUrl: thumbnailUrl, // Salva o thumbnail do sender
    //     });
    //   }
    //   // Acessa a última mensagem não relacionada a atividades (opcional)
    //   const lastMessage = conversation.last_non_activity_message;
    //   if (lastMessage) {

    //   }
    // }

    return {
      pageInfo,
    };
  } catch (error) {
    console.error('Error fetching page info:');
    throw error;
  }
}
async function getConversationCount(params) {
  const url = 'https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/conversations/meta';
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': `${accessToken}`
      }
    });  
    console.log(response.data); // Para verificar a resposta completa
    const pageInfo = response.data;

    return {
      pageInfo
    };
  } catch (error) {
    console.error('Error fetching page info:', error.response ? error.response.data : error.message);
    throw error;
  }
}


// Exemplo de uso
module.exports = {
  getPageInfo,
  getConversation,
  getConversationCount,
};

