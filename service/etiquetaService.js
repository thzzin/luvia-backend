const Contato = require('../models/Contato');
const Conversa = require('../models/Conversation');
const Message = require('../models/Message');
const Admin = require('../models/Admin')
const Etiquetas = require('../models/Etiquetas')

async function getEtiquetasByAdminId(adminId) {
    try {
      const etiquetas = await Etiquetas.findAll({
        where: {
          adminId: adminId
        }
      });
  
      if (etiquetas.length > 0) {
        return etiquetas;
      } else {
        return `No labels found for adminId: ${adminId}`;
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw error;
    }
  }
  async function postEtiqueta(adminId, name, color) { 
    try {
      // Criação da etiqueta com conversationId como null
      const newEtiqueta = await Etiquetas.create({
        adminId: adminId,
        //conversationId: null, // Deixa o conversationId como null inicialmente
        name: name,
        color: color
      });
  
      return newEtiqueta; // Retorna a etiqueta criada
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  }

  async function editEtiqueta(id, updates) { 
    try {
      // Atualiza a etiqueta com base no ID e nos campos fornecidos em updates
      const [updatedRowsCount] = await Etiquetas.update(updates, {
        where: { id: id }
      });
  
      if (updatedRowsCount === 0) {
        console.error('Não achou label')
      }
  
      // Retorna a etiqueta atualizada
      const updatedEtiqueta = await Etiquetas.findByPk(id);
      return updatedEtiqueta;
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  }

  async function deleteEtiqueta(id) { 
    try {
      // Deleta a etiqueta com o ID fornecido
      const deletedRowsCount = await Etiquetas.destroy({
        where: { id: id }
      });
  
      if (deletedRowsCount === 0) {
        console.error('Não achou label');
    }
  
      return { message: 'Label deleted successfully' };
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
    }
  }

  async function addTagChats(adminId, conversaId, etiquetaid) {
    try {
      // Encontra a conversa pelo ID
      const conversa = await Conversa.findByPk(conversaId);
  
      if (!conversa) {
        throw new Error('Conversa não encontrada');
      }
  
      // Se o campo `tags` ainda não estiver inicializado, inicialize-o como um array vazio
      if (!conversa.tags) {
        conversa.tags = [];
      }
  
      // Adiciona o novo ID da etiqueta (etiquetaid) ao array de tags, se ele não estiver presente
      if (!conversa.tags.includes(etiquetaid)) {
        conversa.tags.push(etiquetaid);
      } else {
        throw new Error('Etiqueta já está associada a essa conversa');
      }
  
      // Salva a conversa atualizada
      await conversa.save();
  
      return conversa;
    } catch (error) {
      console.error('Erro ao adicionar etiqueta na conversa:', error);
      throw error;
    }
  }
  
  
  

  module.exports = {
    getEtiquetasByAdminId,
    postEtiqueta,
    editEtiqueta,
    deleteEtiqueta,
    addTagChats
  }