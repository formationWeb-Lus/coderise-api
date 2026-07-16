require("dotenv").config();

module.exports = {
  // Nouvelle URL SerdiPay (migration 2026)
  BASE_URL:
    process.env.SERDIPAY_BASE_URL ||
    "https://public-apis.services.serdipay.com/api/public-api/v1",

  BASE_URL_TEST: process.env.SERDIPAY_BASE_URL_TEST ||
    "https://public-apis.services.serdipay.com/api/public-api/v1",

  // Authentification Merchant
  EMAIL: process.env.SERDIPAY_EMAIL,
  PASSWORD: process.env.SERDIPAY_PASSWORD,

  // API Merchant
  API_ID: process.env.SERDIPAY_API_ID,
  API_PASSWORD: process.env.SERDIPAY_API_PASSWORD,
  MERCHANT_CODE: process.env.SERDIPAY_MERCHANT_CODE,
  MERCHANT_PIN: process.env.SERDIPAY_MERCHANT_PIN,

  // Configuration générale
  CURRENCY: process.env.SERDIPAY_CURRENCY || "CDF",

  CALLBACK_URL:
    process.env.SERDIPAY_CALLBACK_URL ||
    "http://api.coderise-solution.com/api/payment/callback",

  TOKEN_CACHE_MINUTES: 50,

  TIMEOUT: 120000, // 2 minutes

  TELECOM: {
    AIRTEL: "AM",
    ORANGE: "OM",
    MPESA: "MP",
    AFRIMONEY: "AF",
  },
};