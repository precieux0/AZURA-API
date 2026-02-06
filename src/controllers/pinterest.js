import axios from 'axios';
import * as cheerio from 'cheerio';

export class PinterestController {
  
  // Fonction de recherche Pinterest (web scraping)
  static async pinsSearch(query) {
    const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22applied_unified_filters%22%3Anull%2C%22appliedProductFilters%22%3A%22---%22%2C%22article%22%3Anull%2C%22auto_correction_disabled%22%3Afalse%2C%22corpus%22%3Anull%2C%22customized_rerank_type%22%3Anull%2C%22domains%22%3Anull%2C%22dynamicPageSizeExpGroup%22%3A%22control%22%2C%22filters%22%3Anull%2C%22journey_depth%22%3Anull%2C%22page_size%22%3Anull%2C%22price_max%22%3Anull%2C%22price_min%22%3Anull%2C%22query_pin_sigs%22%3Anull%2C%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22redux_normalize_feed%22%3Atrue%2C%22request_params%22%3Anull%2C%22rs%22%3A%22typed%22%2C%22scope%22%3A%22pins%22%2C%22selected_one_bar_modules%22%3Anull%2C%22seoDrawerEnabled%22%3Afalse%2C%22source_id%22%3Anull%2C%22source_module_id%22%3Anull%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped%22%2C%22top_pin_id%22%3Anull%2C%22top_pin_ids%22%3Anull%7D%2C%22context%22%3A%7B%7D%7D`;
    
    const headers = {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'priority': 'u=1, i',
      'referer': 'https://id.pinterest.com/',
      'screen-dpr': '1',
      'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133")',
      'sec-ch-ua-full-version-list': '"Not(A:Brand";v="99.0.0.0", "Google Chrome";v="133.0.6943.142", "Chromium";v="133.0.6943.142")',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-model': '""',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua-platform-version': '"10.0.0"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      'x-app-version': 'c056fb7',
      'x-pinterest-appstate': 'active',
      'x-pinterest-pws-handler': 'www/index.js',
      'x-pinterest-source-url': '/',
      'x-requested-with': 'XMLHttpRequest'
    };
    
    try {
      const res = await axios.get(link, { headers });
      
      if (res.data && 
          res.data.resource_response && 
          res.data.resource_response.data && 
          res.data.resource_response.data.results) {
        
        return res.data.resource_response.data.results
          .map(item => {
            if (item.images) {
              return {
                url: item.images.orig?.url || item.images['564x']?.url || null,
                title: item.title || item.grid_title || `Pinterest - ${query}`,
                type: item.images.orig?.url?.includes('.mp4') ? 'video' : 'image',
                extension: item.images.orig?.url?.includes('.mp4') ? 'mp4' : 'jpg',
                quality: 'original',
                source: 'pinterest_api'
              };
            }
            return null;
          })
          .filter(img => img !== null && img.url !== null);
      }
      return [];
    } catch (error) {
      console.error('Pinterest search API error:', error.message);
      return [];
    }
  }

  // Fonction de téléchargement Pinterest (web scraping)
  static async pinDownload(pinUrl) {
    try {
      const res = await axios.get(pinUrl, { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" 
        } 
      });
      
      const $ = cheerio.load(res.data);
      
      // Essayer d'abord le format vidéo
      const videoScript = $('script[data-test-id="video-snippet"]');
      if (videoScript.length) {
        const result = JSON.parse(videoScript.text());
        return {
          url: pinUrl,
          download: result.contentUrl,
          title: result.name || 'Pinterest Video',
          type: 'video',
          extension: 'mp4',
          size: 'unknown'
        };
      }
      
      // Sinon, chercher l'image
      const jsonScript = $("script[data-relay-response='true']").eq(0);
      if (jsonScript.length) {
        try {
          const json = JSON.parse(jsonScript.text());
          const result = json.response?.data?.["v3GetPinQuery"]?.data;
          
          if (result) {
            return {
              url: pinUrl,
              download: result.imageLargeUrl || result.imageMediumUrl || result.images?.orig?.url,
              title: result.title || 'Pinterest Image',
              type: 'image',
              extension: result.imageLargeUrl?.split('.').pop() || 'jpg',
              size: 'unknown'
            };
          }
        } catch (parseError) {
          console.log('JSON parse error:', parseError.message);
        }
      }
      
      // Fallback: chercher des meta tags
      const metaImage = $('meta[property="og:image"]').attr('content') ||
                       $('meta[name="twitter:image"]').attr('content') ||
                       $('link[rel="image_src"]').attr('href');
      
      if (metaImage) {
        return {
          url: pinUrl,
          download: metaImage,
          title: $('title').text() || 'Pinterest',
          type: metaImage.includes('.mp4') ? 'video' : 'image',
          extension: metaImage.split('.').pop() || 'jpg',
          size: 'unknown'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Pinterest download error:', error.message);
      return null;
    }
  }

  // API Search Endpoint
  static async search(req, res) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "q" est requis'
        });
      }

      const results = await this.pinsSearch(q);
      
      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aucun résultat trouvé'
        });
      }

      const limitedResults = results.slice(0, parseInt(limit));
      
      res.json({
        success: true,
        query: q,
        count: limitedResults.length,
        total_count: results.length,
        results: limitedResults.map(item => ({
          url: item.url,
          title: item.title,
          type: item.type,
          extension: item.extension,
          quality: item.quality,
          source: item.source
        }))
      });
    } catch (error) {
      console.error('Pinterest search endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche Pinterest',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // API Download Endpoint
  static async download(req, res) {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre "url" est requis'
        });
      }

      // Valider que c'est une URL Pinterest
      if (!url.includes('pinterest.com') && !url.includes('pin.it')) {
        return res.status(400).json({
          success: false,
          error: 'URL Pinterest invalide'
        });
      }

      const mediaData = await this.pinDownload(url);
      
      if (!mediaData || !mediaData.download) {
        return res.status(404).json({
          success: false,
          error: 'Impossible de récupérer le média Pinterest'
        });
      }

      res.json({
        success: true,
        media: {
          url: url,
          download_url: mediaData.download,
          title: mediaData.title,
          type: mediaData.type,
          extension: mediaData.extension,
          size: mediaData.size
        },
        direct_download: mediaData.download,
        note: mediaData.type === 'video' ? 'Vidéo MP4 disponible' : 'Image disponible'
      });
    } catch (error) {
      console.error('Pinterest download endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement Pinterest',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}