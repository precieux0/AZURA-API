import axios from 'axios';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureTempDir, safeUnlink } from './utilities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DownloaderService {
  constructor() {
    this.tempDir = ensureTempDir();
  }

  /**
   * Télécharger depuis une URL vers un fichier temporaire
   */
  async downloadToFile(url, filename) {
    const tempPath = path.join(this.tempDir, filename);
    
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 30000
      });

      const writer = fs.createWriteStream(tempPath);
      
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(tempPath));
        writer.on('error', reject);
      });
    } catch (error) {
      safeUnlink(tempPath);
      throw error;
    }
  }

  /**
   * Télécharger en buffer mémoire
   */
  async downloadToBuffer(url, maxSize = 50 * 1024 * 1024) { // 50MB max
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        maxContentLength: maxSize,
        timeout: 30000
      });

      return Buffer.from(response.data);
    } catch (error) {
      if (error.response?.status === 413) {
        throw new Error(`Fichier trop volumineux (> ${maxSize / 1024 / 1024}MB)`);
      }
      throw error;
    }
  }

  /**
   * Télécharger vidéo YouTube avec ytdl
   */
  async downloadYouTubeVideo(videoUrl, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const {
          quality = 'highest',
          format = 'mp4',
          outputPath = null
        } = options;

        const videoId = this.extractYouTubeId(videoUrl);
        if (!videoId) {
          throw new Error('URL YouTube invalide');
        }

        const filename = `yt_${videoId}_${Date.now()}.${format}`;
        const filePath = outputPath || path.join(this.tempDir, filename);

        const videoStream = ytdl(videoUrl, {
          quality: quality,
          filter: format === 'mp4' ? 'audioandvideo' : 'audioonly',
        });

        const writeStream = fs.createWriteStream(filePath);
        
        videoStream.pipe(writeStream);

        let info = null;
        
        // Récupérer les infos
        ytdl.getInfo(videoUrl).then(videoInfo => {
          info = videoInfo;
        }).catch(() => {
          // Ignorer les erreurs d'info
        });

        writeStream.on('finish', () => {
          const stats = fs.statSync(filePath);
          resolve({
            path: filePath,
            size: stats.size,
            filename: filename,
            videoId: videoId,
            info: info,
            type: format === 'mp4' ? 'video' : 'audio',
            mimeType: format === 'mp4' ? 'video/mp4' : 'audio/mpeg'
          });
        });

        writeStream.on('error', (err) => {
          safeUnlink(filePath);
          reject(err);
        });

        videoStream.on('error', (err) => {
          safeUnlink(filePath);
          reject(err);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Télécharger audio YouTube
   */
  async downloadYouTubeAudio(videoUrl, options = {}) {
    return this.downloadYouTubeVideo(videoUrl, {
      ...options,
      format: 'mp3',
      quality: 'highestaudio'
    });
  }

  /**
   * Streamer un fichier vers une réponse HTTP
   */
  streamFile(filePath, res, filename = null) {
    return new Promise((resolve, reject) => {
      const stat = fs.statSync(filePath);
      
      if (filename) {
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }
      
      res.setHeader('Content-Length', stat.size);
      
      const readStream = fs.createReadStream(filePath);
      
      readStream.pipe(res);
      
      readStream.on('end', () => {
        resolve();
      });
      
      readStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Extraire l'ID d'une URL YouTube
   */
  extractYouTubeId(url) {
    const patterns = [
      /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  /**
   * Vérifier si une URL est valide
   */
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  /**
   * Nettoyer le nom de fichier
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^\w\s.-]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 200);
  }

  /**
   * Obtenir le type MIME d'un fichier
   */
  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.apk': 'application/vnd.android.package-archive',
      '.exe': 'application/x-msdownload',
      '.txt': 'text/plain',
      '.json': 'application/json'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Formater la taille du fichier
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Vérifier si un fichier est une vidéo
   */
  isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv'];
    const ext = path.extname(filename).toLowerCase();
    return videoExtensions.includes(ext);
  }

  /**
   * Vérifier si un fichier est une image
   */
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  /**
   * Vérifier si un fichier est audio
   */
  isAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
    const ext = path.extname(filename).toLowerCase();
    return audioExtensions.includes(ext);
  }

  /**
   * Nettoyer les fichiers temporaires anciens
   */
  cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;
      
      files.forEach(file => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          safeUnlink(filePath);
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Télécharger avec retry
   */
  async downloadWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.downloadToBuffer(url, options.maxSize);
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          // Attendre avant de réessayer (backoff exponentiel)
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
    
    throw lastError;
  }
}

// Singleton
export const downloader = new DownloaderService();