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
    assistant_id: assistantId,
  });
  return response.id;
}

// Função para extrair a resposta do assistente
function getAssistantResponse(messagesList) {
  const assistantMessages = messagesList.filter(
    (message) => message.role === "assistant"
  );

  if (assistantMessages.length > 0) {
    const content = assistantMessages[0].content; // Pegando a primeira mensagem do assistente

    // Extraindo o texto da mensagem
    const contentText = content
      .map((item) => {
        if (item.type === "text") {
          return item.text.value; // Acessa o texto diretamente
        }
        return "Unsupported type"; // Para tipos não suportados
      })
      .join(""); // Combina o texto se houver mais de um

    return contentText; // Retorna o texto combinado
  } else {
    return "No response from assistant."; // Mensagem padrão se não houver resposta
  }
}

// Função para checar o status do run
async function checkingStatus(threadId, runId) {
  const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
  const status = runObject.status;

  if (status === "completed") {
    const messagesList = await openai.beta.threads.messages.list(threadId);
    // Chama a função para obter a resposta do assistente
    return getAssistantResponse(messagesList.body.data);
  } else {
    throw new Error("Assistant is still processing..."); // Lança erro se não estiver completo
  }
}

// Função que controla a lógica de mensagem
async function handleMessage(userMessage) {
  const threadId = await createThread();
  await addMessage(threadId, userMessage);
  const runId = await runAssistant(threadId);

  // Verifica o status até que o run seja completado
  while (true) {
    const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runObject.status === "completed") {
      const response = await checkingStatus(threadId, runId);
      return response; // Retorna a resposta do assistente
    }

    // Espera 5 segundos antes de checar novamentee
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

module.exports = {
  handleMessage,
};
