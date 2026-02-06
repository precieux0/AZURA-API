import { ApiClient } from '../services/api-clients.js';

export class AppleMusicController {
  static async search(req, res) {
    try {
      const { q, limit = 5 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      const data = await ApiClient.searchAppleMusic(q);

      if (!data.status || !data.results) {
        return res.status(404).json({
          success: false,
          error: 'Aucun résultat trouvé'
        });
      }

      const results = data.results.slice(0, parseInt(limit)).map(track => ({
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        genre: track.genre,
        explicit: track.explicit,
        cover: track.cover,
        apple_music_url: track.apple_music_url,
        release_date: track.release_date
      }));

      res.json({
        success: true,
        query: q,
        count: results.length,
        results: results
      });
    } catch (error) {
      console.error('Apple Music search error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche Apple Music'
      });
    }
  }

  static async getTrackInfo(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "url" est requis'
        });
      }

      // Pour l'instant, retourner les infos de base
      // Note: L'API Apple Music nécessite un token d'authentification
      res.json({
        success: true,
        note: 'Apple Music API requires authentication token',
        info: {
          url: url,
          service: 'Apple Music',
          supported_operations: ['search']
        }
      });
    } catch (error) {
      console.error('Apple Music info error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des informations'
      });
    }
  }
}