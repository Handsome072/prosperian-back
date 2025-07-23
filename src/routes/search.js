const express = require('express');
const router = express.Router();
const axios = require('axios');

// Fonction utilitaire pour calculer l'âge d'une entreprise
const calculateCompanyAge = (dateCreation) => {
  if (!dateCreation) return null;
  const creationDate = new Date(dateCreation);
  const currentDate = new Date();
  return currentDate.getFullYear() - creationDate.getFullYear();
};

// Fonction pour enrichir les résultats avec l'âge des entreprises via l'API INSEE
const enrichWithCompanyAge = async (companies) => {
  const accessToken = process.env.INSEE_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn('INSEE_ACCESS_TOKEN non configuré, impossible de calculer l\'âge des entreprises');
    return companies;
  }

  const enrichedCompanies = await Promise.all(
    companies.map(async (company) => {
      try {
        // Utiliser le SIREN pour récupérer les informations via l'API INSEE
        if (company.siren) {
          const inseeResponse = await axios.get('https://api.insee.fr/entreprises/sirene/V3.11/siren', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            params: {
              q: `siren:${company.siren}`,
              nombre: 1
            },
            timeout: 2000 // Timeout pour éviter les blocages
          });

          if (inseeResponse.data?.unitesLegales?.[0]?.dateCreationUniteLegale) {
            const dateCreation = inseeResponse.data.unitesLegales[0].dateCreationUniteLegale;
            const age = calculateCompanyAge(dateCreation);
            return {
              ...company,
              date_creation: dateCreation,
              age_entreprise: age
            };
          }
        }
        return company;
      } catch (error) {
        // En cas d'erreur, on retourne l'entreprise sans enrichissement
        console.warn(`Erreur lors de l'enrichissement de l'entreprise ${company.nom_complet}:`, error.message);
        return company;
      }
    })
  );

  return enrichedCompanies;
};

