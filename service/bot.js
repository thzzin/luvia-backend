require("dotenv").config();
const { buscarTelasPorModelo } = require("./botsemgpt");

const fs = require("fs");
const path = require("path");

const OpenAI = require("openai");
const { error } = require("console");
const { OPENAI_API_KEY, ID_ASSISTENT } = process.env;
console.log("OpenAI API Key:", OPENAI_API_KEY);
console.log("ID_ASSISTENT:", ID_ASSISTENT);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

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

// Função que controla a lógica de mensagem
async function handleMessage(userMessage) {
  let historico = carregarHistorico();

  // Verificar se a mensagem já foi feita
  const resultadoHistorico = buscarNoHistorico(userMessage, historico);

  if (resultadoHistorico) {
    // Se a pergunta já está no histórico, retornar a resposta salva
    console.log(
      "Resposta encontrada no histórico:",
      resultadoHistorico.resposta
    );
    return resultadoHistorico.resposta;
  }
  const keywords = [
    "tela",
    "celular",
    "modelo",
    "smartphone",
    "display",
    "preço",
    "marca",
    "comprar",
    "substituir",
    "reparo",
    "tem",
    "do",
  ];

  const containsKeywords = keywords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword)
  );

  if (!containsKeywords) {
    console.log("Mensagem irrelevante, não processando.");
    return;
  }

  try {
    // Buscar resposta do sistema local
    const semgpt = await buscarTelasPorModelo(userMessage);

    // Adicionar a nova interação ao histórico
    historico.push({
      pergunta: userMessage,
      resposta: semgpt,
      timestamp: new Date().toISOString(),
    });

    // Salvar o histórico atualizado
    salvarHistorico(historico);

    console.log(semgpt);
    return semgpt;
  } catch {
    console.log("erro", error);
  }

  try {
    const threadId = await createThread();
    await addMessage(threadId, userMessage);
    console.log("Assistant ID:", ID_ASSISTENT);

    const runId = await runAssistant(threadId);

    while (true) {
      const runObject = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
      );
      if (runObject.status === "completed") {
        const response = await checkingStatus(threadId, runId);
        return response;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error("Error processing messages:", error);
    throw error; // Lança o erro para que possa ser tratado em outro lugar
  }
}

module.exports = {
  handleMessage,
};
