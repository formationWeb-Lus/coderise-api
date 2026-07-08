const serdiPayService = require("../services/serdipay.service");


/**
 * =====================================
 * INITIER UN PAIEMENT C2B
 * =====================================
 * POST /api/payment/initiate
 */
exports.initiatePayment = async (req, res) => {

  console.log("========== CONTROLLER PAYMENT ==========");
  console.log("Headers :", req.headers);
  console.log("Body reçu :", req.body);


  try {

    /**
     * Protection si req.body est vide
     */
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Le body JSON est obligatoire.",
      });
    }


    const {
      amount,
      phone,
      telecom,
      currency,
    } = req.body;


    console.log("========== PAYMENT REQUEST ==========");
    console.log({
      amount,
      phone,
      telecom,
      currency,
    });



    /**
     * Vérification des champs obligatoires
     */
    if (!amount || !phone || !telecom) {

      return res.status(400).json({
        success: false,
        message:
          "amount, phone et telecom sont obligatoires.",
      });

    }



    /**
     * Vérification montant
     */
    if (Number(amount) <= 0) {

      return res.status(400).json({
        success: false,
        message:
          "Le montant doit être supérieur à zéro.",
      });

    }



    /**
     * Vérification téléphone
     */
    if (
      typeof phone !== "string" ||
      !phone.startsWith("243")
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Le numéro doit commencer par 243.",
      });

    }



    /**
     * Vérification opérateur
     */
    const telecoms = [
      "AM",
      "OM",
      "MP",
      "AF"
    ];


    if (!telecoms.includes(telecom)) {

      return res.status(400).json({
        success: false,
        message:
          "Télécom invalide. Utilisez AM, OM, MP ou AF.",
      });

    }



    /**
     * Vérification devise
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
     * Appel API SerdiPay
     */
    console.log("========== APPEL SERDIPAY ==========");


    const payment =
      await serdiPayService.initiatePayment({

        amount,
        phone,
        telecom,
        currency,

      });



    console.log("========== SERDIPAY RESPONSE ==========");
    console.log(payment);



    return res.status(200).json({

      success: true,

      message:
        "Paiement initialisé avec succès.",

      data: payment,

    });



  } catch (error) {


    console.error("========== PAYMENT ERROR ==========");
    console.error(error);



    return res.status(
      error.status || 500
    ).json({

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



    if (!req.body) {

      return res.status(400).json({

        success: false,

        message:
          "Callback vide.",

      });

    }



    const {
      payment
    } = req.body;



    if (payment) {


      console.log(
        "Statut :",
        payment.status
      );


      console.log(
        "Transaction :",
        payment.transactionId
      );


      console.log(
        "Session :",
        payment.sessionId
      );



      /**
       * TODO:
       *
       * 1. Vérifier signature SerdiPay
       * 2. Chercher transaction en DB
       * 3. Modifier statut paiement
       * 4. Inscrire étudiant
       * 5. Envoyer notification
       */

    }



    return res.status(200).json({

      success: true,

      message:
        "Callback reçu avec succès.",

    });



  } catch (error) {


    console.error(
      "========== CALLBACK ERROR =========="
    );

    console.error(error);



    return res.status(500).json({

      success: false,

      message:
        "Erreur lors du traitement du callback.",

    });


  }


};