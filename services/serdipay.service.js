const axios = require("axios");
const config = require("../config/serdipay.config");

let accessToken = null;
let tokenExpiration = null;

/**
 * =====================================
 * AXIOS CLIENT
 * =====================================
 */

const api = axios.create({
  baseURL: config.BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * =====================================
 * GET TOKEN
 * =====================================
 */

async function getToken() {
  try {
    // Token encore valide ?
    if (
      accessToken &&
      tokenExpiration &&
      Date.now() < tokenExpiration
    ) {
      return accessToken;
    }

    const response = await api.post("/merchant/get-token", {
      email: config.EMAIL,
      password: config.PASSWORD,
    });

    accessToken = response.data.access_token;

    // Cache pendant 50 minutes
    tokenExpiration =
      Date.now() + config.TOKEN_CACHE_MINUTES * 60 * 1000;

    console.log("✅ Nouveau token SerdiPay obtenu");

    return accessToken;
  } catch (error) {
    console.error("❌ Erreur Token SerdiPay");

    throw {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "Impossible d'obtenir le token",
    };
  }
}

/**
 * =====================================
 * INITIATE PAYMENT (C2B)
 * =====================================
 */

async function initiatePayment({
  amount,
  phone,
  telecom,
  currency,
}) {
  try {
    const token = await getToken();

    const response = await api.post(
      "/merchant/payment-merchant",
      {
        api_id: config.API_ID,
        api_password: config.API_PASSWORD,
        merchantCode: config.MERCHANT_CODE,
        merchant_pin: config.MERCHANT_PIN,

        clientPhone: phone,

        amount,

        currency: currency || config.CURRENCY,

        telecom,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("========== SERDIPAY ERROR ==========");

if (error.response) {
    console.error("Status :", error.response.status);
    console.error("Data :", error.response.data);
} else {
    console.error(error.message);
}

    throw {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.response?.data ||
        error.message,
    };
  }
}

/**
 * =====================================
 * B2C (Préparé)
 * =====================================
 */

async function payout({
  amount,
  phone,
  telecom,
}) {
  try {
    const token = await getToken();

    const response = await api.post(
      "/merchant/payment-client",
      {
        api_id: config.API_ID,
        api_password: config.API_PASSWORD,
        merchantCode: config.MERCHANT_CODE,
        merchant_pin: config.MERCHANT_PIN,

        clientPhone: phone,

        amount,

        currency: config.CURRENCY,

        telecom,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message,
    };
  }
}

module.exports = {
  getToken,
  initiatePayment,
  payout,
};