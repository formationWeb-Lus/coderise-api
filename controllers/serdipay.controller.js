const serdiPayService = require("../services/serdipay.service");
const config = require("../config/serdipay.config");

/**
 * =====================================
 * INITIER UN PAIEMENT C2B
 * =====================================
 * POST /api/payment/initiate
 */
exports.initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      phone,
      telecom,
      currency,
    } = req.body;

    console.log("========== PAYMENT REQUEST ==========");
    console.log(req.body);

    /**
     * Vérification des champs obligatoires
     */
    if (!amount || !phone || !telecom) {
      return res.status(400).json({
        success: false,
        message: "amount, phone et telecom sont obligatoires.",
      });
    }

    /**
     * Vérification du montant
     */
    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le montant doit être supérieur à zéro.",
      });
    }

    /**
     * Vérification du numéro
     */
    if (!phone.startsWith("243")) {
      return res.status(400).json({
        success: false,
        message: "Le numéro doit commencer par 243.",
      });
    }

    /**
     * Vérification du réseau Mobile Money
     */
    const telecoms = ["AM", "OM", "MP", "AF"];

    if (!telecoms.includes(telecom)) {
      return res.status(400).json({
        success: false,
        message:
          "Télécom invalide. Utilisez AM, OM, MP ou AF.",
      });
    }

    /**
     * Vérification de la devise
     */
    if (
      currency &&
      !["CDF", "USD"].includes(currency)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La devise doit être CDF ou USD.",
      });
    }

    /**
     * Appel du service SerdiPay
     */
    const payment =
      await serdiPayService.initiatePayment({
        amount,
        phone,
        telecom,
        currency,
      });

    console.log("========== PAYMENT RESPONSE ==========");
    console.log(payment);

    return res.status(200).json({
      success: true,
      message: "Paiement initialisé avec succès.",
      data: payment,
    });

  } catch (error) {

    console.error("========== PAYMENT ERROR ==========");
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Erreur lors de l'initialisation du paiement.",
    });

  }
};

/**
 * =====================================
 * CALLBACK SERDIPAY
 * =====================================
 * POST /api/payment/callback
 */
exports.paymentCallback = async (req, res) => {

  try {

    console.log("========== CALLBACK SERDIPAY ==========");
    console.log(req.body);

    /**
     * Exemple de callback SerdiPay :
     *
     * {
     *   status:200,
     *   message:"Reference",
     *   payment:{
     *      status:"success",
     *      sessionId:"1720786347",
     *      sessionStatus:3,
     *      transactionId:"SERDMG7MW6ZV"
     *   }
     * }
     */

    const { payment } = req.body;

    if (payment) {

      console.log("Statut :", payment.status);
      console.log("Transaction :", payment.transactionId);
      console.log("Session :", payment.sessionId);

      /**
       * TODO
       *
       * 1. Vérifier la signature SerdiPay
       * 2. Rechercher la transaction
       * 3. Mettre à jour la base de données
       * 4. Si SUCCESS :
       *      - activer le paiement
       *      - inscrire automatiquement l'étudiant
       *      - envoyer un email
       *      - envoyer une notification
       */
    }

    return res.status(200).json({
      success: true,
      message: "Callback reçu avec succès.",
    });

  } catch (error) {

    console.error("========== CALLBACK ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement du callback.",
    });

  }

};