// Fonction pour filtrer les entreprises par âge
const filterByAge = (companies, ageMin, ageMax) => {
  if (!ageMin && !ageMax) return companies;
  
  return companies.filter(company => {
    const age = company.age_entreprise;
    if (age === null || age === undefined) return true; // Garder les entreprises sans âge connu
    
    if (ageMin && age < ageMin) return false;
    if (ageMax && age > ageMax) return false;
    return true;
  });
};

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Recherche d'entreprises avancée avec filtres d'âge et chiffres clés
 *     description: >-
 *       Proxy vers https://recherche-entreprises.api.gouv.fr/search avec enrichissement des données d'âge d'entreprise via l'API INSEE SIRENE.
 *       Supporte tous les paramètres de l'API publique plus les filtres d'âge.
 *     tags:
 *       - Entreprise
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Recherche plein texte (ex: q=test)
 *       - in: query
 *         name: age_min
 *         schema:
 *           type: integer
 *         required: false
 *         example: 5
 *         description: Âge minimum de l'entreprise en années
 *       - in: query
 *         name: age_max
 *         schema:
 *           type: integer
 *         required: false
 *         example: 50
 *         description: Âge maximum de l'entreprise en années
 *       - in: query
 *         name: activite_principale
 *         schema:
 *           type: string
 *         required: false
 *         example: 01.12Z,28.15Z
 *         description: Le code NAF ou code APE, un code d'activité suivant la nomenclature de l'INSEE. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: categorie_entreprise
 *         schema:
 *           type: string
 *           enum: [PME, ETI, GE]
 *         required: false
 *         example: PME
 *         description: Catégorie d'entreprise de l'unité légale. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: code_collectivite_territoriale
 *         schema:
 *           type: string
 *         required: false
 *         example: 75C
 *         description: Code affilié à une collectivité territoriale.
 *       - in: query
 *         name: convention_collective_renseignee
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Entreprises ayant au moins un établissement dont la convention collective est renseignée.
 *       - in: query
 *         name: code_postal
 *         schema:
 *           type: string
 *         required: false
 *         example: 38540,38189
 *         description: Code postal en 5 chiffres. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: code_commune
 *         schema:
 *           type: string
 *         required: false
 *         example: 01247,01111
 *         description: Code commune (INSEE) en 5 caractères. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: departement
 *         schema:
 *           type: string
 *         required: false
 *         example: 02,89
 *         description: Code de département. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         required: false
 *         example: 11,76
 *         description: Code de région. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: epci
 *         schema:
 *           type: string
 *         required: false
 *         example: 200058519,248100737
 *         description: Liste des epci valides. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: egapro_renseignee
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant un index égapro renseigné
 *       - in: query
 *         name: est_achats_responsables
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant le label RFAR.
 *       - in: query
 *         name: est_alim_confiance
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant au moins un établissement avec un résultat de contrôle sanitaire Alim'Confiance.
 *       - in: query
 *         name: est_association
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant un identifiant d'association ou une nature juridique avec mention "association".
 *       - in: query
 *         name: est_bio
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant un établissement certifié par l'agence bio
 *       - in: query
 *         name: est_collectivite_territoriale
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les collectivités territoriales.
 *       - in: query
 *         name: est_entrepreneur_individuel
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises individuelles.
 *       - in: query
 *         name: est_entrepreneur_spectacle
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant une licence d'entrepreneur du spectacle.
 *       - in: query
 *         name: est_ess
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises appartenant au champ de l'économie sociale et solidaire.
 *       - in: query
 *         name: est_finess
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant un établissement du domaine du sanitaire et social (FINESS)
 *       - in: query
 *         name: est_organisme_formation
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant un établissement organisme de formation
 *       - in: query
 *         name: est_patrimoine_vivant
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant le label Entreprise du Patrimoine Vivant (EPV)
 *       - in: query
 *         name: est_qualiopi
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant une certification de la marque « Qualiopi »
 *       - in: query
 *         name: est_rge
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises reconnues garantes de l'Environnement (RGE).
 *       - in: query
 *         name: est_siae
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les structures d'insertion par l'activité économique (SIAE).
 *       - in: query
 *         name: est_service_public
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les structures reconnues comme administration.
 *       - in: query
 *         name: est_l100_3
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les administrations au sens de l'article L. 100-3 du code des relations entre le public et l'administration (CRPA)
 *       - in: query
 *         name: est_societe_mission
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les sociétés à mission.
 *       - in: query
 *         name: est_uai
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Uniquement les entreprises ayant un établissement UAI.
 *       - in: query
 *         name: etat_administratif
 *         schema:
 *           type: string
 *           enum: [A, C]
 *         required: false
 *         description: État administratif de l'unité légale. "A" pour Active, "C" pour Cessée.
 *       - in: query
 *         name: id_convention_collective
 *         schema:
 *           type: string
 *         required: false
 *         example: 1090
 *         description: Identifiant de Convention Collective d'un établissement d'une entreprise.
 *       - in: query
 *         name: id_finess
 *         schema:
 *           type: string
 *         required: false
 *         example: 010003853
 *         description: Identifiant FINESS d'un établissement d'une entreprise.
 *       - in: query
 *         name: id_rge
 *         schema:
 *           type: string
 *         required: false
 *         example: 8611M10D109
 *         description: Identifiant RGE d'un établissement d'une entreprise.
 *       - in: query
 *         name: id_uai
 *         schema:
 *           type: string
 *         required: false
 *         example: 0022004T
 *         description: Identifiant UAI d'un établissement d'une entreprise.
 *       - in: query
 *         name: nature_juridique
 *         schema:
 *           type: string
 *         required: false
 *         example: 7344,6544
 *         description: Catégorie juridique de l'unité légale. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: section_activite_principale
 *         schema:
 *           type: string
 *         required: false
 *         example: A,J,U
 *         description: Section de l'activité principale. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: tranche_effectif_salarie
 *         schema:
 *           type: string
 *         required: false
 *         example: NN,00,01
 *         description: Tranche d'effectif salarié de l'entreprise. Valeur unique ou liste séparée par des virgules.
 *       - in: query
 *         name: nom_personne
 *         schema:
 *           type: string
 *         required: false
 *         example: Dupont
 *         description: Nom d'une personne partie prenante de l'entreprise (dirigeant ou élu).
 *       - in: query
 *         name: prenoms_personne
 *         schema:
 *           type: string
 *         required: false
 *         example: Monsieur
 *         description: Prénom(s) d'une personne partie prenante de l'entreprise (dirigeant ou élu).
 *       - in: query
 *         name: date_naissance_personne_min
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         example: 1960-01-01
 *         description: Valeur minimale de la date de naissance d'une personne partie prenante de l'entreprise.
 *       - in: query
 *         name: date_naissance_personne_max
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         example: 1990-01-01
 *         description: Valeur maximale de la date de naissance d'une personne partie prenante de l'entreprise.
 *       - in: query
 *         name: type_personne
 *         schema:
 *           type: string
 *           enum: [dirigeant, elu]
 *         required: false
 *         description: Type de la partie prenante de l'entreprise, dirigeant ou élu.
 *       - in: query
 *         name: ca_min
 *         schema:
 *           type: integer
 *         required: false
 *         example: 100000
 *         description: Valeur minimale du chiffre d'affaire de l'entreprise
 *       - in: query
 *         name: ca_max
 *         schema:
 *           type: integer
 *         required: false
 *         example: 100000
 *         description: Valeur maximale du chiffre d'affaire de l'entreprise
 *       - in: query
 *         name: resultat_net_min
 *         schema:
 *           type: integer
 *         required: false
 *         example: 100000
 *         description: Valeur minimale du résultat net de l'entreprise
 *       - in: query
 *         name: resultat_net_max
 *         schema:
 *           type: integer
 *         required: false
 *         example: 100000
 *         description: Valeur maximale du résultat net de l'entreprise
 *       - in: query
 *         name: limite_matching_etablissements
 *         schema:
 *           type: integer
 *         required: false
 *         default: 10
 *         description: Nombre d'établissements connexes inclus dans la réponse (matching_etablissements). Valeur entre 1 et 100.
 *       - in: query
 *         name: minimal
 *         schema:
 *           type: boolean
 *         required: false
 *         example: true
 *         description: Permet de retourner une réponse minimale, qui exclut les champs secondaires.
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         required: false
 *         example: siege,complements
 *         description: ATTENTION : Ce paramètre ne peut être appelé qu'avec le champ "minimal=True". Permet de ne demander que certains des champs secondaires.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         default: 1
 *         description: Le numéro de la page à retourner.
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *         required: false
 *         default: 10
 *         description: Le nombre de résultats par page, limité à 25.
 *     responses:
 *       200:
 *         description: Résultat de la recherche d'entreprises avec enrichissement d'âge
 *         content:
 *           application/json:
 *             example:
 *               results: [ ... ]
 *               total_results: 10000
 *               page: 1
 *               per_page: 1
 *               total_pages: 10000
 */
