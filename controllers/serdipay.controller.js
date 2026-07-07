const serdiPayService = require("../services/serdipay.service");
const config = require("../config/serdipay.config");


/**
 * =====================================
 * INITIER UN PAIEMENT C2B
 * =====================================
 * POST /payments/initiate
 */
exports.initiatePayment = async (req, res) => {

    try {

        const {
            amount,
            phone,
            telecom
        } = req.body;


        // Vérification des champs obligatoires
        if (!amount || !phone || !telecom) {

            return res.status(400).json({

                success: false,

                message:
                "amount, phone et telecom sont obligatoires"

            });

        }


        // Appel SerdiPay
        const payment =
        await serdiPayService.initiatePayment({

            amount,

            phone,

            telecom

        });


        return res.status(200).json({

            success: true,

            message:
            "Paiement initialisé avec succès",

            data: payment

        });


    } catch (error) {


        console.error(
            "❌ Controller Payment Error:",
            error
        );


        return res.status(
            error.status || 500
        )
        .json({

            success:false,

            message:
            error.message ||
            "Erreur lors du paiement"

        });

    }

};



/**
 * =====================================
 * CALLBACK SERDIPAY
 * =====================================
 * POST /payments/callback
 */
exports.paymentCallback = async (req,res)=>{

    try {


        console.log(
            "📩 Callback SerdiPay reçu:",
            req.body
        );


        /**
         * Ici plus tard :
         * 1. Vérifier la signature SerdiPay
         * 2. Chercher la transaction
         * 3. Modifier le statut :
         *
         * PENDING -> SUCCESS
         *
         * 4. Inscrire automatiquement
         *    l'étudiant au cours
         */


        return res.status(200).json({

            success:true,

            message:
            "Callback reçu"

        });



    } catch(error){


        console.error(
            "Callback Error:",
            error
        );


        return res.status(500).json({

            success:false,

            message:
            "Erreur callback"

        });

    }

};