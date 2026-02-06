import { ApiClient } from '../services/api-clients.js';

export class AptoideController {
  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      const data = await ApiClient.searchAPK(q);

      if (!data || data.status !== 200 || !data.result) {
        return res.status(404).json({
          success: false,
          error: 'APK non trouvé'
        });
      }

      const apk = data.result;

      res.json({
        success: true,
        query: q,
        apk: {
          name: apk.name,
          package: apk.package,
          lastup: apk.lastup,
          size: apk.size,
          icon: apk.icon,
          dllink: apk.dllink,
          version: apk.version,
          downloads: apk.downloads,
          rating: apk.rating,
          screenshots: apk.screenshots || [],
          description: apk.description || ''
        }
      });
    } catch (error) {
      console.error('APK search error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche d\'APK'
      });
    }
  }

  static async download(req, res) {
    try {
      const { packageName, url } = req.body;
      
      if (!packageName && !url) {
        return res.status(400).json({
          success: false,
          error: 'Soit "packageName" soit "url" est requis'
        });
      }

      let downloadUrl;
      
      if (packageName) {
        const data = await ApiClient.searchAPK(packageName);
        
        if (!data || data.status !== 200 || !data.result?.dllink) {
          return res.status(404).json({
            success: false,
            error: 'APK non trouvé'
          });
        }
        
        downloadUrl = data.result.dllink;
      } else {
        downloadUrl = url;
      }

      res.json({
        success: true,
        download: {
          url: downloadUrl,
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.android.package-archive, application/octet-stream'
          },
          note: 'Some APK files may be large. Consider using a download manager.'
        }
      });
    } catch (error) {
      console.error('APK download error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement d\'APK'
      });
    }
  }
}