router.get('/', async (req, res) => {
  try {
    // Extraire les paramètres d'âge personnalisés
    const { age_min, age_max, ...govApiParams } = req.query;

    console.log('🔍 Recherche d\'entreprises avec filtres:', {
      age_min,
      age_max,
      ca_min: govApiParams.ca_min,
      ca_max: govApiParams.ca_max
    });

    // Appel à l'API gouvernementale avec tous les paramètres sauf age_min/age_max
    const response = await axios.get('https://recherche-entreprises.api.gouv.fr/search', {
      params: govApiParams,
      headers: { 'accept': 'application/json' }
    });

    let results = response.data.results || [];

    // Si des filtres d'âge sont spécifiés, enrichir les données avec l'âge des entreprises
    if ((age_min || age_max) && results.length > 0) {
      console.log(`🏢 Enrichissement de ${results.length} entreprises avec leur âge...`);
      
      // Enrichir avec l'âge des entreprises
      results = await enrichWithCompanyAge(results);
      
      // Filtrer par âge
      const ageMinNum = age_min ? parseInt(age_min, 10) : null;
      const ageMaxNum = age_max ? parseInt(age_max, 10) : null;
      results = filterByAge(results, ageMinNum, ageMaxNum);
      
      console.log(`✅ ${results.length} entreprises après filtrage par âge`);
    }

    // Retourner les résultats enrichis
    res.json({
      ...response.data,
      results: results,
      enriched_with_age: !!(age_min || age_max),
      filters_applied: {
        age_min: age_min ? parseInt(age_min, 10) : null,
        age_max: age_max ? parseInt(age_max, 10) : null,
        ca_min: govApiParams.ca_min ? parseInt(govApiParams.ca_min, 10) : null,
        ca_max: govApiParams.ca_max ? parseInt(govApiParams.ca_max, 10) : null
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche d\'entreprises:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data,
        message: 'Erreur lors de l\'appel à l\'API de recherche d\'entreprises'
      });
    } else {
      res.status(500).json({ 
        error: error.message,
        message: 'Erreur interne du serveur'
      });
    }
  }
});

module.exports = router; 