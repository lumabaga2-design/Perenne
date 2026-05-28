// backend/modules/search/search.controller.js

const searchModel = require('./search.model');

class SearchController {

  //  BÚSQUEDA GLOBAL 
  async globalSearch(req, res) {
    try {
      // La búsqueda  como parámetro en la URL

      const { q } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'El término de búsqueda es obligatorio' });
      }

      // No se permiten búsquedas de menos de 2 caracteres
      if (q.trim().length < 2) {
        return res.status(400).json({ message: 'El término debe tener al menos 2 caracteres' });
      }

      const results = await searchModel.globalSearch(q.trim());
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
  }

  //  BÚSQUEDA DE USUARIOS 
  async searchUsers(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: 'El término debe tener al menos 2 caracteres' });
      }

      const users = await searchModel.searchUsers(q.trim());
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar usuarios', error: error.message });
    }
  }

  //  BÚSQUEDA DE PRODUCTOS 
  async searchProducts(req, res) {
    try {
      const { q, minPrice, maxPrice, sortBy, sortOrder } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: 'El término debe tener al menos 2 caracteres' });
      }

      const results = await searchModel.searchProducts({
        query: q.trim(),
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      });
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar productos', error: error.message });
    }
  }

  //  BÚSQUEDA DE CONTENIDO 
  async searchContent(req, res) {
    try {
      const { q, contentType } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: 'El término debe tener al menos 2 caracteres' });
      }

      const results = await searchModel.searchContent({
        query: q.trim(),
        contentType
      });
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar contenido', error: error.message });
    }
  }

  //  PERFIL DE USUARIO 
  async getUserProfile(req, res) {
    try {
      const profile = await searchModel.getUserProfile(req.params.userId);

      if (!profile) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
  }
}

module.exports = new SearchController();