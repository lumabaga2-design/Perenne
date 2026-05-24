// backend/modules/feed/feed.controller.js

const feedModel = require('./feed.model');

class FeedController {

  //  FEED GENERAL 
  async getFeed(req, res) {
    try {
      const feedItems = await feedModel.getFeed();
      res.status(200).json(feedItems);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el feed', error: error.message });
    }
  }

  //  EXPLORAR 
  async getExploreContent(req, res) {
    try {
      const exploreItems = await feedModel.getExploreContent();
      res.status(200).json(exploreItems);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener contenido para explorar', error: error.message });
    }
  }
}

module.exports = new FeedController();