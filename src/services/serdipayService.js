const axios = require("axios");

const BASE_URL = "https://serdipay.com/api/public-api/v1";

async function getToken() {

    try {

        const response = await axios.post(
            `${BASE_URL}/merchant/get-token`,
            {
                email: process.env.SERDIPAY_EMAIL,
                password: process.env.SERDIPAY_PASSWORD,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.access_token;

    } catch (error) {

        console.error(error.response?.data || error.message);

        throw error;
    }
}

module.exports = {
    getToken,
};