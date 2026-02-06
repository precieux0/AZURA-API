// Configuration des APIs externes
export const API_CONFIG = {
  // YouTube & Media
  youtube: {
    search: 'https://api.zenzxz.my.id/api/youtube/search',
    download: 'https://api-yume.vercel.app/download/ytdl'
  },
  
  // Apple Music
  appleMusic: 'https://api-yume.vercel.app/search/applemusic',
  
  // Anime
  anime: 'https://api.jikan.moe/v4',
  
  // Pinterest
  pinterest: {
    search: 'https://api.privatezia.biz.id/api/downloader/pinterestdl',
    download: 'https://gokublack.xyz/download/pin'
  },
  
  // TikTok
  tiktok: 'https://api.delirius.store/search/tiktoksearch',
  
  // MediaFire
  mediafire: 'https://api.stellarwa.xyz/search/mediafire',
  
  // SoundCloud
  soundcloud: 'https://api.siputzx.my.id/api/d/soundcloud',
  
  // APK
  aptoide: 'https://api.nexoracle.com/downloader/apk',
  
  // IA Tools
  ai: {
    chatgpt: 'https://api.delirius.store/ia/gptprompt',
    gemini: 'https://api.zenzxz.my.id/ai/gemini',
    dalle: 'https://eliasar-yt-api.vercel.app/api/ai/text2img',
    flux: 'https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image'
  }
};

// Client API générique
export class ApiClient {
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'AZURA-API/1.0 (compatible; +https://github.com/precieux0/AZURA-API)',
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Méthodes spécifiques
  static async searchYouTube(query, limit = 10) {
    return this.request(`${API_CONFIG.youtube.search}?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  static async downloadYouTubeAudio(url, quality = '128k') {
    return this.request(`${API_CONFIG.youtube.download}?url=${encodeURIComponent(url)}&type=audio&quality=${quality}`);
  }

  static async downloadYouTubeVideo(url, quality = '480') {
    return this.request(`${API_CONFIG.youtube.download}?url=${encodeURIComponent(url)}&type=video&quality=${quality}`);
  }

  static async searchAppleMusic(query) {
    return this.request(`${API_CONFIG.appleMusic}?q=${encodeURIComponent(query)}&limit=5`);
  }

  static async searchAnime(query) {
    return this.request(`${API_CONFIG.anime}/manga?q=${encodeURIComponent(query)}`);
  }

  static async searchPinterest(query) {
    return this.request(`${API_CONFIG.pinterest.search}?url=${encodeURIComponent(query)}`);
  }

  static async downloadPinterest(url) {
    return this.request(`${API_CONFIG.pinterest.download}?url=${encodeURIComponent(url)}`);
  }

  static async searchTikTok(query) {
    return this.request(`${API_CONFIG.tiktok}?query=${encodeURIComponent(query)}`);
  }

  static async searchMediaFire(query) {
    return this.request(`${API_CONFIG.mediafire}?query=${encodeURIComponent(query)}&key=this-xyz`);
  }

  static async downloadSoundCloud(url) {
    return this.request(`${API_CONFIG.soundcloud}?url=${encodeURIComponent(url)}`);
  }

  static async searchAPK(appName) {
    return this.request(`${API_CONFIG.aptoide}?apikey=free_key@maher_apis&q=${encodeURIComponent(appName)}`);
  }

  static async chatGPT(prompt) {
    return this.request(`${API_CONFIG.ai.chatgpt}?text=${encodeURIComponent(prompt)}`);
  }

  static async generateImage(prompt, service = 'dalle') {
    if (service === 'dalle') {
      return this.request(`${API_CONFIG.ai.dalle}?prompt=${encodeURIComponent(prompt)}`);
    } else if (service === 'flux') {
      return this.request(`${API_CONFIG.ai.flux}?prompt=${encodeURIComponent(prompt)}&aspect_ratio=2:3`);
    }
  }
}