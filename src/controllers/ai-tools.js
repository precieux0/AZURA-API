import { ApiClient } from '../services/api-clients.js';

export class AIToolsController {
  static async chatGPT(req, res) {
    try {
      const { prompt, context } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "prompt" est requis'
        });
      }

      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
      const data = await ApiClient.chatGPT(fullPrompt);

      if (!data) {
        return res.status(500).json({
          success: false,
          error: 'Erreur de l\'API IA'
        });
      }

      res.json({
        success: true,
        response: data.data || data.response || data,
        model: 'gpt-3.5-turbo',
        tokens: data.tokens || 'unknown'
      });
    } catch (error) {
      console.error('ChatGPT error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de réponse'
      });
    }
  }

  static async gemini(req, res) {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "prompt" est requis'
        });
      }

      // Utiliser l'API générique avec le bon endpoint
      const data = await ApiClient.request(`https://api.zenzxz.my.id/ai/gemini?text=${encodeURIComponent(prompt)}`);

      res.json({
        success: true,
        response: data.response || data.assistant || data,
        model: 'gemini-pro',
        service: 'Google Gemini'
      });
    } catch (error) {
      console.error('Gemini error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de réponse'
      });
    }
  }

  static async generateImage(req, res) {
    try {
      const { prompt, service = 'dalle', aspect_ratio = '2:3' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "prompt" est requis'
        });
      }

      let imageUrl;
      
      if (service === 'dalle') {
        const data = await ApiClient.generateImage(prompt, 'dalle');
        // L'API DALL-E retourne directement l'image
        // On retourne l'URL complète
        imageUrl = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`;
      } else if (service === 'flux') {
        const data = await ApiClient.generateImage(prompt, 'flux');
        imageUrl = data.image_link;
      }

      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          error: 'Impossible de générer l\'image'
        });
      }

      res.json({
        success: true,
        image: {
          url: imageUrl,
          prompt: prompt,
          service: service,
          aspect_ratio: aspect_ratio,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Image generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération d\'image'
      });
    }
  }

  static async listModels(req, res) {
    try {
      res.json({
        success: true,
        models: [
          {
            id: 'chatgpt',
            name: 'ChatGPT',
            description: 'Modèle de langage OpenAI',
            capabilities: ['text-generation', 'conversation', 'translation'],
            max_tokens: 4096
          },
          {
            id: 'gemini',
            name: 'Google Gemini',
            description: 'Modèle IA de Google',
            capabilities: ['text-generation', 'reasoning', 'code-generation'],
            max_tokens: 8192
          },
          {
            id: 'dalle',
            name: 'DALL-E',
            description: 'Générateur d\'images OpenAI',
            capabilities: ['image-generation'],
            resolutions: ['256x256', '512x512', '1024x1024']
          },
          {
            id: 'flux',
            name: 'Flux AI',
            description: 'Générateur d\'images avancé',
            capabilities: ['image-generation'],
            aspect_ratios: ['1:1', '2:3', '3:2', '16:9']
          }
        ]
      });
    } catch (error) {
      console.error('List models error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des modèles'
      });
    }
  }
}