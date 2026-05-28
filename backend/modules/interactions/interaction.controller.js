// backend/modules/interactions/interaction.controller.js

const interactionModel = require('./interaction.model');

const VALID_ITEM_TYPES = ['product', 'content'];

class InteractionController {

  // ════════════════════════════════════════════════════════════
  //  ME GUSTA
  // ════════════════════════════════════════════════════════════

  //   ME GUSTA 
  // Si el usuario ya dio like lo quita, si no lo da
  // se necesita que sea un toggle 
  async toggleLike(req, res) {
    try {
      const { userId, itemId, itemType } = req.body;

      if (!userId || !itemId || !itemType) {
        return res.status(400).json({ message: 'userId, itemId e itemType son obligatorios' });
      }

      if (!VALID_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({ message: 'itemType debe ser product o content' });
      }

      // verificacion de si ya existe el like
      const alreadyLiked = await interactionModel.userAlreadyLiked(userId, itemId, itemType);

      if (alreadyLiked) {
        // Si ya tenía like, lo quitamos
        await interactionModel.removeLike(userId, itemId, itemType);
        const totalLikes = await interactionModel.getLikeCount(itemId, itemType);
        return res.status(200).json({ message: 'Me gusta eliminado', liked: false, totalLikes });
      } else {
        // Si no tenía like, lo agregamos
        await interactionModel.addLike(userId, itemId, itemType);
        const totalLikes = await interactionModel.getLikeCount(itemId, itemType);
        return res.status(200).json({ message: 'Me gusta agregado', liked: true, totalLikes });
      }

    } catch (error) {
      res.status(500).json({ message: 'Error al procesar el me gusta', error: error.message });
    }
  }

  //  OBTENER CONTEO DE LIKES 
  async getLikeCount(req, res) {
    try {
      const { itemId, itemType } = req.params;

      if (!VALID_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({ message: 'itemType debe ser product o content' });
      }

      const totalLikes = await interactionModel.getLikeCount(itemId, itemType);
      res.status(200).json({ itemId, itemType, totalLikes });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los me gustas', error: error.message });
    }
  }

  // ════════════════════════════════════════════════════════════
  //  COMENTARIOS
  // ════════════════════════════════════════════════════════════

  //  CREAR COMENTARIO 
  async createComment(req, res) {
    try {
      const { userId, itemId, itemType, body, parentId } = req.body;

      if (!userId || !itemId || !itemType || !body) {
        return res.status(400).json({ message: 'userId, itemId, itemType y body son obligatorios' });
      }

      if (!VALID_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({ message: 'itemType debe ser product o content' });
      }

      const result = await interactionModel.createComment(req.body);
      res.status(201).json({
        message:    parentId ? 'Respuesta agregada exitosamente' : 'Comentario agregado exitosamente',
        commentId:  result.insertId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el comentario', error: error.message });
    }
  }

  //  OBTENER COMENTARIOS 
  async getCommentsByItem(req, res) {
    try {
      const { itemId, itemType } = req.params;

      if (!VALID_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({ message: 'itemType debe ser product o content' });
      }

      const comments = await interactionModel.getCommentsByItem(itemId, itemType);
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los comentarios', error: error.message });
    }
  }

  //  ACTUALIZAR COMENTARIO 
  async updateComment(req, res) {
    try {
      const { body } = req.body;

      if (!body) {
        return res.status(400).json({ message: 'El contenido del comentario es obligatorio' });
      }

      const result = await interactionModel.updateComment(req.params.commentId, body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
      }
      res.status(200).json({ message: 'Comentario actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el comentario', error: error.message });
    }
  }

  //  ELIMINAR COMENTARIO 
  async deleteComment(req, res) {
    try {
      const result = await interactionModel.deleteComment(req.params.commentId);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
      }
      res.status(200).json({ message: 'Comentario eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el comentario', error: error.message });
    }
  }

  // ════════════════════════════════════════════════════════════
  //  COMPARTIR
  // ════════════════════════════════════════════════════════════

  //  CREAR LINK COMPARTIDO 
  async createShare(req, res) {
    try {
      const { userId, itemId, itemType } = req.body;

      if (!userId || !itemId || !itemType) {
        return res.status(400).json({ message: 'userId, itemId e itemType son obligatorios' });
      }

      if (!VALID_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({ message: 'itemType debe ser product o content' });
      }

      const result  = await interactionModel.createShare(userId, itemId, itemType);

      //  link completo que el usuario puede compartir
      const shareUrl = `http://localhost:3000/api/interactions/share/${result.shareCode}`;

      res.status(201).json({
        message:    'Link de compartido generado exitosamente',
        shareCode:  result.shareCode,
        shareUrl
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al generar el link', error: error.message });
    }
  }

  //  RESOLVER LINK COMPARTIDO 
  // Cuando alguien abre el link, redirigir al item correspondiente
  async resolveShareCode(req, res) {
    try {
      const result = await interactionModel.resolveShareCode(req.params.shareCode);

      if (!result) {
        return res.status(404).json({ message: 'Link no válido o expirado' });
      }

      // Devolvemos a qué item apunta el link
      res.status(200).json({
        itemId:   result.item_id,
        itemType: result.item_type,
        // El frontend usará esto para redirigir al producto o contenido
        redirectUrl: `http://localhost:3000/api/${result.item_type}s/${result.item_id}`
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al resolver el link', error: error.message });
    }
  }

  //  OBTENER CONTEO DE COMPARTIDOS 
  async getShareCount(req, res) {
    try {
      const { itemId, itemType } = req.params;

      if (!VALID_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({ message: 'itemType debe ser product o content' });
      }

      const totalShares = await interactionModel.getShareCount(itemId, itemType);
      res.status(200).json({ itemId, itemType, totalShares });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los compartidos', error: error.message });
    }
  }
}

module.exports = new InteractionController();