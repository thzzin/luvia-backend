const fs = require("fs");
const Fuse = require("fuse.js");

// Função para carregar o arquivo JSON
function loadProductData() {
  const data = fs.readFileSync("./produtos.json", "utf8");
  const parsedData = JSON.parse(data);

  // Verifica se o JSON foi carregado corretamente
  console.log("Produtos carregados:", parsedData.G_RELATORIO.length);

  return parsedData.G_RELATORIO;
}

// Função para inicializar o Fuse.js com as opções desejadas
function initializeFuse(products) {
  const options = {
    keys: ["Descrição"], // Propriedade do objeto onde realizar a busca
    threshold: 0.5, // Define quão precisa a correspondência deve ser (0 = precisa, 1 = imprecisa)
    distance: 100, // Define quão longe os termos podem estar uns dos outros para serem considerados uma correspondência
    includeScore: true, // Inclui o score para depuração
  };

  return new Fuse(products, options);
}

// Função para normalizar strings
function normalizeString(str) {
  return str
    .toLowerCase() // Converte para minúsculas
    .replace(/\s+/g, " ") // Remove espaços extras
    .replace(/[^\w\s]/gi, "") // Remove caracteres especiais
    .trim(); // Remove espaços no início e no fim
}

// Função para buscar o produto pelo nome
function findProduct(productName) {
  const products = loadProductData();
  const fuse = initializeFuse(products);

  // Normaliza o nome do produto
  const normalizedProductName = normalizeString(productName);
  console.log("Buscando por:", normalizedProductName); // Debugging

  // Imprimindo todas as descrições para depuração
  console.log(
    "Descrições de produtos:",
    products.map((product) => product["Descrição"])
  );

  // Procurando correspondência mais próxima
  const result = fuse.search(normalizedProductName);
  console.log("Resultados da busca:", result); // Debugging

  // Se encontrarmos uma correspondência satisfatória
  if (result.length > 0) {
    const bestMatch = result[0].item; // Pega o primeiro resultado
    return `O preço do ${bestMatch["Descrição"]} é R$${bestMatch["Preço Venda"]}.`;
  } else {
    return "Desculpe, não encontramos o produto que você mencionou.";
  }
}

// Função para lidar com mensagens recebidas
function handleMessage(message) {
  // Normaliza a mensagem
  const normalizedMessage = message.toLowerCase().trim();

  // Verifica se a mensagem está perguntando sobre o preço
  if (
    normalizedMessage.includes("preço") ||
    normalizedMessage.includes("tem")
  ) {
    // Remover partes da mensagem que não fazem parte do nome do produto
    const possibleProductName = normalizedMessage
      .replace(/preço|tem|quanto|queria saber|opa/g, "") // Remove palavras comuns
      .trim();

    // Busca o produto no JSON
    const response = findProduct(possibleProductName);
    return response;
  } else {
    return "Não entendi a pergunta. Você está procurando por um produto?";
  }
}

// Exemplo de uso
const exampleMessage = "tem o redmi 8 a";
console.log(handleMessage(exampleMessage));
