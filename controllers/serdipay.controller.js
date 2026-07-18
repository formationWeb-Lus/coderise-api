const serdiPayService = require("../services/serdipay.service");

/**
 * ==========================================
 * INITIER UN PAIEMENT
 * POST /api/payment/initiate
 * ==========================================
 */
exports.initiatePayment = async (req, res) => {
  console.log("\n========================================");
  console.log("🚀 INITIATE PAYMENT");
  console.log("========================================");
  console.log("Date :", new Date().toISOString());
  console.log("Body :", JSON.stringify(req.body, null, 2));

  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le body JSON est obligatoire.",
      });
    }

    const {
      userId,
      courseId,
      amount,
      phone,
      telecom,
      currency,
    } = req.body;

    /**
     * Champs obligatoires
     */
    if (
      !userId ||
      !courseId ||
      !amount ||
      !phone ||
      !telecom
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userId, courseId, amount, phone et telecom sont obligatoires.",
      });
    }

    /**
     * Validation montant
     */
    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le montant doit être supérieur à zéro.",
      });
    }

    /**
     * Validation téléphone RDC
     */
    if (
      typeof phone !== "string" ||
      !phone.startsWith("243")
    ) {
      return res.status(400).json({
        success: false,
        message: "Le numéro doit commencer par 243.",
      });
    }

    /**
     * Validation opérateur
     */
    const telecoms = ["AM", "OM", "MP", "AF"];

    if (!telecoms.includes(telecom)) {
      return res.status(400).json({
        success: false,
        message:
          "Télécom invalide (AM, OM, MP ou AF).",
      });
    }

    /**
     * Validation devise
     */
    if (
      currency &&
      !["CDF", "USD"].includes(currency)
    ) {
      return res.status(400).json({
        success: false,
        message: "Devise invalide.",
      });
    }

    /**
     * Appel du service
     */
    const result =
      await serdiPayService.initiatePayment({
        userId,
        courseId,
        amount,
        phone,
        telecom,
        currency,
      });

    return res.status(200).json({
      success: true,
      message: "Paiement initialisé.",
      data: result,
    });

  } catch (error) {

    console.error("\n========================================");
    console.error("❌ INITIATE PAYMENT ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Erreur lors de l'initialisation du paiement.",
      details: error.details || null,
    });

  }
};

/**
 * ==========================================
 * CALLBACK SERDIPAY
 * POST /api/payment/callback
 * ==========================================
 */
exports.paymentCallback = async (req, res) => {

  console.log("\n========================================");
  console.log("📩 CALLBACK SERDIPAY");
  console.log("========================================");
  console.log(JSON.stringify(req.body, null, 2));

  try {

    await serdiPayService.processCallback(req.body);

    return res.status(200).json({
      success: true,
      message: "Callback traité avec succès.",
    });

  } catch (error) {

    console.error("\n========================================");
    console.error("❌ CALLBACK ERROR");
    console.error("========================================");
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Erreur lors du traitement du callback.",
    });

  }

};