const fs = require("fs");
const Fuse = require("fuse.js");
const path = require("path");

// Função para carregar o arquivo JSON
function loadProductData() {
  const filePath = path.join(__dirname, "produtos.json");
  const data = fs.readFileSync(filePath, "utf8");
  const parsedData = JSON.parse(data);

  console.log("Produtos carregados:", parsedData.G_RELATORIO.length);
  return parsedData.G_RELATORIO;
}

// Função para inicializar o Fuse.js com as opções desejadas
function initializeFuse(products) {
  const options = {
    keys: ["Descrição"],
    threshold: 0.3, // Flexibilidade na correspondência
    distance: 50,
    includeScore: true,
  };

  return new Fuse(products, options);
}

// Função para normalizar strings
function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/gi, "")
    .trim();
}

// Função para buscar o produto pelo nome
function findProduct(productName) {
  const products = loadProductData();
  const fuse = initializeFuse(products);
  const normalizedProductName = normalizeString(productName);

  // Procurando todas as correspondências
  const result = fuse.search(normalizedProductName);

  // Filtrar resultados para garantir que apenas produtos que contêm "A1" sejam retornados
  const matches = result
    .filter(({ item }) => item.Descrição.includes("A1")) // Ajuste aqui
    .map(({ item }) => item);

  if (matches.length > 0) {
    const response = matches
      .map((match) => `${match.Descrição} - R$ ${match["Preço Venda"]}`)
      .join("\n");

    return response;
  }

  return "Produto não encontrado.";
}

// Função para lidar com mensagens recebidas
function handleMessage(message) {
  const normalizedMessage = message.toLowerCase().trim();
  console.log("Mensagem recebida:", message);

  const ignoreKeywords = [
    "tela",
    "display",
    "visor",
    "monitor",
    "pantalla",
    "parte",
    "peca",
    "componente",
    "acessório",
    "parte externa",
    "frente",
    "tras",
    "capa",
    "case",
    "acessórios",
  ];

  const ignoreRegex = new RegExp(ignoreKeywords.join("|"), "g");
  let possibleProductName = normalizedMessage.replace(ignoreRegex, "").trim();

  // Adiciona uma lógica para considerar apenas a parte do nome do modelo
  const productNameParts = possibleProductName.split(" ");
  const refinedProductName =
    productNameParts.length > 0
      ? productNameParts[productNameParts.length - 1]
      : possibleProductName;

  const keywords = [
    "preço",
    "tem",
    "quanto",
    "queria saber",
    "posso saber",
    "pode me dizer",
    "tô procurando",
    "tô buscando",
    "me mostra",
    "qual é",
    "você tem",
    "gostaria de saber",
    "por favor",
    "tá tendo",
    "fala pra mim",
    "pode informar",
    "me diga",
    "tem algum",
    "como está",
    "quero saber",
    "tem disponível",
    "me ajuda",
    "sabe me dizer",
    "poderia informar",
    "quero perguntar",
    "me fala sobre",
    "quais são",
    "tem na loja",
    "você conhece",
    "o que você tem sobre",
  ];

  const keywordRegex = new RegExp(keywords.join("|"), "g");
  possibleProductName = refinedProductName.replace(keywordRegex, "").trim();

  if (possibleProductName.length === 0) {
    return "Desculpe, não consegui identificar o produto. Poderia reformular a pergunta?";
  }

  const response = findProduct(possibleProductName);
  return response;
}

// Exemplo de uso
const exampleMessage = "tem a tela do A1?";
console.log(handleMessage(exampleMessage));

module.exports = { handleMessage };
