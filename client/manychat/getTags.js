const axios = require('axios'); // Se estiver usando Node.js, ou use diretamente em seu projeto frontend

const accessToken = 'XrxKkrt2YbCNkC8JRffWx4uU'; // Substitua pelo seu token de acesso

async function getPageTags() {
  const url = 'https://app.chatwoot.com/api/v1/accounts/{account_id}/custom_filters';

  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log(response.data); // Para verificar a resposta completa

    const tags = response.data;

    return {
        tags
    };
  } catch (error) {
    console.error('Error fetching page info:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Exemplo de uso
getPageInfo()
  .then(data => {
    console.log('Avatar URL:', data.avatarUrl);
    // Outros dados da página podem ser acessados através de data
  })
  .catch(error => console.error('Error:', error));
