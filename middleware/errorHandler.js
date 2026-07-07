/**
 * =====================================================
 * Middleware global de gestion des erreurs
 * =====================================================
 * Ce middleware intercepte toutes les erreurs de
 * l'application et renvoie une réponse JSON uniforme.
 */

module.exports = (err, req, res, next) => {

    // Affichage de l'erreur dans la console
    console.error("====================================");
    console.error("❌ Erreur serveur");
    console.error("Message :", err.message);

    if (process.env.NODE_ENV === "development") {
        console.error("Stack :", err.stack);
    }

    console.error("====================================");

    // Détermination du code HTTP
    const statusCode = err.status || err.statusCode || 500;

    // Réponse au client
    return res.status(statusCode).json({

        success: false,

        message:
            err.message || "Erreur interne du serveur",

        status: statusCode,

        timestamp: new Date().toISOString(),

        path: req.originalUrl,

        method: req.method,

        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack
        })

    });

};