import { ApiClient } from '../services/api-clients.js';

export class AnimeController {
  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      const data = await ApiClient.searchAnime(q);

      if (!data.data || data.data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aucun anime trouvé'
        });
      }

      const results = data.data.slice(0, 10).map(anime => ({
        mal_id: anime.mal_id,
        title: anime.title,
        title_japanese: anime.title_japanese,
        type: anime.type,
        chapters: anime.chapters,
        volumes: anime.volumes,
        status: anime.status,
        score: anime.score,
        synopsis: anime.synopsis,
        background: anime.background,
        authors: anime.authors?.map(author => author.name) || [],
        genres: anime.genres?.map(genre => genre.name) || [],
        images: anime.images?.jpg?.image_url,
        url: anime.url,
        published: anime.published?.string,
        members: anime.members,
        favorites: anime.favorites
      }));

      res.json({
        success: true,
        query: q,
        count: results.length,
        results: results
      });
    } catch (error) {
      console.error('Anime search error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche d\'anime'
      });
    }
  }

  static async getInfo(req, res) {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "id" (MyAnimeList ID) est requis'
        });
      }

      // Pour l'instant, on utilise la même API
      const data = await ApiClient.searchAnime(id);

      if (!data.data || data.data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Anime non trouvé'
        });
      }

      const anime = data.data[0];

      const info = {
        title: anime.title,
        title_japanese: anime.title_japanese,
        type: anime.type,
        chapters: anime.chapters,
        volumes: anime.volumes,
        status: anime.status,
        score: anime.score,
        synopsis: anime.synopsis,
        background: anime.background,
        authors: anime.authors?.map(author => author.name) || [],
        genres: anime.genres?.map(genre => genre.name) || [],
        images: anime.images?.jpg?.image_url,
        url: anime.url,
        published: anime.published?.string,
        members: anime.members,
        favorites: anime.favorites,
        demographic: anime.demographics?.map(d => d.name) || []
      };

      res.json({
        success: true,
        info: info
      });
    } catch (error) {
      console.error('Anime info error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des informations'
      });
    }
  }
}