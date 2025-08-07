const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/linkedin-sales:
 *   get:
 *     summary: Page d'accueil de l'API LinkedIn Sales Navigator
 *     description: >
 *       Retourne une interface HTML interactive pour tester l'API LinkedIn Sales Navigator
 *     tags:
 *       - LinkedIn Sales Navigator
 *     responses:
 *       200:
 *         description: Interface HTML interactive
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Sales Navigator API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #333;
            font-size: 1.8rem;
            margin-bottom: 20px;
            border-bottom: 3px solid #0077b5;
            padding-bottom: 10px;
        }
        
        .endpoint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .endpoint-card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .endpoint-card:hover {
            border-color: #0077b5;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .method {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .method.get { background: #28a745; color: white; }
        .method.post { background: #007bff; color: white; }
        
        .endpoint-path {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            margin: 10px 0;
            font-size: 0.9rem;
        }
        
        .description {
            color: #666;
            line-height: 1.5;
        }
        
        .demo-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 30px;
            margin-top: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none;
            border-color: #0077b5;
        }
        
        .btn {
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-right: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,123,181,0.4);
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .result {
            margin-top: 20px;
            padding: 20px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .result.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .result.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .tabs {
            display: flex;
            border-bottom: 2px solid #e9ecef;
            margin-bottom: 20px;
        }
        
        .tab {
            padding: 12px 24px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            color: #666;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
        }
        
        .tab.active {
            color: #0077b5;
            border-bottom-color: #0077b5;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 LinkedIn Sales Navigator API</h1>
            <p>Générateur d'URLs de recherche avec filtres avancés</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📋 Endpoints disponibles</h2>
                <div class="endpoint-grid">
                    <div class="endpoint-card">
                        <span class="method get">GET</span>
                        <div class="endpoint-path">/api/linkedin-sales/filter-types</div>
                        <div class="description">Obtenir la liste des types de filtres disponibles pour LinkedIn Sales Navigator</div>
                    </div>
                    
                    <div class="endpoint-card">
                        <span class="method post">POST</span>
                        <div class="endpoint-path">/api/linkedin-sales/generate-url</div>
                        <div class="description">Générer une URL de recherche LinkedIn Sales Navigator avec filtres avancés</div>
                    </div>
                    
                    <div class="endpoint-card">
                        <span class="method post">POST</span>
                        <div class="endpoint-path">/api/linkedin-sales/parse-url</div>
                        <div class="description">Parser une URL LinkedIn Sales Navigator pour extraire les paramètres</div>
                    </div>
                    
                    <div class="endpoint-card">
                        <span class="method post">POST</span>
                        <div class="endpoint-path">/api/linkedin-sales/validate-filters</div>
                        <div class="description">Valider la structure et la cohérence des filtres</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🧪 Tester l'API</h2>
                <div class="tabs">
                    <button class="tab active" data-tab="generate">Générer URL</button>
                    <button class="tab" data-tab="parse">Parser URL</button>
                    <button class="tab" data-tab="validate">Valider Filtres</button>
                    <button class="tab" data-tab="filters">Types de Filtres</button>
                </div>
                
                <!-- Tab: Générer URL -->
                <div id="generate" class="tab-content active">
                    <div class="demo-section">
                        <div class="form-group">
                            <label>Type de recherche</label>
                            <select id="searchType">
                                <option value="people">Prospects (People)</option>
                                <option value="company">Entreprises (Company)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Mots-clés</label>
                            <input type="text" id="keywords" placeholder="Ex: développeur, startup, tech...">
                        </div>
                        
                        <button class="btn" id="generateBtn">🚀 Générer l'URL</button>
                        <button class="btn btn-secondary" id="copyBtn">📋 Copier l'URL</button>
                        
                        <div id="generateResult" class="result" style="display: none;"></div>
                    </div>
                </div>
                
                <!-- Tab: Parser URL -->
                <div id="parse" class="tab-content">
                    <div class="demo-section">
                        <div class="form-group">
                            <label>URL LinkedIn Sales Navigator</label>
                            <textarea id="urlToParse" rows="4" placeholder="Collez ici une URL LinkedIn Sales Navigator..."></textarea>
                        </div>
                        
                        <button class="btn" id="parseBtn">🔍 Parser l'URL</button>
                        
                        <div id="parseResult" class="result" style="display: none;"></div>
                    </div>
                </div>
                
                <!-- Tab: Valider Filtres -->
                <div id="validate" class="tab-content">
                    <div class="demo-section">
                        <div class="form-group">
                            <label>Type de recherche</label>
                            <select id="validateSearchType">
                                <option value="people">Prospects (People)</option>
                                <option value="company">Entreprises (Company)</option>
                            </select>
                        </div>
                        
                        <button class="btn" id="validateBtn">[VALIDER] Valider les filtres</button>
                        
                        <div id="validateResult" class="result" style="display: none;"></div>
                    </div>
                </div>
                
                <!-- Tab: Types de Filtres -->
                <div id="filters" class="tab-content">
                    <div class="demo-section">
                        <div class="form-group">
                            <label>Type de recherche</label>
                            <select id="filterTypeSelect">
                                <option value="people">Prospects (People)</option>
                                <option value="company">Entreprises (Company)</option>
                            </select>
                        </div>
                        
                        <button class="btn" id="loadFiltersBtn">📋 Charger les types de filtres</button>
                        
                        <div id="filterTypesResult" class="result" style="display: none;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // API Functions
        const LinkedInSalesAPI = {
            // Générer une URL
            async generateUrl(searchType, keywords) {
                const data = { searchType, keywords };
                
                try {
                    const response = await fetch('/api/linkedin-sales/generate-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    return await response.json();
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // Parser une URL
            async parseUrl(url) {
                const data = { url };
                
                try {
                    const response = await fetch('/api/linkedin-sales/parse-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    return await response.json();
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // Valider des filtres
            async validateFilters(searchType, filters) {
                const data = { searchType, filters };
                
                try {
                    const response = await fetch('/api/linkedin-sales/validate-filters', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    return await response.json();
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // Charger les types de filtres
            async getFilterTypes() {
                try {
                    const response = await fetch('/api/linkedin-sales/filter-types');
                    return await response.json();
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
        };

        // UI Functions
        const UI = {
            // Afficher un résultat
            showResult(elementId, result, isSuccess = true) {
                const resultDiv = document.getElementById(elementId);
                resultDiv.className = isSuccess ? 'result success' : 'result error';
                resultDiv.innerHTML = result;
                resultDiv.style.display = 'block';
            },

            // Changer d'onglet
            showTab(tabName) {
                // Masquer tous les contenus d'onglets
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Désactiver tous les onglets
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Afficher l'onglet sélectionné
                document.getElementById(tabName).classList.add('active');
                document.querySelector('[data-tab="' + tabName + '"]').classList.add('active');
            },

            // Copier dans le presse-papiers
            async copyToClipboard(text) {
                try {
                    await navigator.clipboard.writeText(text);
                    alert('URL copiée dans le presse-papiers !');
                } catch (error) {
                    console.error('Erreur lors de la copie:', error);
                }
            }
        };

        // Event Handlers
        const EventHandlers = {
            // Générer URL
            async handleGenerateUrl() {
                const searchType = document.getElementById('searchType').value;
                const keywords = document.getElementById('keywords').value;
                
                if (!searchType) {
                    UI.showResult('generateResult', '[ERREUR] Veuillez sélectionner un type de recherche', false);
                    return;
                }
                
                const result = await LinkedInSalesAPI.generateUrl(searchType, keywords);
                
                if (result.success) {
                    const resultText = '[SUCCES] URL générée avec succès !\n\n[URL] URL:\n' + result.url + '\n\n[DETAILS] Détails:\n' + JSON.stringify(result, null, 2);
                    UI.showResult('generateResult', resultText, true);
                } else {
                    UI.showResult('generateResult', '[ERREUR] Erreur: ' + result.error, false);
                }
            },

            // Parser URL
            async handleParseUrl() {
                const url = document.getElementById('urlToParse').value;
                
                if (!url) {
                    UI.showResult('parseResult', '[ERREUR] Veuillez entrer une URL à parser', false);
                    return;
                }
                
                const result = await LinkedInSalesAPI.parseUrl(url);
                
                if (result.success) {
                    const resultText = '[SUCCES] URL parsée avec succès !\n\n[DETAILS] Résultat:\n' + JSON.stringify(result, null, 2);
                    UI.showResult('parseResult', resultText, true);
                } else {
                    UI.showResult('parseResult', '[ERREUR] Erreur: ' + result.error, false);
                }
            },

            // Valider filtres
            async handleValidateFilters() {
                const searchType = document.getElementById('validateSearchType').value;
                const filters = []; // Version simplifiée sans filtres complexes
                
                const result = await LinkedInSalesAPI.validateFilters(searchType, filters);
                
                if (result.success) {
                    if (result.valid) {
                        const resultText = '[SUCCES] Filtres valides !\n\n[DETAILS] Détails:\n' + JSON.stringify(result, null, 2);
                        UI.showResult('validateResult', resultText, true);
                    } else {
                        const resultText = '[ERREUR] Filtres invalides !\n\n[DETAILS] Erreurs:\n' + JSON.stringify(result.errors, null, 2) + '\n\n[AVERTISSEMENT] Avertissements:\n' + JSON.stringify(result.warnings, null, 2);
                        UI.showResult('validateResult', resultText, false);
                    }
                } else {
                    UI.showResult('validateResult', '[ERREUR] Erreur: ' + result.error, false);
                }
            },

            // Charger types de filtres
            async handleLoadFilterTypes() {
                const searchType = document.getElementById('filterTypeSelect').value;
                
                const result = await LinkedInSalesAPI.getFilterTypes();
                
                if (result.success) {
                    const filterTypes = result[searchType] || [];
                    const resultText = '[SUCCES] Types de filtres pour ' + (searchType === 'people' ? 'prospects' : 'entreprises') + ' !\n\n[DETAILS] Filtres disponibles:\n' + JSON.stringify(filterTypes, null, 2);
                    UI.showResult('filterTypesResult', resultText, true);
                } else {
                    UI.showResult('filterTypesResult', '[ERREUR] Erreur: ' + result.error, false);
                }
            },

            // Copier URL
            handleCopyUrl() {
                const resultDiv = document.getElementById('generateResult');
                if (resultDiv.style.display !== 'none') {
                    const urlMatch = resultDiv.textContent.match(/\[URL\] URL:\n([^\n]+)/);
                    if (urlMatch) {
                        UI.copyToClipboard(urlMatch[1]);
                    }
                }
            }
        };

        // Initialize Event Listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Tab switching
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');
                    UI.showTab(tabName);
                });
            });

            // Button event listeners
            document.getElementById('generateBtn').addEventListener('click', EventHandlers.handleGenerateUrl);
            document.getElementById('parseBtn').addEventListener('click', EventHandlers.handleParseUrl);
            document.getElementById('validateBtn').addEventListener('click', EventHandlers.handleValidateFilters);
            document.getElementById('loadFiltersBtn').addEventListener('click', EventHandlers.handleLoadFilterTypes);
            document.getElementById('copyBtn').addEventListener('click', EventHandlers.handleCopyUrl);

            // Load filter types on page load
            EventHandlers.handleLoadFilterTypes();
        });
    </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     LinkedInSearchFilters:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [CURRENT_COMPANY, PAST_COMPANY, COMPANY_HEADCOUNT, FUNCTION, CURRENT_TITLE, SENIORITY_LEVEL, REGION, POSTAL_CODE, INDUSTRY, ANNUAL_REVENUE, COMPANY_HEADCOUNT_GROWTH]
 *           description: Type de filtre LinkedIn Sales Navigator
 *         values:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID unique du filtre (ex: URN LinkedIn pour les entreprises)
 *               text:
 *                 type: string
 *                 description: Texte affiché du filtre
 *               selectionType:
 *                 type: string
 *                 enum: [INCLUDED, EXCLUDED]
 *                 default: INCLUDED
 *     LinkedInSearchRequest:
 *       type: object
 *       required:
 *         - searchType
 *       properties:
 *         searchType:
 *           type: string
 *           enum: [people, company]
 *           description: Type de recherche - people pour les prospects, company pour les entreprises
 *         keywords:
 *           type: string
 *           description: Mots-clés de recherche génériques
 *         filters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LinkedInSearchFilters'
 *           description: Liste des filtres à appliquer
 *         sessionId:
 *           type: string
 *           description: ID de session LinkedIn (optionnel)
 *         viewAllFilters:
 *           type: boolean
 *           default: false
 *           description: Afficher tous les filtres disponibles
 *     LinkedInSearchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         url:
 *           type: string
 *           description: URL complète de recherche LinkedIn Sales Navigator
 *         searchType:
 *           type: string
 *           enum: [people, company]
 *         filters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LinkedInSearchFilters'
 *         message:
 *           type: string
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /api/linkedin-sales/generate-url:
 *   post:
 *     summary: Générer une URL de recherche LinkedIn Sales Navigator
 *     description: >
 *       Génère une URL de recherche LinkedIn Sales Navigator avec filtres avancés.
 *       Supporte la recherche de prospects (people) et d'entreprises (company).
 *       Les filtres sont encodés dans le paramètre query de l'URL.
 *     tags:
 *       - LinkedIn Sales Navigator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkedInSearchRequest'
 *           examples:
 *             people_search:
 *               summary: Recherche de prospects avec filtres
 *               value:
 *                 searchType: "people"
 *                 keywords: "développeur"
 *                 filters:
 *                   - type: "CURRENT_COMPANY"
 *                     values:
 *                       - id: "urn:li:organization:825160"
 *                         text: "Hyundai Motor Company"
 *                         selectionType: "INCLUDED"
 *                   - type: "FUNCTION"
 *                     values:
 *                       - id: "software_engineer"
 *                         text: "Software Engineer"
 *                         selectionType: "INCLUDED"
 *                   - type: "REGION"
 *                     values:
 *                       - id: "fr:75"
 *                         text: "Île-de-France"
 *                         selectionType: "INCLUDED"
 *             company_search:
 *               summary: Recherche d'entreprises avec filtres
 *               value:
 *                 searchType: "company"
 *                 keywords: "tech"
 *                 filters:
 *                   - type: "COMPANY_HEADCOUNT"
 *                     values:
 *                       - id: "B"
 *                         text: "1-10"
 *                         selectionType: "INCLUDED"
 *                   - type: "INDUSTRY"
 *                     values:
 *                       - id: "4"
 *                         text: "Technology"
 *                         selectionType: "INCLUDED"
 *     responses:
 *       200:
 *         description: URL générée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LinkedInSearchResponse'
 *             examples:
 *               people_url:
 *                 summary: URL de recherche de prospects
 *                 value:
 *                   success: true
 *                   url: "https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:\"Hyundai Motor Company\",selectionType:INCLUDED)))))&keywords=développeur"
 *                   searchType: "people"
 *                   filters:
 *                     - type: "CURRENT_COMPANY"
 *                       values:
 *                         - id: "urn:li:organization:825160"
 *                           text: "Hyundai Motor Company"
 *                           selectionType: "INCLUDED"
 *               company_url:
 *                 summary: URL de recherche d'entreprises
 *                 value:
 *                   success: true
 *                   url: "https://www.linkedin.com/sales/search/company?query=(spellCorrectionEnabled:true,filters:List((type:COMPANY_HEADCOUNT,values:List((id:B,text:1-10,selectionType:INCLUDED)))))&keywords=tech"
 *                   searchType: "company"
 *                   filters:
 *                     - type: "COMPANY_HEADCOUNT"
 *                       values:
 *                         - id: "B"
 *                           text: "1-10"
 *                           selectionType: "INCLUDED"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Type de recherche invalide. Utilisez 'people' ou 'company'"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la génération de l'URL"
 */
router.post('/generate-url', (req, res) => {
  try {
    const { searchType, keywords, filters = [], sessionId, viewAllFilters = false } = req.body;

    // Validation du type de recherche
    if (!searchType || !['people', 'company'].includes(searchType)) {
      return res.status(400).json({
        success: false,
        error: "Type de recherche invalide. Utilisez 'people' ou 'company'"
      });
    }

    // Construction de l'URL de base
    const baseUrl = `https://www.linkedin.com/sales/search/${searchType}`;
    
    // Construction du paramètre query au format LinkedIn
    let queryString = '(spellCorrectionEnabled:true';
    
    // Ajout des filtres si présents
    if (filters && filters.length > 0) {
      queryString += ',filters:List((';
      
      const filtersList = filters.map(filter => {
        const valuesList = filter.values.map(value => 
          `(id:${value.id},text:"${value.text}",selectionType:${value.selectionType || 'INCLUDED'})`
        ).join(',');
        
        return `type:${filter.type},values:List((${valuesList}))`;
      }).join(',');
      
      queryString += filtersList + '))';
    }

    // Ajout des mots-clés si présents
    if (keywords) {
      queryString += `,keywords:${keywords}`;
    }
    
    queryString += ')';
    
    // Encodage du paramètre query
    const encodedQuery = encodeURIComponent(queryString);
    
    // Construction de l'URL finale
    let finalUrl = `${baseUrl}?query=${encodedQuery}`;
    
    // Ajout des paramètres optionnels
    if (sessionId) {
      finalUrl += `&sessionId=${encodeURIComponent(sessionId)}`;
    }
    
    if (viewAllFilters) {
      finalUrl += '&viewAllFilters=true';
    }

    res.json({
      success: true,
      url: finalUrl,
      searchType,
      filters,
      message: `URL de recherche LinkedIn Sales Navigator générée pour ${searchType === 'people' ? 'les prospects' : 'les entreprises'}`
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL LinkedIn:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la génération de l'URL"
    });
  }
});

/**
 * @swagger
 * /api/linkedin-sales/parse-url:
 *   post:
 *     summary: Parser une URL de recherche LinkedIn Sales Navigator
 *     description: >
 *       Parse une URL de recherche LinkedIn Sales Navigator pour extraire les paramètres et filtres.
 *       Utile pour analyser des URLs existantes et comprendre leur structure.
 *     tags:
 *       - LinkedIn Sales Navigator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL LinkedIn Sales Navigator à parser
 *                 example: "https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:\"Hyundai Motor Company\",selectionType:INCLUDED)))))&keywords=développeur"
 *     responses:
 *       200:
 *         description: URL parsée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 searchType:
 *                   type: string
 *                   enum: [people, company]
 *                 keywords:
 *                   type: string
 *                 filters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LinkedInSearchFilters'
 *                 sessionId:
 *                   type: string
 *                 viewAllFilters:
 *                   type: boolean
 *                 originalUrl:
 *                   type: string
 *       400:
 *         description: URL invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "URL LinkedIn Sales Navigator invalide"
 *       500:
 *         description: Erreur serveur
 */
router.post('/parse-url', (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes('linkedin.com/sales/search/')) {
      return res.status(400).json({
        success: false,
        error: "URL LinkedIn Sales Navigator invalide"
      });
    }

    // Extraction du type de recherche
    const searchTypeMatch = url.match(/\/sales\/search\/(people|company)/);
    const searchType = searchTypeMatch ? searchTypeMatch[1] : null;

    // Extraction des paramètres de l'URL
    const urlObj = new URL(url);
    const queryParam = urlObj.searchParams.get('query');
    const sessionId = urlObj.searchParams.get('sessionId');
    const viewAllFilters = urlObj.searchParams.has('viewAllFilters');

    let parsedData = {
      searchType,
      sessionId,
      viewAllFilters
    };

    // Parsing du paramètre query
    if (queryParam) {
      try {
        // Le format LinkedIn n'est pas du JSON standard, c'est un format spécifique
        // Exemple: (spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:"Hyundai Motor Company",selectionType:INCLUDED)))))
        
        const decodedQuery = decodeURIComponent(queryParam);
        
        // Extraire les mots-clés
        const keywordsMatch = decodedQuery.match(/keywords:([^,)]+)/);
        if (keywordsMatch) {
          parsedData.keywords = keywordsMatch[1].replace(/"/g, '');
        }
        
        // Extraire les filtres
        const filtersMatch = decodedQuery.match(/filters:List\(\((.*?)\)\)/);
        if (filtersMatch) {
          const filtersString = filtersMatch[1];
          const filters = [];
          
          // Parser les filtres individuels
          const filterRegex = /type:([^,]+),values:List\(\((.*?)\)\)/g;
          let filterMatch;
          
          while ((filterMatch = filterRegex.exec(filtersString)) !== null) {
            const filterType = filterMatch[1];
            const valuesString = filterMatch[2];
            
            const filter = {
              type: filterType,
              values: []
            };
            
            // Parser les valeurs du filtre
            const valueRegex = /id:([^,]+),text:"([^"]+)",selectionType:([^)]+)/g;
            let valueMatch;
            
            while ((valueMatch = valueRegex.exec(valuesString)) !== null) {
              filter.values.push({
                id: valueMatch[1],
                text: valueMatch[2],
                selectionType: valueMatch[3]
              });
            }
            
            filters.push(filter);
          }
          
          parsedData.filters = filters;
        }
        
      } catch (parseError) {
        console.warn('Erreur lors du parsing du paramètre query:', parseError);
        // En cas d'erreur, on essaie une approche plus simple
        const decodedQuery = decodeURIComponent(queryParam);
        
        // Extraire les mots-clés de manière basique
        const keywordsMatch = decodedQuery.match(/keywords:([^,)]+)/);
        if (keywordsMatch) {
          parsedData.keywords = keywordsMatch[1].replace(/"/g, '');
        }
      }
    }

    res.json({
      success: true,
      ...parsedData,
      originalUrl: url
    });

  } catch (error) {
    console.error('Erreur lors du parsing de l\'URL LinkedIn:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors du parsing de l'URL"
    });
  }
});

/**
 * @swagger
 * /api/linkedin-sales/filter-types:
 *   get:
 *     summary: Obtenir les types de filtres disponibles
 *     description: >
 *       Retourne la liste des types de filtres disponibles pour LinkedIn Sales Navigator,
 *       organisés par type de recherche (people/company).
 *     tags:
 *       - LinkedIn Sales Navigator
 *     responses:
 *       200:
 *         description: Types de filtres récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                 company:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 */
router.get('/filter-types', (req, res) => {
  const filterTypes = {
    people: [
      { type: 'CURRENT_COMPANY', name: 'Entreprise actuelle', description: 'Filtrer par entreprise actuelle' },
      { type: 'PAST_COMPANY', name: 'Ancienne entreprise', description: 'Filtrer par ancienne entreprise' },
      { type: 'COMPANY_HEADCOUNT', name: 'Taille de l\'entreprise', description: 'Filtrer par nombre d\'employés' },
      { type: 'FUNCTION', name: 'Fonction', description: 'Filtrer par fonction/role' },
      { type: 'CURRENT_TITLE', name: 'Titre actuel', description: 'Filtrer par titre actuel' },
      { type: 'SENIORITY_LEVEL', name: 'Niveau de séniorité', description: 'Filtrer par niveau de séniorité' },
      { type: 'REGION', name: 'Région', description: 'Filtrer par région géographique' },
      { type: 'POSTAL_CODE', name: 'Code postal', description: 'Filtrer par code postal' },
      { type: 'INDUSTRY', name: 'Secteur d\'activité', description: 'Filtrer par secteur d\'activité' }
    ],
    company: [
      { type: 'ANNUAL_REVENUE', name: 'Chiffre d\'affaires', description: 'Filtrer par chiffre d\'affaires annuel' },
      { type: 'COMPANY_HEADCOUNT', name: 'Taille de l\'entreprise', description: 'Filtrer par nombre d\'employés' },
      { type: 'COMPANY_HEADCOUNT_GROWTH', name: 'Croissance', description: 'Filtrer par croissance de l\'entreprise' },
      { type: 'INDUSTRY', name: 'Secteur d\'activité', description: 'Filtrer par secteur d\'activité' },
      { type: 'REGION', name: 'Région', description: 'Filtrer par région géographique' },
      { type: 'POSTAL_CODE', name: 'Code postal', description: 'Filtrer par code postal' }
    ]
  };

  res.json({
    success: true,
    ...filterTypes
  });
});

/**
 * @swagger
 * /api/linkedin-sales/validate-filters:
 *   post:
 *     summary: Valider des filtres LinkedIn Sales Navigator
 *     description: >
 *       Valide la structure et la cohérence des filtres pour LinkedIn Sales Navigator.
 *       Vérifie que les types de filtres correspondent au type de recherche.
 *     tags:
 *       - LinkedIn Sales Navigator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - searchType
 *               - filters
 *             properties:
 *               searchType:
 *                 type: string
 *                 enum: [people, company]
 *               filters:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/LinkedInSearchFilters'
 *     responses:
 *       200:
 *         description: Validation terminée
 *         content:
 *           application/json:
 *             schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *               valid:
 *                 type: boolean
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filter:
 *                       type: string
 *                     message:
 *                       type: string
 *               warnings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filter:
 *                       type: string
 *                     message:
 *                       type: string
 */
router.post('/validate-filters', (req, res) => {
  try {
    const { searchType, filters } = req.body;

    if (!searchType || !['people', 'company'].includes(searchType)) {
      return res.status(400).json({
        success: false,
        error: "Type de recherche invalide"
      });
    }

    if (!filters || !Array.isArray(filters)) {
      return res.status(400).json({
        success: false,
        error: "Filtres invalides"
      });
    }

    const validFilters = {
      people: ['CURRENT_COMPANY', 'PAST_COMPANY', 'COMPANY_HEADCOUNT', 'FUNCTION', 'CURRENT_TITLE', 'SENIORITY_LEVEL', 'REGION', 'POSTAL_CODE', 'INDUSTRY'],
      company: ['ANNUAL_REVENUE', 'COMPANY_HEADCOUNT', 'COMPANY_HEADCOUNT_GROWTH', 'INDUSTRY', 'REGION', 'POSTAL_CODE']
    };

    const errors = [];
    const warnings = [];

    filters.forEach((filter, index) => {
      // Vérification du type de filtre
      if (!filter.type) {
        errors.push({
          filter: `filter[${index}]`,
          message: "Type de filtre manquant"
        });
        return;
      }

      if (!validFilters[searchType].includes(filter.type)) {
        errors.push({
          filter: filter.type,
          message: `Type de filtre '${filter.type}' non valide pour la recherche de type '${searchType}'`
        });
      }

      // Vérification des valeurs
      if (!filter.values || !Array.isArray(filter.values) || filter.values.length === 0) {
        errors.push({
          filter: filter.type,
          message: "Le filtre doit contenir au moins une valeur"
        });
        return;
      }

      filter.values.forEach((value, valueIndex) => {
        if (!value.id || !value.text) {
          errors.push({
            filter: `${filter.type}[${valueIndex}]`,
            message: "Chaque valeur doit avoir un id et un text"
          });
        }

        if (value.selectionType && !['INCLUDED', 'EXCLUDED'].includes(value.selectionType)) {
          warnings.push({
            filter: `${filter.type}[${valueIndex}]`,
            message: "selectionType doit être 'INCLUDED' ou 'EXCLUDED'"
          });
        }
      });
    });

    res.json({
      success: true,
      valid: errors.length === 0,
      errors,
      warnings
    });

  } catch (error) {
    console.error('Erreur lors de la validation des filtres:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la validation des filtres"
    });
  }
});

/**
 * @swagger
 * /api/linkedin-sales/extract-session:
 *   post:
 *     summary: Extraire le SessionId d'une URL LinkedIn Sales Navigator
 *     description: >
 *       Extrait le sessionId d'une URL LinkedIn Sales Navigator existante.
 *       Utile pour récupérer le sessionId d'une session active.
 *     tags:
 *       - LinkedIn Sales Navigator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL LinkedIn Sales Navigator complète
 *                 example: "https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled:true,filters:List((type:CURRENT_COMPANY,values:List((id:urn:li:organization:825160,text:\"Hyundai Motor Company\",selectionType:INCLUDED)))))&sessionId=oyT4SvXfQXWQEbOH54crEQ%3D%3D"
 *     responses:
 *       200:
 *         description: SessionId extrait avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionId:
 *                   type: string
 *                   description: SessionId extrait de l'URL
 *                 decodedSessionId:
 *                   type: string
 *                   description: SessionId décodé
 *                 message:
 *                   type: string
 *       400:
 *         description: URL invalide ou sessionId non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/extract-session', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL requise"
      });
    }

    // Vérifier que c'est une URL LinkedIn Sales Navigator
    if (!url.includes('linkedin.com/sales/search/')) {
      return res.status(400).json({
        success: false,
        error: "URL LinkedIn Sales Navigator invalide"
      });
    }

    // Extraire le sessionId avec regex
    const sessionIdMatch = url.match(/[?&]sessionId=([^&]+)/);
    
    if (!sessionIdMatch) {
      return res.status(400).json({
        success: false,
        error: "SessionId non trouvé dans l'URL"
      });
    }

    const encodedSessionId = sessionIdMatch[1];
    const decodedSessionId = decodeURIComponent(encodedSessionId);

    res.json({
      success: true,
      sessionId: encodedSessionId,
      decodedSessionId: decodedSessionId,
      message: "SessionId extrait avec succès"
    });

  } catch (error) {
    console.error('Erreur lors de l\'extraction du sessionId:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'extraction du sessionId"
    });
  }
});

/**
 * @swagger
 * /api/linkedin-sales/generate-url-with-session:
 *   post:
 *     summary: Générer une URL LinkedIn Sales Navigator avec SessionId
 *     description: >
 *       Génère une URL LinkedIn Sales Navigator avec un sessionId spécifique.
 *       Permet de créer des URLs qui utilisent une session existante.
 *     tags:
 *       - LinkedIn Sales Navigator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - searchType
 *               - sessionId
 *             properties:
 *               searchType:
 *                 type: string
 *                 enum: [people, company]
 *               keywords:
 *                 type: string
 *               filters:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/LinkedInSearchFilters'
 *               sessionId:
 *                 type: string
 *                 description: SessionId LinkedIn Sales Navigator
 *               viewAllFilters:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: URL générée avec sessionId
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/generate-url-with-session', (req, res) => {
  try {
    const { searchType, keywords, filters, sessionId, viewAllFilters } = req.body;

    // Validation du type de recherche
    if (!searchType || !['people', 'company'].includes(searchType)) {
      return res.status(400).json({
        success: false,
        error: "Type de recherche invalide. Utilisez 'people' ou 'company'"
      });
    }

    // Validation du sessionId
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "SessionId requis"
      });
    }

    // Construction de l'URL de base
    const baseUrl = `https://www.linkedin.com/sales/search/${searchType}`;
    
    // Construction du paramètre query au format LinkedIn
    let queryString = '(spellCorrectionEnabled:true';
    
    // Ajout des filtres si présents
    if (filters && filters.length > 0) {
      queryString += ',filters:List((';
      
      const filtersList = filters.map(filter => {
        const valuesList = filter.values.map(value => 
          `(id:${value.id},text:"${value.text}",selectionType:${value.selectionType || 'INCLUDED'})`
        ).join(',');
        
        return `type:${filter.type},values:List((${valuesList}))`;
      }).join(',');
      
      queryString += filtersList + '))';
    }

    // Ajout des mots-clés si présents
    if (keywords) {
      queryString += `,keywords:${keywords}`;
    }
    
    queryString += ')';
    
    // Encodage du paramètre query
    const encodedQuery = encodeURIComponent(queryString);
    
    // Construction de l'URL finale avec sessionId
    let finalUrl = `${baseUrl}?query=${encodedQuery}&sessionId=${encodeURIComponent(sessionId)}`;
    
    // Ajout des paramètres optionnels
    if (viewAllFilters) {
      finalUrl += '&viewAllFilters=true';
    }

    res.json({
      success: true,
      url: finalUrl,
      searchType,
      sessionId: sessionId,
      filters,
      message: `URL de recherche LinkedIn Sales Navigator générée avec sessionId pour ${searchType === 'people' ? 'les prospects' : 'les entreprises'}`
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL LinkedIn avec sessionId:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la génération de l'URL"
    });
  }
});

module.exports = router; 