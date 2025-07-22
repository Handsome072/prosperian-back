const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Recherche d'entreprises avancée (proxy API publique)
 *     description: >-
 *       Proxy vers https://recherche-entreprises.api.gouv.fr/search avec tous les paramètres supportés par l'API publique. Retourne la réponse brute de l'API publique.
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
 *         description: Résultat de la recherche d'entreprises
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
    const response = await axios.get('https://recherche-entreprises.api.gouv.fr/search', {
      params: req.query,
      headers: { 'accept': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router; 