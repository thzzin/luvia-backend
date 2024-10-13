require("dotenv").config();

const OpenAI = require("openai");
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

// Função que controla a lógica de mensagem
async function handleMessage(userMessage) {
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
  ];

  const containsKeywords = keywords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword)
  );

  if (!containsKeywords) {
    console.log("Mensagem irrelevante, não processando.");
    return;
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
