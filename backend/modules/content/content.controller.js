// backend/modules/content/content.controller.js

const contentModel = require('./content.model');

// Tipos de contenido válidos
const VALID_CONTENT_TYPES = ['video', 'image', 'pdf', 'text', 'link'];

class ContentController {

  //  INSERCIÓN 
  async createContent(req, res) {
    try {
      const { userId, title, contentType, fileUrl, externalUrl } = req.body;

      // se validan campos obligatorios
      if (!userId || !title || !contentType) {
        return res.status(400).json({ message: 'userId, title y contentType son obligatorios' });
      }

      // se validan que el tipo de contenido sea válido
      if (!VALID_CONTENT_TYPES.includes(contentType)) {
        return res.status(400).json({
          message: `Tipo de contenido no válido. Debe ser: ${VALID_CONTENT_TYPES.join(', ')}`
        });
      }

      // Si el tipo es 'link', debe tener una URL externa
      if (contentType === 'link' && !externalUrl) {
        return res.status(400).json({ message: 'Para tipo link debes enviar externalUrl' });
      }

      // Si no es link, debe venir un archivo
      if (contentType !== 'link' && !fileUrl) {
        return res.status(400).json({ message: 'Para este tipo de contenido debes enviar fileUrl' });
      }

      const result = await contentModel.createContent(req.body);
      res.status(201).json({
        message: 'Contenido creado exitosamente',
        contentId: result.insertId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el contenido', error: error.message });
    }
  }

  //  CONSULTA TODOS 
  async getAllContent(req, res) {
    try {
      const content = await contentModel.getAllContent();
      res.status(200).json(content);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el contenido', error: error.message });
    }
  }

  //  CONSULTA POR TIPO 
  // Recibe el tipo por la URL
  async getContentByType(req, res) {
    try {
      const { contentType } = req.params;

      if (!VALID_CONTENT_TYPES.includes(contentType)) {
        return res.status(400).json({ message: 'Tipo de contenido no válido' });
      }

      const content = await contentModel.getContentByType(contentType);
      res.status(200).json(content);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el contenido', error: error.message });
    }
  }

  //  CONSULTA UNO 
  async getContentById(req, res) {
    try {
      const content = await contentModel.getContentById(req.params.id);
      if (!content) {
        return res.status(404).json({ message: 'Contenido no encontrado' });
      }
      res.status(200).json(content);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el contenido', error: error.message });
    }
  }

  //  ACTUALIZACIÓN 
  async updateContent(req, res) {
    try {
      const result = await contentModel.updateContent(req.params.id, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Contenido no encontrado' });
      }
      res.status(200).json({ message: 'Contenido actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el contenido', error: error.message });
    }
  }

  //  ELIMINACIÓN 
  async deleteContent(req, res) {
    try {
      const result = await contentModel.deleteContent(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Contenido no encontrado' });
      }
      res.status(200).json({ message: 'Contenido eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el contenido', error: error.message });
    }
  }
}

module.exports = new ContentController();