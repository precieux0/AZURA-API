import { ApiClient } from '../services/api-clients.js';

export class TikTokController {
  static async search(req, res) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      const data = await ApiClient.searchTikTok(q);

      if (!data.meta) {
        return res.status(404).json({
          success: false,
          error: 'Aucun résultat trouvé'
        });
      }

      const results = data.meta.slice(0, parseInt(limit)).map(video => ({
        title: video.title,
        description: video.description,
        duration: video.duration,
        hd: video.hd,
        sd: video.sd,
        author: video.author,
        likes: video.likes,
        comments: video.comments,
        shares: video.shares,
        views: video.views,
        created: video.created,
        thumbnail: video.thumbnail
      }));

      res.json({
        success: true,
        query: q,
        count: results.length,
        results: results
      });
    } catch (error) {
      console.error('TikTok search error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche TikTok'
      });
    }
  }

  static async download(req, res) {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "url" est requis'
        });
      }

      // TikTok nécessite généralement une API spéciale pour le téléchargement
      // Pour l'instant, retourner les infos de base
      res.json({
        success: true,
        note: 'TikTok download requires specific API endpoint',
        info: {
          url: url,
          supported_formats: ['mp4', 'webm'],
          quality: ['HD', 'SD']
        }
      });
    } catch (error) {
      console.error('TikTok download error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement TikTok'
      });
    }
  }
}