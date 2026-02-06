import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Créer le dossier temp s'il n'existe pas
 */
export function ensureTempDir() {
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

/**
 * Supprimer un fichier en toute sécurité
 */
export function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
}

/**
 * Générer un ID unique
 */
export function generateId(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Formater une durée en secondes vers HH:MM:SS
 */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formater les vues YouTube
 */
export function formatViews(views) {
  if (!views) return '0';
  
  if (views >= 1000000000) {
    return `${(views / 1000000000).toFixed(1)}B`;
  }
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  
  return views.toString();
}

/**
 * Valider une URL
 */
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Extraire l'ID YouTube d'une URL
 */
export function extractYouTubeId(url) {
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
 * Délai (sleep)
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Limiter le taux d'appels
 */
export function rateLimiter() {
  const calls = [];
  const windowMs = 60000; // 1 minute
  const maxCalls = 60; // 60 appels par minute
  
  return {
    canCall: () => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Nettoyer les appels anciens
      while (calls.length > 0 && calls[0] < windowStart) {
        calls.shift();
      }
      
      if (calls.length >= maxCalls) {
        return false;
      }
      
      calls.push(now);
      return true;
    },
    
    getWaitTime: () => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      while (calls.length > 0 && calls[0] < windowStart) {
        calls.shift();
      }
      
      if (calls.length < maxCalls) {
        return 0;
      }
      
      return calls[0] - windowStart;
    }
  };
}

/**
 * Parser les cookies d'une réponse HTTP
 */
export function parseCookies(cookieHeader) {
  const cookies = {};
  
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  
  return cookies;
}

/**
 * Générer des headers User-Agent aléatoires
 */
export function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Formater la date
 */
export function formatDate(date, format = 'fr-FR') {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString(format, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Tronquer le texte
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Nettoyer le texte HTML
 */
export function cleanHtml(html) {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, ' ') // Supprimer les balises HTML
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples
    .trim();
}

/**
 * Gestion des erreurs API
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
  
  toJSON() {
    return {
      success: false,
      error: this.message,
      statusCode: this.statusCode,
      data: this.data,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validation des paramètres
 */
export function validateParams(params, required) {
  const missing = [];
  
  required.forEach(param => {
    if (!params[param] && params[param] !== 0 && params[param] !== false) {
      missing.push(param);
    }
  });
  
  if (missing.length > 0) {
    throw new ApiError(
      `Paramètres manquants: ${missing.join(', ')}`,
      400,
      { missing: missing }
    );
  }
}

/**
 * Générer une réponse API standard
 */
export function apiResponse(data, message = 'Success', statusCode = 200) {
  return {
    success: true,
    statusCode: statusCode,
    message: message,
    data: data,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Middleware de validation
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      // Valider les paramètres de la requête
      if (schema.body) {
        const { error } = schema.body.validate(req.body);
        if (error) {
          throw new ApiError(error.details[0].message, 400);
        }
      }
      
      if (schema.query) {
        const { error } = schema.query.validate(req.query);
        if (error) {
          throw new ApiError(error.details[0].message, 400);
        }
      }
      
      if (schema.params) {
        const { error } = schema.params.validate(req.params);
        if (error) {
          throw new ApiError(error.details[0].message, 400);
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Cache simple en mémoire
 */
export class SimpleCache {
  constructor(ttl = 60000) { // 1 minute par défaut
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value, ttl = this.ttl) {
    const expire = Date.now() + ttl;
    this.cache.set(key, { value, expire });
    return value;
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expire) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  delete(key) {
    return this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

/**
 * Logger personnalisé
 */
export class Logger {
  constructor(service = 'AZURA-API') {
    this.service = service;
  }
  
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      service: this.service,
      level,
      message,
      ...data
    };
    
    console.log(JSON.stringify(logEntry));
    
    // Vous pouvez aussi écrire dans un fichier
    // this.writeToFile(logEntry);
  }
  
  info(message, data = {}) {
    this.log('INFO', message, data);
  }
  
  warn(message, data = {}) {
    this.log('WARN', message, data);
  }
  
  error(message, data = {}) {
    this.log('ERROR', message, data);
  }
  
  debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data);
    }
  }
  
  writeToFile(entry) {
    const logFile = path.join(ensureTempDir(), 'azura-api.log');
    const logLine = JSON.stringify(entry) + '\n';
    
    fs.appendFileSync(logFile, logLine, 'utf8');
  }
}

// Export du logger par défaut
export const logger = new Logger();

/**
 * Health check
 */
export function healthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
}