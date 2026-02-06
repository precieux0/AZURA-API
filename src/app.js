import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, healthCheck } from './services/utilities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration de l'application Express
 */
export function createApp() {
  const app = express();
  
  // Middleware de sécurité
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://azura-api.onrender.com"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  
  // CORS configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: {
      success: false,
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
      statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  
  // Apply rate limiting to API routes
  app.use('/api/v1', limiter);
  
  // Compression
  app.use(compression());
  
  // Logging
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info('HTTP Request', { message: message.trim() })
    }
  }));
  
  // Body parsing
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Servir les fichiers statiques
  app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
  
  // Middleware de logging personnalisé
  app.use((req, res, next) => {
    const start = Date.now();
    
    // Log de la requête
    logger.info('Incoming Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Hook pour logger la réponse
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - start;
      
      logger.info('Outgoing Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length') || 'unknown'
      });
      
      return originalSend.call(this, body);
    };
    
    next();
  });
  
  // Route de santé
  app.get('/health', (req, res) => {
    res.json(healthCheck());
  });
  
  // Route de bienvenue
  app.get('/api', (req, res) => {
    res.json({
      message: 'Bienvenue sur AZURA API',
      version: '1.0.0',
      description: 'API puissante pour le téléchargement multimédia et outils IA',
      developer: 'Précieux Développeur',
      endpoints: {
        v1: '/api/v1',
        documentation: '/docs',
        health: '/health'
      }
    });
  });
  
  // Gestion des erreurs 404
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      error: 'Route non trouvée',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });
  
  // Gestionnaire d'erreurs global
  app.use((err, req, res, next) => {
    logger.error('Unhandled Error', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Une erreur interne est survenue';
    
    res.status(statusCode).json({
      success: false,
      error: message,
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
  
  return app;
}

/**
 * Démarrer le serveur
 */
export function startServer(app, port = process.env.PORT || 3000) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info('Server Started', {
        port: port,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid
      });
      
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    █████╗ ███████╗██╗   ██╗██████╗  █████╗                  ║
║   ██╔══██╗╚══███╔╝██║   ██║██╔══██╗██╔══██╗                 ║
║   ███████║  ███╔╝ ██║   ██║██████╔╝███████║                 ║
║   ██╔══██║ ███╔╝  ██║   ██║██╔══██╗██╔══██║                 ║
║   ██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║                 ║
║   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝                 ║
║                                                              ║
║    █████╗ ██████╗ ██╗                                       ║
║   ██╔══██╗██╔══██╗██║                                       ║
║   ███████║██████╔╝██║                                       ║
║   ██╔══██║██╔═══╝ ██║                                       ║
║   ██║  ██║██║     ██║                                       ║
║   ╚═╝  ╚═╝╚═╝     ╚═╝                                       ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🚀 AZURA API v1.0.0                                        ║
║  📡 Port: ${port.toString().padEnd(44)}║
║  👨‍💻 Développeur: Précieux                                  ║
║  🌐 Environnement: ${(process.env.NODE_ENV || 'development').padEnd(36)}║
║                                                              ║
║  🔗 API: http://localhost:${port}/api/v1                    ║
║  📚 Docs: http://localhost:${port}/docs                     ║
║  🩺 Health: http://localhost:${port}/health                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
      
      resolve(server);
    });
    
    server.on('error', (error) => {
      logger.error('Server Start Error', {
        error: error.message,
        code: error.code,
        port: port
      });
      
      reject(error);
    });
    
    // Gestion gracieuse de l'arrêt
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
  });
}

/**
 * Arrêt gracieux du serveur
 */
function gracefulShutdown(server) {
  logger.info('Shutdown Signal Received', { signal: 'SIGTERM/SIGINT' });
  
  server.close(() => {
    logger.info('Server Gracefully Stopped');
    process.exit(0);
  });
  
  // Forcer l'arrêt après 10 secondes
  setTimeout(() => {
    logger.warn('Forcing Shutdown After Timeout');
    process.exit(1);
  }, 10000);
}

// Si ce fichier est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createApp();
  
  // Ajouter les routes API
  import('./routes/api.js').then(module => {
    app.use('/api/v1', module.default);
    
    // Route de documentation
    app.get('/docs', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    // Route racine
    app.get('/', (req, res) => {
      res.redirect('/docs');
    });
    
    startServer(app).catch(console.error);
  }).catch(error => {
    console.error('Failed to load API routes:', error);
    process.exit(1);
  });
}

export default createApp;