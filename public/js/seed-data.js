import { apiRequest } from './utils.js';

const dummyWishes = [
    {
        uid: "test_user_1",
        type: "AIRTIME",
        network: "MTN",
        category: "KINDNESS",
        total_amount: 500,
        amount_paid: 0,
        remaining_amount: 500,
        phone: "08011112222",
        message: "I need some airtime to call my parents back home. Any help is appreciated! 💛",
        status: "OPEN"
    },
    {
        uid: "test_user_2",
        type: "DATA",
        network: "AIRTEL",
        category: "KINDNESS",
        total_amount: 1500,
        amount_paid: 500,
        remaining_amount: 1000,
        phone: "08122334455",
        message: "Final year project is due tomorrow and I ran out of data for research. Please help!",
        status: "PARTIALLY_FULFILLED"
    },
    {
        uid: "test_user_3",
        type: "AIRTIME",
        network: "GLO",
        category: "KINDNESS",
        total_amount: 200,
        amount_paid: 0,
        remaining_amount: 200,
        phone: "09055667788",
        message: "Just a small top-up for an emergency call. Thank you!",
        status: "OPEN"
    }
];

export const seedDummyWishes = async () => {
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        console.error("⛔ Seeding is only permitted on localhost.");
        return;
    }
    console.log("🚀 Seeding dummy wishes...");
    for (const wish of dummyWishes) {
        try {
            await apiRequest('/wishes/', {
                method: 'POST',
                body: JSON.stringify(wish)
            });
        } catch (e) {
            console.error("Failed to seed wish:", e);
        }
    }
    console.log("✅ Seeding complete! Refresh the page to see the new wishes.");
};

// Expose to window for easy console access
window.seedDummyWishes = seedDummyWishes;