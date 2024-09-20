const axios = require('axios'); // Se estiver usando Node.js, ou use diretamente em seu projeto frontend

const accessToken = 'XrxKkrt2YbCNkC8JRffWx4uU'; // Substitua pelo seu token de acesso
const idEntrada = 'vkhNXgzMrmQdXzKAmsSkhdVq'
const validuser = 'WxfBf6ZCcMF3rSGPQ6tXrK8T'

async function getContacts() {
    try{
        const url = 'https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/contacts'
        const response = await axios.get(url, {
            headers: {
              'Content-Type': 'application/json',
              'api_access_token': `${accessToken}`
            }
          });  

          console.log(response.data.payload)
          const contatos = response.data.payload
          return {contatos}
    }catch(error){
        console.log('error', error)
    }
}

async function postContact(name, phone, avatar_url) {
    const params = {
        inbox_id: 11, // ID da inbox necessária
        name: name, // Nome do contato
        //email: 'john.doe@example.com', // Email do contato
        phone_number: phone, // Número de telefone do contato
        avatar_url: avatar_url, // URL do avatar (pode ser omitido se enviar o avatar como binário)
        identifier: phone, // Identificador único para o contato em um sistema externo
      };
      
    try {
        const url = 'https://chatwoot.impulsaprecisao.com.br/api/v1/accounts/2/contacts';
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
        
        console.log('response:', response.data);
        return response.data;
    } catch (error) {
        console.log('error', error.response ? error.response.data : error.message);
        return error;
    }
}


module.exports = {
    getContacts,
    postContact
}