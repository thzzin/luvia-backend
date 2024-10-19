const fs = require("fs");
const path = require("path");

// Carregar o JSON de produtos
const produtosPath = path.join(__dirname, "produtos.json");
const produtos = JSON.parse(fs.readFileSync(produtosPath, "utf8"));

// Função para buscar o modelo e retornar as telas disponíveis (como Promise)
function buscarTelasPorModelo(mensagem) {
  return new Promise((resolve, reject) => {
    try {
      console.log("vai buscar");

      // Extrair o modelo da mensagem
      const regexModelo = /do ([\w\s\d]+)/i;
      const match = mensagem.match(regexModelo);

      if (!match) {
        resolve(
          "Não foi possível encontrar o modelo na sua mensagem. Tente algo como: 'tem tela do A10?'"
        );
        return;
      }

      const modeloProcurado = normalizarTexto(match[1].trim().toLowerCase());
      console.log("Modelo procurado (normalizado):", modeloProcurado);

      let resultados = [];

      // Procurar todas as entradas que contêm o modelo
      produtos.forEach((produto) => {
        const modelosProduto = produto.modelos.map((m) =>
          normalizarTexto(m.trim().toLowerCase())
        );

        if (modelosProduto.some((m) => m.includes(modeloProcurado))) {
          resultados.push({
            marcaTela: produto.marcatela,
            aro: produto.aro,
            valor: produto.valor,
          });
        }
      });

      // Se não encontrar resultados
      if (resultados.length === 0) {
        resolve(
          `Não foram encontradas telas para o modelo ${modeloProcurado}.`
        );
        return;
      }

      // Remover duplicações de marca + aro
      const resultadosUnicos = removerDuplicados(resultados);

      // Formatar e retornar a resposta
      const respostaFormatada = formatarResposta(
        modeloProcurado,
        resultadosUnicos
      );
      resolve(respostaFormatada); // Resolvido com a resposta formatada
    } catch (error) {
      reject(error); // Rejeitar em caso de erro
    }
  });
}

// Função para normalizar o texto (remove caracteres invisíveis e espaços extras)
function normalizarTexto(texto) {
  return texto
    .normalize("NFKD")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

// Função para remover duplicações de marca + aro
function removerDuplicados(resultados) {
  const vistos = new Set();
  return resultados.filter((item) => {
    const chave = `${item.marcaTela}-${item.aro}`;
    if (vistos.has(chave)) {
      return false; // Ignorar duplicatas
    }
    vistos.add(chave);
    return true; // Manter se for único
  });
}

// Função para formatar a resposta da maneira solicitada
function formatarResposta(modelo, resultados) {
  console.log("Formatando resposta...");

  let respostamsg = `Telas encontradas para o modelo ${modelo}:\n`;

  resultados.forEach((resultado) => {
    const marca = capitalizeFirstLetter(resultado.marcaTela);
    const aro = capitalizeFirstLetter(resultado.aro);
    respostamsg += `${marca} ${aro} Aro - R$${resultado.valor}\n`;
  });

  console.log("Resposta formatada:", respostamsg);
  return respostamsg;
}

// Função auxiliar para capitalizar a primeira letra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  buscarTelasPorModelo,
};
