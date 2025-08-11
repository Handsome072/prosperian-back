const express = require("express");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 9000;

// Middleware
app.use(express.json());

// Fonction pour exécuter le script de déploiement
function deployBackend() {
    return new Promise((resolve, reject) => {
        const deployScript = path.join(__dirname, "..", "deploy.sh");
        exec(`chmod +x ${deployScript} && ${deployScript}`, (err, stdout, stderr) => {
            if (err) {
                console.error("❌ Erreur lors du déploiement:", err);
                console.error("stderr:", stderr);
                reject(err);
            } else {
                console.log("✅ Déploiement réussi:");
                console.log(stdout);
                resolve(stdout);
            }
        });
    });
}

// Route de santé
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Webhook backend server is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// Webhook pour le déploiement du backend
app.post("/webhook-backend", async (req, res) => {
    try {
        console.log("🔔 Webhook reçu pour le déploiement backend");
        console.log("Timestamp:", new Date().toISOString());
        
        // Log des headers importants (sans exposer de secrets)
        const safeHeaders = {
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
            'x-github-event': req.headers['x-github-event']
        };
        console.log("Headers:", safeHeaders);

        // Vérifier que c'est un push sur la branche main
        if (req.body.ref && req.body.ref === "refs/heads/main") {
            console.log("📦 Push détecté sur la branche main, démarrage du déploiement...");
            console.log("Repository:", req.body.repository?.name);
            console.log("Pusher:", req.body.pusher?.name);
            
            const result = await deployBackend();
            
            res.status(200).json({
                success: true,
                message: "Déploiement backend réussi",
                repository: req.body.repository?.name,
                branch: req.body.ref,
                pusher: req.body.pusher?.name,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log("ℹ️ Push sur une autre branche, déploiement ignoré");
            console.log("Branche:", req.body.ref);
            
            res.status(200).json({
                success: true,
                message: "Push ignoré (pas sur la branche main)",
                branch: req.body.ref,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error("❌ Erreur lors du traitement du webhook:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Route pour tester le déploiement manuellement
app.post("/deploy-manual", async (req, res) => {
    try {
        console.log("🔧 Déploiement manuel déclenché");
        const result = await deployBackend();
        
        res.status(200).json({
            success: true,
            message: "Déploiement manuel réussi",
            output: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Erreur lors du déploiement manuel:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Webhook backend server listening on port ${PORT}`);
    console.log(`📍 URL du webhook: http://69.62.105.91:${PORT}/webhook-backend`);
    console.log(`🏥 Health check: http://69.62.105.91:${PORT}/health`);
    console.log(`🔧 Manual deploy: http://69.62.105.91:${PORT}/deploy-manual`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
