import { auth, db, functions, httpsCallable, showAlert, toggleLoading, triggerConfetti } from './utils.js';
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { fetchMyWishes, fetchAllWishes } from './wishes.js';

let currentWishId = null;
let currentRemaining = 0;
let currentType = '';

window.openGrantModal = (id, remaining, type, network) => {
    if (!auth.currentUser) {
        showAlert("Please login to grant wishes", 'error');
        return;
    }

    currentWishId = id;
    currentRemaining = remaining;
    currentType = type;

    const modal = document.getElementById('grant-modal');
    const details = document.getElementById('modal-wish-details');
    const partialSection = document.getElementById('partial-grant-section');
    const modalTotal = document.getElementById('modal-total');
    const modalPayAmount = document.getElementById('modal-pay-amount');
    const grantInput = document.getElementById('grant-amount');

    details.innerText = `${network} ${type}`;
    modalTotal.innerText = `₦${remaining}`;
    
    // Default to full amount
    grantInput.value = remaining;
    updatePayAmount(remaining);

    // Only show partial for Airtime as per requirements
    if (type === 'AIRTIME') {
        partialSection.classList.remove('hidden');
    } else {
        partialSection.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

const updatePayAmount = (amount) => {
    // Add platform fee (Option 2: ₦10 flat fee)
    const fee = 10;
    const total = Number(amount) + fee;
    document.getElementById('modal-pay-amount').innerText = `₦${total}`;
};

document.getElementById('grant-amount')?.addEventListener('input', (e) => {
    updatePayAmount(e.target.value);
});

document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('grant-modal').classList.add('hidden');
    document.getElementById('grant-modal').classList.remove('flex');
});

// ====================== LOCAL TESTING BYPASS ======================
// This allows the frontend dev to simulate a successful grant without a real backend
const simulateLocalGrant = async (amount) => {
    const btn = document.getElementById('confirm-grant');
    try {
        toggleLoading(btn, true, 'Simulating...');
        const wishRef = doc(db, 'wishes', currentWishId);
        
        const newRemaining = currentRemaining - amount;
        const newStatus = newRemaining <= 0 ? "FULFILLED" : "PARTIALLY_FULFILLED";

        await updateDoc(wishRef, {
            amount_paid: increment(amount),
            remaining_amount: increment(-amount),
            status: newStatus
        });

        // Fire confetti if wish is completed!
        if (newStatus === "FULFILLED") {
            triggerConfetti();
        }

        showAlert("Local Test: Wish updated successfully!", "success");
        document.getElementById('close-modal').click();
        
        // Refresh UI components without reloading the page
        fetchMyWishes();
        fetchAllWishes('ALL');

    } catch (error) {
        console.error(error);
        showAlert("Simulation failed: " + error.message, "error");
    } finally {
        toggleLoading(btn, false);
    }
};

// Add a debug message if on localhost
if (location.hostname === "localhost") {
    console.log("🛠️ WISH Dev Mode: 'Confirm & Pay' will simulate a successful grant for frontend testing.");
}
// =================================================================

document.getElementById('confirm-grant')?.addEventListener('click', async () => {
    const btn = document.getElementById('confirm-grant');
    const amount = Number(document.getElementById('grant-amount').value);
    const user = auth.currentUser;

    if (!user) return showAlert("Please login to grant wishes", 'error');
    if (amount < 100) return showAlert("Minimum grant is ₦100", 'error');
    if (amount > currentRemaining) return showAlert("Amount exceeds remaining wish amount", 'error');

    // If testing locally, bypass the real cloud function and Paystack
    if (location.hostname === "localhost") {
        await simulateLocalGrant(amount);
        return;
    }

    try {
        toggleLoading(btn, true, 'Processing...');
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
        const result = await createPaymentIntent({ 
            wishId: currentWishId, 
            amount: amount 
        });

        if (result.data.authorization_url) {
            window.location.href = result.data.authorization_url;
        } else {
            throw new Error("Failed to get payment URL");
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        toggleLoading(btn, false);
    }
});
