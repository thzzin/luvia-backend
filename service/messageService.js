const Contato = require('../models/Contato');
const Conversa = require('../models/Conversation');
const Message = require('../models/Message');
const Admin = require('../models/Admin')
// Função para buscar um contato pelo número de telefone ou criar um novo
// Função para buscar ou criar um contato (usando o número como o ID do contato)
async function findOrCreateContact(phoneNumber, name, adminId) {
  try {
    const phoneAsString = phoneNumber.toString();
    const phoneAdmin = adminId.toString()

    let contact = await Contato.findOne({ where: { phone_number: phoneAsString } });
    if (!contact) {
      contact = await Contato.create({ phone_number: phoneAsString, name, email: null, phoneadmin: phoneAdmin});
    }
    return contact.phone_number; // Retorna o phone_number
  } catch (error) {
    console.error('Erro ao buscar ou criar contato:', error);
    throw error;
  }
}

async function findOrCreateConversation(contactId, adminId, idConversation) {
  try {
    //console.log('contactId', contactId);
    const phoneAdmin = adminId.toString()
    const idConversationS = idConversation.toString()
    let conversation = await Conversa.findOne({ where: { contato_id: contactId } });
    if (!conversation) {
      conversation = await Conversa.create({ contato_id: contactId, phoneadmin: phoneAdmin, idConversation: idConversationS}); // Use o phone_number aqui
    }
    //console.log('criou conversa', conversation);
    return conversation;
  } catch (error) {
    console.error('Erro ao buscar ou criar conversa:', error);
    throw error;
  }
}

// Função para salvar a mensagem
async function saveMessage(conversationId, contactId, content, type, adminId, phoneNumber, idConversation) {
  try {
    //console.log('recebeu: ', conversationId, contactId, content, type, adminId);
    
    // Mapeia o tipo de mensagem para os valores válidos
    const validMessageType = type === 'text' ? 'received' : type;
    const message = await Message.create({
      conversation_id: conversationId.toString(),
      contato_id: contactId.toString(),
      content,
      message_type: validMessageType, // Use o tipo de mensagem mapeado
      admin_id: adminId.toString(),
      phonecontact: phoneNumber.toString(),
      idConversa: idConversation.toString(),
    });
    
    return message;
  } catch (error) {
    throw error;
  }
}


async function receivedMessage(incomingData) {
  try {
    for (const messageData of incomingData) {
      const phoneNumber = messageData.contacts[0].wa_id; 
      const name = messageData.contacts[0].profile.name;
      const content = messageData.messages[0].text.body;
      const messageType = messageData.messages[0].type;
      const adminId = messageData.metadata.display_phone_number;
      const idConversation = messageData.messages[0].id

      const contactId = await findOrCreateContact(phoneNumber, name, adminId);
      const conversation = await findOrCreateConversation(contactId, adminId, idConversation);

      const savedMsg= await saveMessage(conversation.id, contactId, content, messageType, adminId, phoneNumber, idConversation);

      return savedMsg;
    }
  } catch (error) {
    console.error('Erro ao processar as mensagens:', error);
    throw error;
  }
}




// Função para buscar um contato pelo número de telefone
async function findContactByPhoneNumber(phoneNumber) {
  try {
    const contact = await Contato.findOne({
      where: { phone_number: phoneNumber },
    });
    return contact;
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    throw error;
  }
}

// Função para buscar uma conversa por ID de contato
async function findConversationByContactId(contactId) {
  try {
    const conversation = await Conversa.findOne({
      where: { contato_id: contactId },
    });
    return conversation;
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    throw error;
  }
}

async function botMsg(incomingData) {
  try {
    for (const messageData of incomingData) {
      const phoneNumber = messageData.chatId; // Use o wa_id como phone_number
      const content = messageData.text;
      const messageType = 'sent';
      const adminId = messageData.display_phone_number;
      const idConversation = messageData.chatMessageId
      const conversationIdInt = parseInt(idConversation);
      
      const name = phoneNumber.toString()
      const contactId = await findOrCreateContact(phoneNumber, name, adminId);
      const conversation = await findOrCreateConversation(contactId, adminId, idConversation);
      const conversId = conversation.id

      console.log('conversation_id', conversId.toString())
      console.log('contato_id', phoneNumber.toString())
      console.log('content', content)
      console.log('message_type', messageType)
      console.log('admin_id', adminId.toString())
      console.log('phonecontact', phoneNumber.toString())
      console.log('idConversa', idConversation.toString())
      
      const message = await Message.create({
        conversation_id: conversId.toString(),
        contato_id: phoneNumber.toString(),
        content,
        message_type: messageType, // Use o tipo de mensagem mapeado
        admin_id: adminId.toString(),
        phonecontact: phoneNumber.toString(),
        idConversa: idConversation.toString()
      });

      return message;
    }
  } catch (error) {
    //console.error('Erro ao processar as mensagens:', error);
    throw error;
  }
}

async function msgClient(adminId, conversationId, phonecontact, idConversa, content)  {
  try{ 
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error("Administrador não encontrado.");
    }
    const phoneadmin = admin.phone
    const idNumero = admin.idNumero
    const acessToken = admin.acessToken
    
    const message = await Message.create({
      conversation_id: conversationId,
      contato_id: contactId,
      content,
      message_type: 'sent', // Use o tipo de mensagem mapeado
      admin_id: phoneadmin,
      phonecontact: phonecontact,
      idConversa: idConversa,
    });
    return message;

  }catch(error){

  }
}

async function postImg(params) {
  
}

async function postAudios(req, res) {
  try{

  }catch(error){

  }
}

async function postDoc(req, res) {
  try{

  }catch(error){

  }
}

module.exports = {
  receivedMessage,
  findContactByPhoneNumber,
  findConversationByContactId,
  botMsg,
  msgClient,
  postImg,
  postAudios,
  postDoc
};
