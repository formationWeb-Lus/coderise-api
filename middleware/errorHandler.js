/**
 * =====================================================
 * Middleware global de gestion des erreurs
 * =====================================================
 * Intercepte toutes les erreurs de l'application
 * et renvoie une réponse JSON uniforme.
 */

module.exports = (err, req, res, next) => {

    const statusCode = err.status || err.statusCode || 500;

    console.error("======================================");
    console.error("❌ GLOBAL ERROR HANDLER");
    console.error("Status :", statusCode);
    console.error("Route :", req.originalUrl);
    console.error("Method :", req.method);
    console.error("Message :", err.message);

    if (err.response) {
        console.error("External API Status :", err.response.status);
        console.error("External API Data :", err.response.data);
    }

    if (process.env.NODE_ENV === "development") {
        console.error("Stack :");
        console.error(err.stack);
    }

    console.error("======================================");

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: err.message || "Erreur interne du serveur.",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),

        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};