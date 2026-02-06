// Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Navigation entre sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Mettre à jour la navigation active
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher la section cible
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // Scroller vers le haut
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fermer tous les autres items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Basculer l'item courant
            item.classList.toggle('active');
        });
    });

    // API Tester
    const endpointSelect = document.getElementById('endpoint');
    const methodSelect = document.getElementById('method');
    const urlInput = document.getElementById('url');
    const paramsInput = document.getElementById('params');
    const sendButton = document.getElementById('sendRequest');
    const responseOutput = document.getElementById('response');

    // Endpoints mapping
    const endpoints = {
        '/api/v1/youtube/search': {
            method: 'GET',
            baseUrl: 'https://azura-api.onrender.com/api/v1/youtube/search',
            exampleParams: '{"q": "test", "limit": 5}'
        },
        '/api/v1/youtube/audio/info': {
            method: 'GET',
            baseUrl: 'https://azura-api.onrender.com/api/v1/youtube/audio/info',
            exampleParams: '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
        },
        '/api/v1/pinterest/search': {
            method: 'GET',
            baseUrl: 'https://azura-api.onrender.com/api/v1/pinterest/search',
            exampleParams: '{"q": "landscape"}'
        },
        '/api/v1/anime/search': {
            method: 'GET',
            baseUrl: 'https://azura-api.onrender.com/api/v1/anime/search',
            exampleParams: '{"q": "naruto"}'
        },
        '/api/v1/ai/chatgpt': {
            method: 'POST',
            baseUrl: 'https://azura-api.onrender.com/api/v1/ai/chatgpt',
            exampleParams: '{"prompt": "Explain quantum computing in simple terms"}'
        }
    };

    // Mettre à jour l'URL quand l'endpoint change
    endpointSelect.addEventListener('change', updateUrl);
    methodSelect.addEventListener('change', updateUrl);

    function updateUrl() {
        const selectedEndpoint = endpointSelect.value;
        const endpoint = endpoints[selectedEndpoint];
        
        if (endpoint) {
            methodSelect.value = endpoint.method;
            urlInput.value = endpoint.baseUrl;
            paramsInput.placeholder = endpoint.exampleParams;
            
            // Afficher/masquer le textarea des params selon la méthode
            paramsInput.parentElement.style.display = 
                endpoint.method === 'POST' ? 'block' : 'none';
        }
    }

    // Initialiser l'URL
    updateUrl();

    // Envoyer la requête
    sendButton.addEventListener('click', async function() {
        const method = methodSelect.value;
        const url = urlInput.value;
        const paramsText = paramsInput.value;
        
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> En cours...';
        
        try {
            let requestOptions = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            // Ajouter le body pour les requêtes POST
            if (method === 'POST' && paramsText) {
                try {
                    const params = JSON.parse(paramsText);
                    requestOptions.body = JSON.stringify(params);
                } catch (e) {
                    throw new Error('Paramètres JSON invalides');
                }
            } else if (method === 'GET' && paramsText) {
                // Pour GET, ajouter les params à l'URL
                try {
                    const params = JSON.parse(paramsText);
                    const urlObj = new URL(url);
                    Object.keys(params).forEach(key => {
                        urlObj.searchParams.append(key, params[key]);
                    });
                    urlInput.value = urlObj.toString();
                } catch (e) {
                    // Si pas JSON, ignorer
                }
            }

            // Envoyer la requête
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            
            // Afficher la réponse formatée
            responseOutput.innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;
            
        } catch (error) {
            responseOutput.innerHTML = `<code style="color: var(--danger-color)">Erreur: ${error.message}</code>`;
        } finally {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer la requête';
        }
    });

    // Syntax highlighting simple
    function highlightJSON(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }
        
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    }

    // Ajouter des styles pour le highlighting
    const style = document.createElement('style');
    style.textContent = `
        .string { color: var(--success-color); }
        .number { color: var(--primary-color); }
        .boolean { color: var(--warning-color); }
        .null { color: var(--danger-color); }
        .key { color: var(--text-primary); }
    `;
    document.head.appendChild(style);

    // Animations d'entrée
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer les cartes d'endpoints
    document.querySelectorAll('.endpoint-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});