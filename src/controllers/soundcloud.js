import { ApiClient } from '../services/api-clients.js';

export class SoundCloudController {
  static async download(req, res) {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "url" est requis'
        });
      }

      const data = await ApiClient.downloadSoundCloud(url);

      if (!data.status || !data.data) {
        return res.status(404).json({
          success: false,
          error: 'Impossible de télécharger le fichier audio'
        });
      }

      const track = data.data;
      const duration = `${Math.floor(track.duration / 60000).toString().padStart(2, '0')}:${Math.floor(track.duration / 1000 % 60).toString().padStart(2, '0')}`;

      res.json({
        success: true,
        track: {
          title: track.title,
          user: track.user,
          duration: duration,
          thumbnail: track.thumbnail,
          genre: track.genre,
          play_count: track.play_count,
          likes_count: track.likes_count,
          comment_count: track.comment_count
        },
        download: {
          url: track.url,
          method: 'GET',
          headers: {
            'Accept': 'audio/mpeg, audio/*'
          }
        }
      });
    } catch (error) {
      console.error('SoundCloud download error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement SoundCloud'
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

      // SoundCloud API nécessite un client_id
      // Pour l'instant, utiliser l'API de téléchargement pour les infos
      const data = await ApiClient.downloadSoundCloud(url);

      if (!data.status || !data.data) {
        return res.status(404).json({
          success: false,
          error: 'Piste non trouvée'
        });
      }

      const track = data.data;
      const duration = `${Math.floor(track.duration / 60000).toString().padStart(2, '0')}:${Math.floor(track.duration / 1000 % 60).toString().padStart(2, '0')}`;

      res.json({
        success: true,
        info: {
          title: track.title,
          user: track.user,
          duration: duration,
          thumbnail: track.thumbnail,
          genre: track.genre,
          play_count: track.play_count,
          likes_count: track.likes_count,
          comment_count: track.comment_count,
          description: track.description || '',
          created_at: track.created_at,
          permalink_url: track.permalink_url
        }
      });
    } catch (error) {
      console.error('SoundCloud info error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des informations'
      });
    }
  }
