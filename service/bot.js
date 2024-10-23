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

async function buscarModeloNoPDF(modelo, caminhoPDF) {
  const dataBuffer = fs.readFileSync(caminhoPDF);
  const pdfData = await pdfParse(dataBuffer);

  // Criar regex para buscar linhas que contêm o modelo exato
  const regexModelo = new RegExp(`\\b${modelo}\\b`, "i"); // Busca exata ignorando maiúsculas/minúsculas

  // Buscar todas as linhas que contêm o modelo
  const linhasComModelo = pdfData.text
    .split("\n")
    .filter((linha) => regexModelo.test(linha));

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
async function handleMessage(userMessage, cliente) {
  let historico = carregarHistorico();

  // Verificar se o cliente já possui um threadId salvo
  let threadId = buscarThreadId(cliente);

  if (!threadId) {
    console.log("📝 Criando uma nova thread para o cliente...");
    // Se não existe um threadId para o cliente, cria uma nova thread
    threadId = await createThread();
    salvarThreadId(threadId, cliente);
  } else {
    console.log(`📂 Thread existente encontrada: ${threadId}`);
  }

  // Adiciona a mensagem na thread existente ou nova
  await addMessage(threadId, userMessage);
  console.log(`💬 Mensagem adicionada à thread: ${threadId}`);

  console.log("💡 Assistant ID:", ID_ASSISTENT);

  const runId = await runAssistant(threadId);
  console.log(
    `▶️ Rodando assistant para a thread: ${threadId}, com runId: ${runId}`
  );

  while (true) {
    const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runObject.status === "completed") {
      const response = await checkingStatus(threadId, runId);

      console.log("📥 Resposta recebida do Assistant: ", response);

      // Salvar no histórico a pergunta e resposta
      historico.push({
        pergunta: userMessage,
        resposta: response,
      });
      salvarHistorico(historico);

      // Extrair o modelo da resposta com base no formato "para o modelo...na loja é o seguinte"
      // Regex mais flexível para capturar o modelo da resposta
      const modeloRegex = /modelo\s+([\w\s\d-.]+)/i;
      const modeloEncontrado = response.match(modeloRegex);

      if (modeloEncontrado && modeloEncontrado[1]) {
        const modelo = modeloEncontrado[1].trim();
        console.log(`🔎 Modelo extraído da resposta: ${modelo}`);

        // Buscar as linhas do PDF para o modelo
        const linhasDoPDF = await buscarModeloNoPDF(modelo, pdfPath);

        if (linhasDoPDF.length > 0) {
          console.log(
            `✅ Linhas correspondentes encontradas no PDF para o modelo "${modelo}":`,
            linhasDoPDF
          );

          // Formatar as linhas encontradas no PDF
          const modelosFormatados = linhasDoPDF
            .map((linha) => {
              const precoRegex = /(R\$[0-9,.]+)/;
              const precoEncontrado = linha.match(precoRegex);

              const descricao = linha.replace("f.", "").trim();
              const preco = precoEncontrado
                ? precoEncontrado[0]
                : "Preço não encontrado";

              return `${descricao} - Preço: ${preco}`;
            })
            .join("\n");

          // Verificar se alguma linha do PDF não estava na resposta do ChatGPT
          const linhasChatGPT = response
            .split("\n")
            .map((linha) => linha.trim());
          const linhasFaltantes = modelosFormatados
            .split("\n")
            .filter((linha) => !linhasChatGPT.includes(linha));

          const novaResposta = `
            A tela disponível para o modelo ${modelo} na loja é a seguinte:\n${modelosFormatados}\n\n${response}
        `;

          if (linhasFaltantes.length > 0) {
            console.log(
              "⚠️ Linhas adicionais encontradas no PDF que não estavam na resposta original:",
              linhasFaltantes
            );
            const mensagemAdicional = `Além disso, as seguintes telas para o modelo ${modelo} foram encontradas no PDF mas não mencionadas na resposta original:\n${linhasFaltantes.join(
              "\n"
            )}`;
            return `${novaResposta}\n\n${mensagemAdicional}`;
          }

          return novaResposta;
        } else {
          console.log("⚠️ Nenhuma linha encontrada no PDF para o modelo.");
          return response;
        }
      } else {
        console.log("⚠️ Não foi possível extrair o modelo da resposta.");
        return response;
      }
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

module.exports = {
  handleMessage,
};
