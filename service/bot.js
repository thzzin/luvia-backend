require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const pdfPath = path.join(__dirname, "telascelulares.pdf");

const OpenAI = require("openai");
const { OPENAI_API_KEY, ID_ASSISTENT } = process.env;
console.log("OpenAI API Key:", OPENAI_API_KEY);
console.log("ID_ASSISTENT:", ID_ASSISTENT);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

function salvarThreadId(threadId, cliente) {
  let historicoThreads = carregarHistorico();

  let threadExistente = historicoThreads.find(
    (item) => item.cliente === cliente
  );

  if (threadExistente) {
    threadExistente.threadId = threadId;
  } else {
    historicoThreads.push({ cliente: cliente, threadId: threadId });
  }

  salvarHistorico(historicoThreads);
}

function buscarThreadId(cliente) {
  let historicoThreads = carregarHistorico();
  let threadExistente = historicoThreads.find(
    (item) => item.cliente === cliente
  );

  return threadExistente ? threadExistente.threadId : null;
}

async function createThread() {
  console.log("Creating a new thread...");
  const thread = await openai.beta.threads.create();
  return thread.id;
}

// Função para adicionar mensagem ao thread
async function addMessage(threadId, message) {
  console.log("Adding a new message to thread: " + threadId);
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
}

// Função para executar o assistente
async function runAssistant(threadId) {
  console.log("Running assistant for thread: " + threadId);
  const response = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ID_ASSISTENT, // Certifique-se de que ASSISTANT_ID está definido
  });
  return response.id;
}

// Função para extrair a resposta do assistente
function getAssistantResponse(messagesList) {
  const assistantMessages = messagesList.filter(
    (message) => message.role === "assistant"
  );

  if (assistantMessages.length > 0) {
    const content = assistantMessages[0].content;

    const contentText = content
      .filter((item) => item.type === "text") // Filtra apenas tipos de texto
      .map((item) => item.text.value)
      .join("");

    // Remove a parte
    const cleanedText = contentText.replace(/【\d+:\d+†source】/g, "").trim();

    return cleanedText || "No response from assistant.";
  } else {
    return "No response from assistant.";
  }
}

// Função para checar o status do run
async function checkingStatus(threadId, runId) {
  const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
  const status = runObject.status;

  if (status === "completed") {
    const messagesList = await openai.beta.threads.messages.list(threadId);
    return getAssistantResponse(messagesList.body.data);
  } else {
    throw new Error("Assistant is still processing...");
  }
}

function carregarHistorico() {
  const caminhoArquivo = path.join(__dirname, "historico.json");

  try {
    // Ler o arquivo JSON e parsear
    const dados = fs.readFileSync(caminhoArquivo, "utf-8");
    return JSON.parse(dados);
  } catch (error) {
    // Retorna array vazio se o arquivo não existe ou há erro
    return [];
  }
}

// Função para salvar o histórico no arquivo JSON
function salvarHistorico(historico) {
  const caminhoArquivo = path.join(__dirname, "historico.json");
  fs.writeFileSync(caminhoArquivo, JSON.stringify(historico, null, 2));
}

// Função para procurar uma pergunta no histórico
function buscarNoHistorico(mensagem, historico) {
  return historico.find(
    (item) => item.pergunta.toLowerCase() === mensagem.toLowerCase()
  );
}

// Função para buscar o modelo no PDF
async function buscarModeloNoPDF(modelo, caminhoPDF) {
  const dataBuffer = fs.readFileSync(caminhoPDF);
  const pdfData = await pdfParse(dataBuffer);

  // Criar regex para buscar linhas que contêm o modelo exato
  const regexModelo = new RegExp(`\\b${modelo}\\b`, "i");
  const linhasPDF = pdfData.text.split("\n");

  const linhasComModelo = [];
  for (let i = 0; i < linhasPDF.length; i++) {
    const linha = linhasPDF[i];

    // Se a linha contém o modelo
    if (regexModelo.test(linha)) {
      let precoEncontrado = null;

      // Regex para capturar o preço na mesma linha
      const precoRegex = /(\d{1,3},\d{2})/;
      let preco = linha.match(precoRegex);

      // Se não encontrar o preço na mesma linha, buscar na próxima linha
      if (!preco) {
        if (i + 1 < linhasPDF.length) {
          preco = linhasPDF[i + 1].match(precoRegex);
        }
      }

      // Verificação final para garantir que o preço foi encontrado
      precoEncontrado = preco ? `R$ ${preco[0]}` : "Preço não encontrado";

      // Adicionar a descrição e o preço à lista de resultados
      linhasComModelo.push({
        descricao: linha.trim(),
        preco: precoEncontrado,
      });
    }
  }

  if (linhasComModelo.length > 0) {
    console.log(
      `🔍 Linhas encontradas no PDF para o modelo "${modelo}":`,
      linhasComModelo
    );
  } else {
    console.log(
      `⚠️ Nenhuma linha encontrada no PDF para o modelo "${modelo}".`
    );
  }

  return linhasComModelo;
}

// Função que controla a lógica de mensagem
async function handleMessage(userMessage, cliente, pdfPath) {
  let historico = carregarHistorico();
  let threadId = buscarThreadId(cliente);

  if (!threadId) {
    console.log("📝 Criando uma nova thread para o cliente...");
    threadId = await createThread();
    salvarThreadId(threadId, cliente);
  } else {
    console.log(`📂 Thread existente encontrada: ${threadId}`);
  }

  await addMessage(threadId, userMessage);
  console.log(`💬 Mensagem adicionada à thread: ${threadId}`);
  const runId = await runAssistant(threadId);
  console.log(
    `▶️ Rodando assistant para a thread: ${threadId}, com runId: ${runId}`
  );

  while (true) {
    const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runObject.status === "completed") {
      const response = await checkingStatus(threadId, runId);

      console.log("📥 Resposta recebida do Assistant: ", response);
      historico.push({ pergunta: userMessage, resposta: response });
      salvarHistorico(historico);

      // Usar Regex para extrair o modelo da resposta
      const modeloRegex = /modelo\s([a-zA-Z0-9.\s]+)/i;
      const modeloEncontrado = response.match(modeloRegex);

      if (modeloEncontrado && modeloEncontrado[1]) {
        const modelo = modeloEncontrado[1].trim();
        console.log(`🔎 Modelo extraído da resposta: ${modelo}`);

        const linhasDoPDF = await buscarModeloNoPDF(modelo, pdfPath);

        if (linhasDoPDF.length > 0) {
          const modelosFormatados = linhasDoPDF
            .map((linha) => `${linha.descricao} - Preço: ${linha.preco}`)
            .join("\n");

          const novaResposta = `
            A tela disponível para o modelo ${modelo} na loja é a seguinte:\n${modelosFormatados}\n\n${response}
          `;
          return novaResposta;
        } else {
          console.log("⚠️ Nenhuma linha encontrada no PDF para o modelo.");
          return response;
        }
      } else {
        console.log("⚠️ Não foi possível extrair o modelo da resposta.");
        return response;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

module.exports = {
  handleMessage,
};
