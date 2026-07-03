const axios = require("axios");

const BASE_URL = "https://serdipay.com/api/public-api/v1";

let cachedToken = null;
let tokenTime = null;

// 🔐 GET TOKEN
async function getToken() {
  if (cachedToken && Date.now() - tokenTime < 50 * 60 * 1000) {
    return cachedToken;
  }

  const res = await axios.post(`${BASE_URL}/merchant/get-token`, {
    email: process.env.SERDIPAY_EMAIL,
    password: process.env.SERDIPAY_PASSWORD,
  });

  cachedToken = res.data.access_token;
  tokenTime = Date.now();

  return cachedToken;
}

// 💳 PAYMENT
async function pay({ amount, phone, telecom }) {
  const token = await getToken();

  const res = await axios.post(
    `${BASE_URL}/merchant/payment-merchant`,
    {
      api_id: process.env.API_ID,
      api_password: process.env.API_PASSWORD,
      merchantCode: process.env.MERCHANT_CODE,
      merchant_pin: process.env.MERCHANT_PIN,
      clientPhone: phone,
      amount,
      currency: "CDF",
      telecom, // AM / OM / AF / MP
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

module.exports = { pay };