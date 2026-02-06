import { ApiClient } from '../services/api-clients.js';

export class MediaFireController {
  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      const data = await ApiClient.searchMediaFire(q);

      if (!data.results || data.results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aucun fichier trouvé'
        });
      }

      const results = data.results.map(file => ({
        filename: file.filename,
        filesize: file.filesize,
        url: file.url,
        source_url: file.source_url,
        source_title: file.source_title,
        uploaded: file.uploaded,
        type: file.type || 'unknown'
      }));

      res.json({
        success: true,
        query: q,
        count: results.length,
        results: results
      });
    } catch (error) {
      console.error('MediaFire search error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche MediaFire'
      });
    }
  }

  static async getFileInfo(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "url" est requis'
        });
      }

      // MediaFire nécessite l'extraction directe des liens
      // Pour l'instant, retourner les infos de base
      res.json({
        success: true,
        info: {
          url: url,
          service: 'MediaFire',
          supported_operations: ['search']
        }
      });
    } catch (error) {
      console.error('MediaFire info error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des informations'
      });
    }
  }
}