const { getPageInfo, getConversation,getConversationCount, postConversation } = require('../../client/manychat/getInfo');
const {getContacts, postContact} = require('../../client/manychat/getContact')
const { getChat, newConversation } = require('../../client/manychat/getChats');
const {getInbox} = require('../../client/manychat/getInbox')
const { saveProfile } = require('../../service/profileService');
const {sendMessage} = require('../../client/manychat/getMsg')
const {getInfos} = require('../../service/profileService')

async function getProfile(req, res) {
  try {
    const adminId = req.user.id;
    const profile = await getInfos(adminId);
    //await saveProfile(profile); // Chama o serviço para salvar as informações no banco
    res.json(profile);
  } catch (err) {
    console.error('Error fetching users', err.stack);
    res.status(500).send('Server error');
  }
}

async function getConversations(req, res) {
  try {
    const profile = await getConversation();
    res.json(profile);
  } catch (err) {
    console.error('Error fetching users', err.stack);
    res.status(500).send('Server error');
  }
}

async function getConversationsCount(req, res) {
  try {
    const profile = await getConversationCount();
    res.json(profile);
  } catch (err) {
    console.error('Error fetching users', err.stack);
    res.status(500).send('Server error');
  }
}

async function getChats(req, res) {
  try {
    const { id } = req.query;  // Capture o id da query string
    console.log('getchats chamado', id)
    const profile = await getChat(id);
    res.json(profile);
  } catch (err) {
    console.error('Error fetching users', err.stack);
    res.status(500).send('Server error');
  }
}

async function postConversations(req, res) {
  try{
    const newConver = await newConversation()
      res.json(newConver)
  }catch(error){
    console.log('error', error)
  }
}

async function listContact(req, res) {
  try{
    const contacts = await getContacts()
    res.json(contacts)
  }catch(error){
    console.log('error', error)

  }
}

async function postContacts(req, res) {
  const {name, phone, avatar_url} = req.body
  try{
    const contato = await postContact(name, phone, avatar_url)
    res.json(contato)
  }catch(error){
    console.log('error', error)
  }
}

async function apiMensagem(req, res) {
  const data = req.body;

  const contact = data.contacts[0];  // Dados do contato
  const message = data.messages[0];  // Dados da mensagem
  try{
      console.log('phone', phone
      
        //pesquisar se tem contato salvo

        //achar conversa

        //enviar mensagem na conversa


        //criar contato
        //criar conversa
        //add msg conversa
      )

  res.json()
  }catch(error){

  }
}

async function getInboxs(params) {
  try{
    console.log('vai upar Inbox')
    res.json(inbox)
  }catch(error){
    console.log('error', error)

  }
}

async function postMessage(req, res) {
  const {message_type,status,content,conversation_id} = req.body
  const newMsg = {
    content: content,
    conversation_id: conversation_id,
    message_type: message_type,
    status: status
  }
  console.log(newMsg)
    try{
      const message = await sendMessage(newMsg)
      res.json(message)
    }catch(error){
      console.log('error', error)

    }
}

module.exports = {
  getProfile,
  getConversations,
  getConversationsCount,
  postConversations,
  getChats,
  listContact,
  postContacts,
  getInboxs,
  postMessage,
  apiMensagem
};
