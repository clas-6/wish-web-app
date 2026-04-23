import { apiRequest, showAlert, toggleLoading, triggerConfetti, isAuthenticated } from './utils.js';
import { FINANCIAL, ENDPOINTS, WISH_TYPES } from './constants.js';
import { fetchMyWishes, fetchAllWishes } from './wishes.js';

let currentWishId = null;
let currentRemaining = 0;
let currentType = '';

window.openGrantModal = (id, remaining, type, network) => {
    if (!isAuthenticated()) {
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
    if (type === WISH_TYPES.AIRTIME) {
        partialSection.classList.remove('hidden');
    } else {
        partialSection.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

const updatePayAmount = (amount) => {
    // Add platform fee (Option 2: ₦10 flat fee)
    const total = Number(amount) + FINANCIAL.PLATFORM_FEE;
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
        
        // Simulate UI response for frontend dev
        setTimeout(() => {
            triggerConfetti();
            showAlert("Local Simulation: Kindness delivered! 💛", "success");
            document.getElementById('close-modal').click();
            
            // Refresh UI to show the "granted" state
            fetchMyWishes();
            fetchAllWishes('ALL');
        }, 1000);
        
    } catch (error) {
        console.error(error);
        showAlert("Simulation failed: " + error.message, "error");
    } finally {
        toggleLoading(btn, false);
    }
};

// Add a debug message if on localhost
if (location.hostname === "localhost") {
    console.log(" WISH Dev Mode: 'Confirm & Pay' will simulate a successful grant for frontend testing.");
}
// =================================================================

document.getElementById('confirm-grant')?.addEventListener('click', async () => {
    const btn = document.getElementById('confirm-grant');
    const amount = Number(document.getElementById('grant-amount').value);

    if (!isAuthenticated()) { showAlert("Please login to grant wishes", 'error'); return; }
    if (amount < FINANCIAL.MIN_AMOUNT) { showAlert(`Minimum grant is ₦${FINANCIAL.MIN_AMOUNT}`, 'error'); return; }
    if (amount > currentRemaining) { showAlert("Amount exceeds remaining wish amount", 'error'); return; }

    // If testing locally, bypass the real FastAPI API and Paystack
    if (location.hostname === "localhost") {
        await simulateLocalGrant(amount);
        return;
    }

    try {
        toggleLoading(btn, true, 'Processing...');
        const data = await apiRequest(ENDPOINTS.PAYMENTS_INIT, {
            method: 'POST',
            body: JSON.stringify({ wish_id: currentWishId, amount })
        });

        if (data.authorization_url) {
            window.location.href = data.authorization_url;
        } else {
            throw new Error("Failed to get payment URL");
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        toggleLoading(btn, false);
    }
});
