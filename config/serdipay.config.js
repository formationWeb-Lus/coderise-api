require("dotenv").config();

const IS_PRODUCTION = process.env.NODE_ENV === "production";

module.exports = {
  // URL utilisée selon l'environnement
  BASE_URL: IS_PRODUCTION
    ? process.env.SERDIPAY_BASE_URL
    : process.env.SERDIPAY_BASE_URL_TEST,

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
    "https://api.coderise-solution.com/api/payment/callback",

  TOKEN_CACHE_MINUTES: 50,

  TIMEOUT: 120000,

  TELECOM: {
    AIRTEL: "AM",
    ORANGE: "OM",
    MPESA: "MP",
    AFRIMONEY: "AF",
  },
};