const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const PAYSTACK_SECRET_KEY = "sk_test_your_secret_key"; // Should be in environment config
const VTU_API_KEY = "your_vtu_api_key";
const PLATFORM_FEE = 50;

// 1. Create Paystack Payment Intent
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { wishId, amount } = data;
    const uid = context.auth.uid;

    const wishDoc = await db.collection("wishes").doc(wishId).get();
    if (!wishDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Wish not found.");
    }

    const wish = wishDoc.data();
    if (amount > wish.remaining_amount) {
        throw new functions.https.HttpsError("invalid-argument", "Amount exceeds remaining wish amount.");
    }

    const totalToPay = amount + PLATFORM_FEE;

    try {
        const response = await axios.post("https://api.paystack.co/transaction/initialize", {
            email: context.auth.token.email,
            amount: totalToPay * 100, // Paystack expects kobo
            callback_url: "https://your-app-url.web.app/dashboard.html",
            metadata: {
                wishId: wishId,
                granterUid: uid,
                originalAmount: amount
            }
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            }
        });

        // Save payment record as pending
        await db.collection("payments").add({
            wish_id: wishId,
            granter_uid: uid,
            amount: amount,
            total_paid: totalToPay,
            paystack_reference: response.data.data.reference,
            status: "PENDING",
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        return { authorization_url: response.data.data.authorization_url };
    } catch (error) {
        console.error("Paystack Init Error:", error);
        throw new functions.https.HttpsError("internal", "Failed to initialize payment.");
    }
});

// 2. Paystack Webhook
exports.paystackWebhook = functions.https.onRequest(async (req, res) => {
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY)
                       .update(JSON.stringify(req.body))
                       .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
        return res.status(401).send("Invalid signature");
    }

    const event = req.body;
    if (event.event === "charge.success") {
        const { reference, metadata } = event.data;
        const { wishId, granterUid, originalAmount } = metadata;

        // Run as transaction to ensure atomicity
        try {
            await db.runTransaction(async (transaction) => {
                const wishRef = db.collection("wishes").doc(wishId);
                const wishDoc = await transaction.get(wishRef);
                const wish = wishDoc.data();

                // Update payment record
                const paymentQuery = await db.collection("payments")
                    .where("paystack_reference", "==", reference)
                    .limit(1)
                    .get();
                
                if (!paymentQuery.empty) {
                    transaction.update(paymentQuery.docs[0].ref, { status: "SUCCESS" });
                }

                // Update wish
                const newAmountPaid = wish.amount_paid + originalAmount;
                const newRemaining = wish.remaining_amount - originalAmount;
                const newStatus = newRemaining <= 0 ? "FULFILLED" : "PARTIALLY_FULFILLED";

                transaction.update(wishRef, {
                    amount_paid: newAmountPaid,
                    remaining_amount: newRemaining,
                    status: newStatus
                });

                // Trigger VTU fulfillment
                // In a real app, you might want to do this in a separate background function
                // or after the transaction succeeds to avoid blocking.
                // For this template, we'll log it for fulfillment.
                await db.collection("vtu_queue").add({
                    wishId,
                    amount: originalAmount,
                    phone: wish.phone, // Ideally decrypted here
                    network: wish.network,
                    type: wish.type,
                    status: "PENDING",
                    created_at: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            return res.status(200).send("Webhook processed");
        } catch (error) {
            console.error("Webhook Transaction Error:", error);
            return res.status(500).send("Internal Error");
        }
    }

    res.status(200).send("Event ignored");
});

// 3. VTU Fulfillment (Background Trigger)
exports.processVTU = functions.firestore.document("vtu_queue/{id}").onCreate(async (snap, context) => {
    const data = snap.data();
    const { wishId, amount, phone, network, type } = data;

    try {
        // MOCK VTU API CALL
        console.log(`Calling VTU API for ${phone} - ${network} - ₦${amount}`);
        
        /* 
        const response = await axios.post("https://vtu-provider.com/api/v1/topup", {
            apiKey: VTU_API_KEY,
            phone,
            network,
            amount,
            type: type.toLowerCase()
        });
        */

        // Update queue status
        await snap.ref.update({
            status: "SUCCESS",
            provider_reference: "MOCK_REF_" + Math.random().toString(36).substring(7),
            processed_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Log to vtu_logs
        await db.collection("vtu_logs").add({
            wish_id: wishId,
            amount: amount,
            status: "SUCCESS",
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error("VTU Error:", error);
        await snap.ref.update({ status: "FAILED", error: error.message });
        
        // Handle retry or refund logic here
    }
});
