import { ApiClient } from '../services/api-clients.js';

export class PinterestController {
  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      // Utiliser l'API externe
      const data = await ApiClient.searchPinterest(q);

      if (!data || !data.data?.medias) {
        return res.status(404).json({
          success: false,
          error: 'Aucun résultat trouvé'
        });
      }

      const results = data.data.medias.map(media => ({
        url: media.url,
        extension: media.extension,
        type: media.extension === 'mp4' ? 'video' : 'image',
        quality: media.quality || 'original'
      }));

      res.json({
        success: true,
        query: q,
        count: results.length,
        results: results
      });
    } catch (error) {
      console.error('Pinterest search error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche Pinterest'
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

      // Utiliser l'API externe
      const data = await ApiClient.downloadPinterest(url);

      if (!data || !data.data?.data?.url) {
        // Essayer une autre API en secours
        try {
          const backupData = await ApiClient.searchPinterest(url);
          
          if (backupData?.data?.medias?.length > 0) {
            const media = backupData.data.medias[0];
            
            return res.json({
              success: true,
              media: {
                url: media.url,
                type: media.extension === 'mp4' ? 'video' : 'image',
                extension: media.extension,
                quality: media.quality || 'original'
              },
              direct_download: media.url
            });
          }
        } catch (backupError) {
          console.log('Backup API also failed');
        }

        return res.status(404).json({
          success: false,
          error: 'Impossible de télécharger le média'
        });
      }

      res.json({
        success: true,
        media: {
          url: data.data.data.url,
          type: data.data.data.type,
          size: data.data.data.size,
          extension: data.data.data.url.split('.').pop()
        },
        direct_download: data.data.data.url
      });
    } catch (error) {
      console.error('Pinterest download error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement Pinterest'
      });
    }
  }
}