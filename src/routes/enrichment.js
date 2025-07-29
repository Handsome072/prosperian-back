const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrichment:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unique de l'enrichment
 *         name:
 *           type: string
 *           description: Nom de l'enrichment
 *         status:
 *           type: string
 *           enum: [En cours, Terminé, Échec]
 *           default: En cours
 *           description: Statut de l'enrichment
 *         type:
 *           type: string
 *           description: Type d'enrichment
 *         date_created:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         description:
 *           type: string
 *           description: Description de l'enrichment
 *         created_by:
 *           type: string
 *           format: uuid
 *           description: ID de l'utilisateur créateur
 *     LeadEnrich:
 *       type: object
 *       required:
 *         - enrichment_id
 *         - firstname
 *         - lastname
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unique du lead enrichi
 *         enrichment_id:
 *           type: string
 *           format: uuid
 *           description: ID de l'enrichment parent
 *         firstname:
 *           type: string
 *           description: Prénom du lead
 *         lastname:
 *           type: string
 *           description: Nom du lead
 *         company_name:
 *           type: string
 *           description: Nom de l'entreprise
 *         domain:
 *           type: string
 *           description: Domaine de l'entreprise
 *         linkedin_url:
 *           type: string
 *           description: URL LinkedIn du lead
 *         date_creation:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

/**
 * @swagger
 * /api/enrichment:
 *   post:
 *     summary: Créer un nouvel enrichment
 *     tags: [Enrichment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'enrichment
 *               type:
 *                 type: string
 *                 description: Type d'enrichment
 *               description:
 *                 type: string
 *                 description: Description optionnelle
 *     responses:
 *       201:
 *         description: Enrichment créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 enrichment:
 *                   $ref: '#/components/schemas/Enrichment'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const userId = req.user.id;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Le nom et le type sont requis'
      });
    }

    const { data: enrichment, error } = await supabase
      .from('enrichments')
      .insert({
        name,
        type,
        description,
        created_by: userId,
        status: 'En cours'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création enrichment:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur base de données',
        message: 'Impossible de créer l\'enrichment'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Enrichment créé avec succès',
      enrichment
    });

  } catch (error) {
    console.error('❌ Erreur création enrichment:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création de l\'enrichment'
    });
  }
});

/**
 * @swagger
 * /api/enrichment:
 *   get:
 *     summary: Récupérer tous les enrichments de l'utilisateur
 *     tags: [Enrichment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des enrichments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 enrichments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Enrichment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('enrichments')
      .select('*', { count: 'exact' })
      .eq('created_by', userId)
      .order('date_created', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: enrichments, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur récupération enrichments:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur base de données',
        message: 'Impossible de récupérer les enrichments'
      });
    }

    res.json({
      success: true,
      enrichments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération enrichments:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des enrichments'
    });
  }
});

/**
 * @swagger
 * /api/enrichment/{id}:
 *   get:
 *     summary: Récupérer un enrichment par ID
 *     tags: [Enrichment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enrichment
 *     responses:
 *       200:
 *         description: Enrichment trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 enrichment:
 *                   $ref: '#/components/schemas/Enrichment'
 *       404:
 *         description: Enrichment non trouvé
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: enrichment, error } = await supabase
      .from('enrichments')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error || !enrichment) {
      return res.status(404).json({
        success: false,
        error: 'Non trouvé',
        message: 'Enrichment introuvable'
      });
    }

    res.json({
      success: true,
      enrichment
    });

  } catch (error) {
    console.error('❌ Erreur récupération enrichment:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération de l\'enrichment'
    });
  }
});

/**
 * @swagger
 * /api/enrichment/{id}:
 *   put:
 *     summary: Mettre à jour un enrichment
 *     tags: [Enrichment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enrichment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [En cours, Terminé, Échec]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Enrichment mis à jour
 *       404:
 *         description: Enrichment non trouvé
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, description } = req.body;
    const userId = req.user.id;

    const { data: enrichment, error } = await supabase
      .from('enrichments')
      .update({
        name,
        status,
        description
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error || !enrichment) {
      return res.status(404).json({
        success: false,
        error: 'Non trouvé',
        message: 'Enrichment introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Enrichment mis à jour avec succès',
      enrichment
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour enrichment:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour de l\'enrichment'
    });
  }
});

/**
 * @swagger
 * /api/enrichment/{id}:
 *   delete:
 *     summary: Supprimer un enrichment
 *     tags: [Enrichment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enrichment
 *     responses:
 *       200:
 *         description: Enrichment supprimé
 *       404:
 *         description: Enrichment non trouvé
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('enrichments')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Non trouvé',
        message: 'Enrichment introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Enrichment supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur suppression enrichment:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la suppression de l\'enrichment'
    });
  }
});

/**
 * @swagger
 * /api/enrichment/{enrichmentId}/leads:
 *   post:
 *     summary: Ajouter un lead enrichi à un enrichment
 *     tags: [LeadEnrich]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrichmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enrichment parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: Prénom du lead
 *               lastname:
 *                 type: string
 *                 description: Nom du lead
 *               company_name:
 *                 type: string
 *                 description: Nom de l'entreprise
 *               domain:
 *                 type: string
 *                 description: Domaine de l'entreprise
 *               linkedin_url:
 *                 type: string
 *                 description: URL LinkedIn
 *     responses:
 *       201:
 *         description: Lead enrichi créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 leadEnrich:
 *                   $ref: '#/components/schemas/LeadEnrich'
 *       404:
 *         description: Enrichment non trouvé
 */
