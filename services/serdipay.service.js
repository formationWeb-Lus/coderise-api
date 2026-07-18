const axios = require("axios");
const prisma = require("../lib/prisma");
const config = require("../config/serdipay.config");

/**
 * ==========================================
 * CACHE DU TOKEN
 * ==========================================
 */

let accessToken = null;
let tokenExpiresAt = null;

/**
 * ==========================================
 * AXIOS CLIENT
 * ==========================================
 */

const api = axios.create({
  timeout: config.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ==========================================
 * RECUPERATION DU TOKEN SERDIPAY
 * ==========================================
 */

async function getAccessToken() {
  try {
    /**
     * Utiliser le token en mémoire
     */
    if (
      accessToken &&
      tokenExpiresAt &&
      tokenExpiresAt > Date.now()
    ) {
      console.log("✅ Token SerdiPay récupéré depuis le cache.");
      return accessToken;
    }

    console.log("\n========================================");
    console.log("🔐 AUTHENTIFICATION SERDIPAY");
    console.log("========================================");

    const response = await api.post(
      `${config.BASE_URL}/merchant/get-token`,
      {
        email: config.EMAIL,
        password: config.PASSWORD,
      }
    );

    console.log("Réponse SerdiPay :");
    console.log(JSON.stringify(response.data, null, 2));

    if (!response.data.access_token) {
      throw new Error("Token SerdiPay introuvable.");
    }

    accessToken = response.data.access_token;

    tokenExpiresAt =
      Date.now() +
      config.TOKEN_CACHE_MINUTES *
        60 *
        1000;

    console.log("✅ Nouveau token enregistré.");

    return accessToken;

  } catch (error) {

    console.error("\n========================================");
    console.error("❌ AUTHENTIFICATION SERDIPAY");
    console.error("========================================");

    if (error.response) {

      console.error("Status :", error.response.status);
      console.error(
        JSON.stringify(error.response.data, null, 2)
      );

      throw {
        status: error.response.status,
        message:
          error.response.data.message ||
          "Erreur d'authentification SerdiPay.",
        details: error.response.data,
      };
    }

    throw {
      status: 500,
      message: error.message,
    };
  }
}

/**
 * ==========================================
 * INITIER UN PAIEMENT SERDIPAY
 * ==========================================
 */

async function initiatePayment(data) {

  const {
    userId,
    courseId,
    amount,
    phone,
    telecom,
    currency,
  } = data;

  try {

    console.log("\n========================================");
    console.log("💳 CREATION DU PAIEMENT");
    console.log("========================================");

    /**
     * Vérifier utilisateur
     */
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      throw {
        status: 404,
        message: "Utilisateur introuvable.",
      };
    }

    /**
     * Vérifier formation
     */
    const course = await prisma.course.findUnique({
      where: {
        id: Number(courseId),
      },
    });

    if (!course) {
      throw {
        status: 404,
        message: "Formation introuvable.",
      };
    }

    /**
     * Empêcher un double achat
     */
    const alreadyRegistered =
      await prisma.studentCourse.findFirst({
        where: {
          userId: Number(userId),
          courseId: Number(courseId),
        },
      });

    if (alreadyRegistered) {
      throw {
        status: 409,
        message: "Vous êtes déjà inscrit à cette formation.",
      };
    }

    /**
     * Créer le paiement en attente
     */
    const payment = await prisma.payment.create({
      data: {
        userId: Number(userId),
        courseId: Number(courseId),
        amount: Number(amount),
        phone,
        telecom,
        status: "PENDING",
      },
    });

    console.log("Paiement créé :", payment.id);

    /**
     * Token SerdiPay
     */
    const token = await getAccessToken();

    console.log("========================================");
    console.log("📤 APPEL API SERDIPAY");
    console.log("========================================");

    const response = await api.post(
      `${config.BASE_URL}/merchant/payment-merchant`,
      {
        api_id: config.API_ID,
        api_password: config.API_PASSWORD,
        merchantCode: config.MERCHANT_CODE,
        merchant_pin: config.MERCHANT_PIN,
        clientPhone: phone,
        amount: Number(amount),
        currency: currency || config.CURRENCY,
        telecom,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Réponse SerdiPay :");
    console.log(JSON.stringify(response.data, null, 2));

    /**
     * Sauvegarder le sessionId
     */
    if (response.data.payment) {

      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          sessionId:
            response.data.payment.sessionId || null,

          transactionId:
            response.data.payment.transactionId || null,
        },
      });

    }

    /**
     * Retour frontend
     */
    return {
      paymentId: payment.id,
      serdiPay: response.data,
    };

  } catch (error) {

    /**
     * Si le paiement existe déjà,
     * le marquer FAILED
     */

    console.error("\n========================================");
    console.error("❌ INITIATE PAYMENT");
    console.error("========================================");

    if (error.response) {

      console.error(error.response.status);
      console.error(error.response.data);

      throw {
        status: error.response.status,
        message:
          error.response.data.message ||
          "Erreur SerdiPay",
        details: error.response.data,
      };
    }

    throw error;

  }

}

