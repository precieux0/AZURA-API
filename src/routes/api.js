import express from 'express';
import { YouTubeController } from '../controllers/youtube.js';
import { PinterestController } from '../controllers/pinterest.js';
import { AppleMusicController } from '../controllers/apple-music.js';
import { AnimeController } from '../controllers/anime.js';
import { TikTokController } from '../controllers/tiktok.js';
import { MediaFireController } from '../controllers/mediafire.js';
import { SoundCloudController } from '../controllers/soundcloud.js';
import { AptoideController } from '../controllers/aptoide.js';
import { AIToolsController } from '../controllers/ai-tools.js';

const router = express.Router();

// Route d'accueil de l'API
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur AZURA API v1.0',
    description: 'Une API puissante pour le téléchargement multimédia et les outils IA',
    developer: 'Précieux Développeur',
    version: '1.0.0',
    endpoints: {
      youtube: {
        search: 'GET /api/v1/youtube/search?q=query&limit=10',
        audio_info: 'GET /api/v1/youtube/audio/info?url=youtube_url',
        download_audio: 'POST /api/v1/youtube/audio/download',
        download_video: 'POST /api/v1/youtube/video/download'
      },
      pinterest: {
        search: 'GET /api/v1/pinterest/search?q=query',
        download: 'POST /api/v1/pinterest/download'
      },
      apple_music: {
        search: 'GET /api/v1/apple-music/search?q=query',
        info: 'GET /api/v1/apple-music/info?url=track_url'
      },
      anime: {
        search: 'GET /api/v1/anime/search?q=query',
        info: 'GET /api/v1/anime/info?id=mal_id'
      },
      tiktok: {
        search: 'GET /api/v1/tiktok/search?q=query',
        download: 'POST /api/v1/tiktok/download'
      },
      mediafire: {
        search: 'GET /api/v1/mediafire/search?q=query',
        info: 'GET /api/v1/mediafire/info?url=file_url'
      },
      soundcloud: {
        download: 'POST /api/v1/soundcloud/download',
        info: 'GET /api/v1/soundcloud/info?url=track_url'
      },
      aptoide: {
        search: 'GET /api/v1/aptoide/search?q=app_name',
        download: 'POST /api/v1/aptoide/download'
      },
      ai: {
        chatgpt: 'POST /api/v1/ai/chatgpt',
        gemini: 'POST /api/v1/ai/gemini',
        generate_image: 'POST /api/v1/ai/generate-image',
        models: 'GET /api/v1/ai/models'
      }
    },
    documentation: 'https://github.com/precieux0/AZURA-API',
    support: 'https://github.com/precieux0/AZURA-API/issues'
  });
});

// Routes YouTube
router.get('/youtube/search', YouTubeController.search);
router.get('/youtube/audio/info', YouTubeController.getAudioInfo);
router.post('/youtube/audio/download', YouTubeController.downloadAudio);
router.post('/youtube/video/download', YouTubeController.downloadVideo);

// Routes Pinterest
router.get('/pinterest/search', PinterestController.search);
router.post('/pinterest/download', PinterestController.download);

// Routes Apple Music
router.get('/apple-music/search', AppleMusicController.search);
router.get('/apple-music/info', AppleMusicController.getTrackInfo);

// Routes Anime
router.get('/anime/search', AnimeController.search);
router.get('/anime/info', AnimeController.getInfo);

// Routes TikTok
router.get('/tiktok/search', TikTokController.search);
router.post('/tiktok/download', TikTokController.download);

// Routes MediaFire
router.get('/mediafire/search', MediaFireController.search);
router.get('/mediafire/info', MediaFireController.getFileInfo);

// Routes SoundCloud
router.post('/soundcloud/download', SoundCloudController.download);
router.get('/soundcloud/info', SoundCloudController.getTrackInfo);

// Routes Aptoide
router.get('/aptoide/search', AptoideController.search);
router.post('/aptoide/download', AptoideController.download);

// Routes IA
router.post('/ai/chatgpt', AIToolsController.chatGPT);
router.post('/ai/gemini', AIToolsController.gemini);
router.post('/ai/generate-image', AIToolsController.generateImage);
router.get('/ai/models', AIToolsController.listModels);

export default router;'