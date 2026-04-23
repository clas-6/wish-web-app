import { apiRequest } from './utils.js';
import { OCCASION_CONFIG, WISH_CATEGORIES } from './constants.js';

export const dummyWishes = [
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

const getActiveOccasion = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    for (const key in OCCASION_CONFIG) {
        const config = OCCASION_CONFIG[key];
        const isCrossingYear = config.start.month > config.end.month;

        const isActive = isCrossingYear 
            ? (month === config.start.month && day >= config.start.day) || (month === config.end.month && day <= config.end.day)
            : (month === config.start.month && day >= config.start.day && day <= config.end.day);

        if (isActive) return key;
    }
    return null;
};

export const seedDummyWishes = async () => {
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        console.error(" Seeding is only permitted on localhost.");
        return;
    }

    console.log(" Seeding dummy wishes...");
    
    const activeOccasion = getActiveOccasion();
    const wishesToSeed = [...dummyWishes];

    if (activeOccasion) {
        const occasionMessages = {
            VALENTINE: "I'd love some airtime to call my partner tonight and share some love. 💖",
            NEW_YEAR: "Starting the year with some data to stay in touch with family and friends. Happy New Year! 🎆",
        };

        wishesToSeed.push({
            uid: "occasion_user",
            type: "AIRTIME",
            network: "MTN",
            category: WISH_CATEGORIES[activeOccasion],
            total_amount: 1000,
            amount_paid: 0,
            remaining_amount: 1000,
            phone: "08033998877",
            message: occasionMessages[activeOccasion] || "Special occasion wish! 💛",
            status: "OPEN"
        });
    }

    for (const wish of wishesToSeed) {
        try {
            await apiRequest('/wishes/', {
                method: 'POST',
                body: JSON.stringify(wish)
            });
        } catch (e) {
            console.error("Failed to seed wish:", e);
        }
    }
    console.log("Seeding complete! Refresh the page to see the new wishes.");
};

// Expose to window for easy console access
window.seedDummyWishes = seedDummyWishes;