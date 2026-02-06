# 🚀 AZURA API

Une API puissante pour le téléchargement multimédia et les outils IA, développée avec ❤️ par **Précieux Développeur**.

![AZURA API Banner](https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1767454349524_108341.jpeg)

## ✨ Fonctionnalités

- **🎵 YouTube** - Recherche, informations audio/vidéo, téléchargement
- **📌 Pinterest** - Recherche et téléchargement d'images/vidéos
- **🎧 Apple Music** - Recherche de musique
- **👻 Anime** - Recherche d'anime et informations détaillées
- **📱 TikTok** - Recherche de contenu
- **📁 MediaFire** - Recherche de fichiers
- **🎶 SoundCloud** - Téléchargement audio
- **📱 APK** - Recherche et téléchargement d'applications
- **🤖 IA Tools** - ChatGPT, Google Gemini, génération d'images

## 🚀 Déploiement Rapide

### Sur Render.com

1. **Forkez ce repository** sur votre compte GitHub
2. **Connectez Render** à votre repository
3. **Configurez** avec ces paramètres :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
4. **Ajoutez les variables d'environnement** (optionnel)

### Variables d'environnement

```env
PORT=3000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

📚 Documentation API

Base URL

```
https://azura-api.onrender.com/api/v1
```

Endpoints Principaux

YouTube

```http
GET /youtube/search?q={query}&limit={10}
POST /youtube/audio/download
POST /youtube/video/download
```

Pinterest

```http
GET /pinterest/search?q={query}
POST /pinterest/download
```

IA Tools

```http
POST /ai/chatgpt
POST /ai/gemini
POST /ai/generate-image
```

🎯 Utilisation

Exemple avec JavaScript

```javascript
// Recherche YouTube
const response = await fetch('https://azura-api.onrender.com/api/v1/youtube/search?q=music&limit=5');
const data = await response.json();
console.log(data.results);

// ChatGPT
const aiResponse = await fetch('https://azura-api.onrender.com/api/v1/ai/chatgpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Explain quantum computing' })
});
const aiData = await aiResponse.json();
```

Exemple avec Python

```python
import requests

# Recherche Pinterest
response = requests.get('https://azura-api.onrender.com/api/v1/pinterest/search?q=nature')
data = response.json()
print(data['results'])

# Téléchargement audio YouTube
payload = {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "quality": "128k"
}
response = requests.post('https://azura-api.onrender.com/api/v1/youtube/audio/download', json=payload)
```

🛠️ Développement Local

```bash
# Cloner le repository
git clone https://github.com/precieux0/AZURA-API.git
cd AZURA-API

# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

📊 Statistiques

· Temps de réponse moyen : < 2 secondes
· Disponibilité : 99.9%
· Support : JSON uniquement
· Limite de taux : 100 requêtes/15 minutes

🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (git checkout -b feature/AmazingFeature)
3. Committez vos changements (git commit -m 'Add some AmazingFeature')
4. Pushez (git push origin feature/AmazingFeature)
5. Ouvrez une Pull Request

📞 Support

· GitHub Issues : https://github.com/precieux0/AZURA-API/issues
· Email : Contact via GitHub

📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

🙏 Remerciements

· Précieux Développeur - Créateur et mainteneur
· Render.com - Hébergement gratuit
· Tous les contributeurs - Pour leur support

---

<p align="center">
  <i>Développé avec ❤️ par Précieux Développeur</i><br>
  <a href="https://github.com/precieux0">GitHub</a> • 
  <a href="https://azura-api.onrender.com">Live Demo</a> • 
  <a href="https://azura-api.onrender.com/docs">Documentation</a>
</p>
```