import { ApiClient } from '../services/api-clients.js';
import yts from 'yt-search';

export class YouTubeController {
  static async search(req, res) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      // Utiliser yts pour la recherche
      const results = await yts(q);
      const videos = results.videos.slice(0, parseInt(limit));

      const formattedResults = videos.map(video => ({
        id: video.videoId,
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        channel: video.author?.name || video.author,
        duration: video.duration,
        views: video.views,
        uploaded: video.uploadedAt || video.ago,
        description: video.description?.slice(0, 200)
      }));

      res.json({
        success: true,
        query: q,
        count: formattedResults.length,
        results: formattedResults
      });
    } catch (error) {
      console.error('YouTube search error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche YouTube'
      });
    }
  }

  static async getAudioInfo(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "url" est requis'
        });
      }

      // Essayer l'API externe d'abord
      try {
        const data = await ApiClient.downloadYouTubeAudio(url);
        
        if (data && data.status && data.result) {
          return res.json({
            success: true,
            source: 'external-api',
            info: {
              title: data.result.title,
              duration: data.result.duration,
              thumbnail: data.result.thumbnail,
              quality: data.result.quality,
              format: data.result.format
            },
            download: data.result.dl_url ? {
              url: data.result.dl_url,
              method: 'GET'
            } : null
          });
        }
      } catch (apiError) {
        console.log('External API failed, using fallback');
      }

      // Fallback: Utiliser ytdl-core pour les infos
      const ytdl = await import('ytdl-core');
      const info = await ytdl.getInfo(url);
      const details = info.videoDetails;

      res.json({
        success: true,
        source: 'fallback',
        info: {
          title: details.title,
          duration: Number(details.lengthSeconds),
          thumbnail: details.thumbnails?.pop()?.url,
          channel: details.author?.name,
          views: details.viewCount,
          description: details.description?.slice(0, 300)
        },
        note: 'Audio download requires external converter'
      });
    } catch (error) {
      console.error('Audio info error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des informations audio'
      });
    }
  }

  static async downloadAudio(req, res) {
    try {
      const { url, query, quality = '128k' } = req.body;
      const input = url || query;

      if (!input) {
        return res.status(400).json({
          success: false,
          error: 'Soit "url" soit "query" est requis'
        });
      }

      let videoUrl = input;
      
      // Si c'est une recherche, chercher d'abord
      if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
        const results = await yts(input);
        if (!results.videos || results.videos.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Aucune vidéo trouvée pour cette recherche'
          });
        }
        videoUrl = results.videos[0].url;
      }

      // Utiliser l'API externe pour le téléchargement
      const data = await ApiClient.downloadYouTubeAudio(videoUrl, quality);

      if (!data.status || !data.result?.dl_url) {
        return res.status(404).json({
          success: false,
          error: 'Impossible de télécharger l\'audio'
        });
      }

      res.json({
        success: true,
        info: {
          title: data.result.title,
          duration: data.result.duration,
          quality: data.result.quality,
          format: data.result.format
        },
        download: {
          url: data.result.dl_url,
          method: 'GET',
          headers: {
            'Accept': 'audio/mpeg, audio/*'
          }
        }
      });
    } catch (error) {
      console.error('Audio download error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement audio'
      });
    }
  }

  static async downloadVideo(req, res) {
    try {
      const { url, query, quality = '480' } = req.body;
      const input = url || query;

      if (!input) {
        return res.status(400).json({
          success: false,
          error: 'Soit "url" soit "query" est requis'
        });
      }

      let videoUrl = input;
      
      if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
        const results = await yts(input);
        if (!results.videos || results.videos.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Aucune vidéo trouvée pour cette recherche'
          });
        }
        videoUrl = results.videos[0].url;
      }

      const data = await ApiClient.downloadYouTubeVideo(videoUrl, quality);

      if (!data.status || !data.result?.dl_url) {
        return res.status(404).json({
          success: false,
          error: 'Impossible de télécharger la vidéo'
        });
      }

      res.json({
        success: true,
        info: {
          title: data.result.title,
          duration: data.result.duration,
          quality: data.result.quality,
          format: data.result.format
        },
        download: {
          url: data.result.dl_url,
          method: 'GET',
          headers: {
            'Accept': 'video/mp4, video/*'
          }
        }
      });
    } catch (error) {
      console.error('Video download error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement vidéo'
      });
    }
  }
}