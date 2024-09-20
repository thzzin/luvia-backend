const axios = require('axios'); // Se estiver usando Node.js, ou use diretamente em seu projeto frontend

const accessToken = 'XrxKkrt2YbCNkC8JRffWx4uU'; // Substitua pelo seu token de acesso
const idEntrada = 'vkhNXgzMrmQdXzKAmsSkhdVq'
const validuser = 'WxfBf6ZCcMF3rSGPQ6tXrK8T'
const saveMessageAndAvatar = require('../../service/profileService')
async function getChat(id) {
    const url = `https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/conversations/${id}/messages`;
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'api_access_token': `${accessToken}`
        }
      });  
      //console.log('response', response); // Para verificar a resposta completa
      const pageInfo = response.data;
  
      // Extrair mensagens do payload
      const name = pageInfo.meta.contact.name
      const numero = pageInfo.meta.contact.phone_number
      const mensagens = pageInfo.payload
      const avatar = pageInfo.meta.contact.thumbnail

      const chat = {
        name: name,
        numero: numero,
        mensagens: mensagens,
        avatar: avatar,
      }
    
      // Percorrer todas as conversas para salvar as mensagens e avatares
      // for (const conversation of conversations) {
      //   for (const message of conversation.messages) {
      //     const content = message.content; 
      //     const conversationId = conversation.id;
      //     const avatarUrl = conversation.meta?.sender?.thumbnail || ''; // Ajustar se o avatar estiver em outro lugar
      //     console.log('vai enviar: ', content, conversationId, avatarUrl)
      //     // Chamar a função para salvar no banco
      //     await saveMessageAndAvatar({ conversationId, content, avatarUrl });
      //   }
      // }
  
  
      return {chat};
    } catch (error) {
      console.error('Error em buscar chats:', error.response);
      throw error;
    }
}
async function newConversation(message) {
  const url = 'https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/conversations';
  try {
    const response = await axios.post(url, {
      "source_id": "f43d4d3a-ef8d-4057-a065-8ce82689bfb0",
      "inbox_id": "16",
      "contact_id": "28",
      "additional_attributes": {},
      "custom_attributes": {
        "attribute_key": "attribute_value",
        "priority_conversation_number": 3
      },
      "status": "open",
      "assignee_id": "string",
      "team_id": "1726168472",
      "message": {
        "content": "vai corinthians",
        "template_params": {
          "name": "sample_issue_resolution",
          "category": "UTILITY",
          "language": "en_US",
          "processed_params": {
            "1": "Chatwoot"
          }
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': `${accessToken}` // Certifique-se de que este token está correto
      }
    });

    return response.data;
  } catch (error) {
    console.log('error', error);
  }
}



module.exports = {
    getChat,
    newConversation
}