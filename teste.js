const axios = require("axios");
const fs = require("fs");

// URL e Token fornecidos
const url =
  "https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=935241625008063&ext=1727134990&hash=ATuef1lXLI1prlGjJb784OQJgxB4SrmART_TVKhtw89omA";
const token =
  "EAAPQis7WA0sBO7hpYbDoUnJVk75Mz2hZA59tze8HQ4Yrdqw8R40a8d2gQFmMvzAm0i7gyASQnhCaJAw01aeRL6bFnthAr6Y02Bmlz8aUFmJJRnnLfUINBtj8X2bP28ZCNY9sRxbzJBd59BZArSoftPv1LH6ZBT8KZAxOiwQGuG305se3it1ZCaMgt0KAkymKx0XwZDZD";

async function downloadWhatsAppImage(url, token) {
  const localImagePath = "./image.jpg"; // Caminho para salvar a imagem localmente

  try {
    console.log("Chamando a URL:", url);
    console.log("Usando token:", token);

    const response = await axios({
      url: url,
      method: "GET",
      responseType: "stream",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response recebida com sucesso! Salvando a imagem...");

    const writer = fs.createWriteStream(localImagePath);

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", () => {
        console.log("Imagem salva com sucesso:", localImagePath);
        resolve(localImagePath);
      });
      writer.on("error", (error) => {
        console.error("Erro ao salvar a imagem:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error(
      "Erro na requisição Axios:",
      error.response?.status,
      error.response?.data
    );
    return `Erro ao baixar a imagem: ${error.message}`;
  }
}

// Executa o download automaticamente quando o script é executado
downloadWhatsAppImage(url, token)
  .then((path) => {
    console.log(`Download concluído: ${path}`);
  })
  .catch((error) => {
    console.error("Erro no download:", error);
  });

module.exports = { downloadWhatsAppImage };