router.post('/:enrichmentId/leads', authenticateToken, async (req, res) => {
  try {
    const { enrichmentId } = req.params;
    const { firstname, lastname, company_name, domain, linkedin_url } = req.body;
    const userId = req.user.id;

    if (!firstname || !lastname) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'Le prénom et le nom sont requis'
      });
    }

    // Vérifier que l'enrichment existe et appartient à l'utilisateur
    const { data: enrichment, error: enrichmentError } = await supabase
      .from('enrichments')
      .select('id')
      .eq('id', enrichmentId)
      .eq('created_by', userId)
      .single();

    if (enrichmentError || !enrichment) {
      return res.status(404).json({
        success: false,
        error: 'Non trouvé',
        message: 'Enrichment introuvable'
      });
    }

    const { data: leadEnrich, error } = await supabase
      .from('lead_enrich')
      .insert({
        enrichment_id: enrichmentId,
        firstname,
        lastname,
        company_name,
        domain,
        linkedin_url
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création lead enrichi:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur base de données',
        message: 'Impossible de créer le lead enrichi'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Lead enrichi créé avec succès',
      leadEnrich
    });

  } catch (error) {
    console.error('❌ Erreur création lead enrichi:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création du lead enrichi'
    });
  }
});

/**
 * @swagger
 * /api/enrichment/{enrichmentId}/leads:
 *   get:
 *     summary: Récupérer tous les leads enrichis d'un enrichment
 *     tags: [LeadEnrich]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrichmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enrichment parent
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des leads enrichis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 leads:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeadEnrich'
 *                 pagination:
 *                   type: object
 *       404:
 *         description: Enrichment non trouvé
 */
router.get('/:enrichmentId/leads', authenticateToken, async (req, res) => {
  try {
    const { enrichmentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    // Vérifier que l'enrichment existe et appartient à l'utilisateur
    const { data: enrichment, error: enrichmentError } = await supabase
      .from('enrichments')
      .select('id')
      .eq('id', enrichmentId)
      .eq('created_by', userId)
      .single();

    if (enrichmentError || !enrichment) {
      return res.status(404).json({
        success: false,
        error: 'Non trouvé',
        message: 'Enrichment introuvable'
      });
    }

    const { data: leads, error, count } = await supabase
      .from('lead_enrich')
      .select('*', { count: 'exact' })
      .eq('enrichment_id', enrichmentId)
      .order('date_creation', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur récupération leads enrichis:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur base de données',
        message: 'Impossible de récupérer les leads enrichis'
      });
    }

    res.json({
      success: true,
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération leads enrichis:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des leads enrichis'
    });
  }
});

/**
 * @swagger
 * /api/enrichment/{enrichmentId}/leads/bulk:
 *   post:
 *     summary: Ajouter plusieurs leads enrichis en lot
 *     tags: [LeadEnrich]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrichmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enrichment parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leads
 *             properties:
 *               leads:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - firstname
 *                     - lastname
 *                   properties:
 *                     firstname:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     company_name:
 *                       type: string
 *                     domain:
 *                       type: string
 *                     linkedin_url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Leads enrichis créés en lot
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Enrichment non trouvé
 */
router.post('/:enrichmentId/leads/bulk', authenticateToken, async (req, res) => {
  try {
    const { enrichmentId } = req.params;
    const { leads } = req.body;
    const userId = req.user.id;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        message: 'La liste des leads est requise'
      });
    }

    // Vérifier que l'enrichment existe et appartient à l'utilisateur
    const { data: enrichment, error: enrichmentError } = await supabase
      .from('enrichments')
      .select('id')
      .eq('id', enrichmentId)
      .eq('created_by', userId)
      .single();

    if (enrichmentError || !enrichment) {
      return res.status(404).json({
        success: false,
        error: 'Non trouvé',
        message: 'Enrichment introuvable'
      });
    }

    // Préparer les données pour l'insertion en lot
    const leadsData = leads.map(lead => ({
      enrichment_id: enrichmentId,
      firstname: lead.firstname,
      lastname: lead.lastname,
      company_name: lead.company_name,
      domain: lead.domain,
      linkedin_url: lead.linkedin_url
    }));

    const { data: createdLeads, error } = await supabase
      .from('lead_enrich')
      .insert(leadsData)
      .select();

    if (error) {
      console.error('❌ Erreur création leads enrichis en lot:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur base de données',
        message: 'Impossible de créer les leads enrichis'
      });
    }

    res.status(201).json({
      success: true,
      message: `${createdLeads.length} leads enrichis créés avec succès`,
      leads: createdLeads
    });

  } catch (error) {
    console.error('❌ Erreur création leads enrichis en lot:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la création des leads enrichis'
    });
  }
});

module.exports = router; 