/**
 * ==========================================
 * TRAITEMENT DU CALLBACK SERDIPAY
 * ==========================================
 */

async function processCallback(callback) {

  try {

    console.log("\n========================================");
    console.log("📩 TRAITEMENT CALLBACK");
    console.log("========================================");

    console.log(JSON.stringify(callback, null, 2));

    const paymentCallback = callback.payment;

    if (!paymentCallback) {

      throw {
        status: 400,
        message: "Objet payment absent.",
      };

    }

    /**
     * Recherche du paiement
     */

    const payment = await prisma.payment.findFirst({

      where: {
        sessionId: paymentCallback.sessionId,
      },

    });

    if (!payment) {

      throw {
        status: 404,
        message: "Paiement introuvable.",
      };

    }

    /**
     * Empêcher le callback en double
     */

    if (
      payment.status === "SUCCESS" ||
      payment.status === "FAILED"
    ) {

      console.log("⚠ Callback déjà traité.");

      return payment;

    }

    /**
     * Paiement réussi
     */

    if (paymentCallback.status === "success") {

      console.log("✅ Paiement confirmé.");

      /**
       * Mise à jour Payment
       */

      await prisma.payment.update({

        where: {
          id: payment.id,
        },

        data: {

          status: "SUCCESS",

          transactionId:
            paymentCallback.transactionId,

          sessionId:
            paymentCallback.sessionId,

        },

      });

      /**
       * Vérifier inscription
       */

      const alreadyRegistered =
        await prisma.studentCourse.findFirst({

          where: {

            userId: payment.userId,

            courseId: payment.courseId,

          },

        });

      /**
       * Inscription automatique
       */

      if (!alreadyRegistered) {

        await prisma.studentCourse.create({

          data: {

            userId: payment.userId,

            courseId: payment.courseId,

          },

        });

        console.log("🎓 Etudiant inscrit.");

      }

      /**
       * Notification
       */

      await prisma.notification.create({

        data: {

          userId: payment.userId,

          title: "Paiement confirmé",

          message:
            "Votre paiement a été confirmé. Vous avez désormais accès à votre formation.",

        },

      });

      console.log("🔔 Notification créée.");

      return true;

    }

    /**
     * Paiement refusé
     */

    await prisma.payment.update({

      where: {

        id: payment.id,

      },

      data: {

        status: "FAILED",

        transactionId:
          paymentCallback.transactionId,

      },

    });

    console.log("❌ Paiement refusé.");

    return false;

  }

  catch (error) {

    console.error("\n========================================");
    console.error("❌ CALLBACK SERVICE");
    console.error("========================================");

    console.error(error);

    throw error;

  }

}


/**
 * ============================================
 * VIDER LE CACHE DU TOKEN
 * ============================================
 */
function clearTokenCache() {
  tokenCache = null;
  tokenExpiration = null;

  console.log("🗑️ Cache du token SerdiPay supprimé.");
}

/**
 * ============================================
 * OBTENIR LE TOKEN ACTUEL (DEBUG)
 * ============================================
 */
function getCurrentToken() {
  return tokenCache;
}

/**
 * ============================================
 * OBTENIR LA DATE D'EXPIRATION
 * ============================================
 */
function getTokenExpiration() {
  return tokenExpiration;
}

/**
 * ============================================
 * CONSULTER UNE TRANSACTION
 * (Prévu pour une future API SerdiPay)
 * ============================================
 */
async function getPaymentStatus(transactionId) {
  try {
    console.log("========================================");
    console.log("🔎 CONSULTATION TRANSACTION");
    console.log("Transaction :", transactionId);
    console.log("========================================");

    /**
     * Lorsque SerdiPay publiera une API
     * GET /payment/status
     * cette fonction sera complétée.
     */

    return {
      success: false,
      message:
        "La consultation d'une transaction n'est pas encore disponible.",
      transactionId,
    };

  } catch (error) {

    console.error("Erreur consultation :", error.message);

    throw {
      status: 500,
      message: error.message,
    };

  }
}

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

module.exports = {
  initiatePayment,
  getAccessToken,
  getPaymentStatus,
  clearTokenCache,
  getCurrentToken,
  getTokenExpiration,
};