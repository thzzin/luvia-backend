const axios = require('axios'); // Se estiver usando Node.js, ou use diretamente em seu projeto frontend

const accessToken = 'XrxKkrt2YbCNkC8JRffWx4uU'; // Substitua pelo seu token de acesso
async function sendMessage( newMsg ) {
    console.log(newMsg)
    const id = newMsg.conversation_id
    const msg = newMsg.content
    const message = {
        content: msg,
    }
    try{
        const url = `https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/conversations/${id}/messages`
        const response = await axios.post(
            url, // URL da API
            message, // O corpo da requisição deve estar aqui
            {
              headers: {
                'Content-Type': 'application/json',
                'api_access_token': `${accessToken}` // O header vai no segundo argumento
              }
            }
          );
          
          console.log('response:', response.data);
    }catch(error){
        console.log('error', error.response ? error.response.data : error.message);

    }
}

module.exports = {
    sendMessage
}
