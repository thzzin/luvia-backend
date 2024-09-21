

async function postWhats(waid, acessToken) {
    const url = `https://graph.facebook.com/v14.0/${waid}/messages`;

    try{
        const response = await axios.post(url, {
            headers: {
              'Content-Type': 'application/json',
              'api_access_token': `${acessToken}`
            },
          });  

          console.log('response', response)
    }catch(error){

    }
}