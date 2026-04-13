import { auth, functions, httpsCallable, showAlert, toggleLoading } from './utils.js';

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
    const modalRemaining = document.getElementById('modal-remaining');
    const modalTotal = document.getElementById('modal-total');
    const modalPayAmount = document.getElementById('modal-pay-amount');
    const grantInput = document.getElementById('grant-amount');

    details.innerText = `${network} ${type}`;
    modalTotal.innerText = `₦${remaining}`;
    modalRemaining.innerText = remaining;
    
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
    // Add platform fee (Option 2: ₦50 flat fee)
    const fee = 50;
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

document.getElementById('confirm-grant')?.addEventListener('click', async () => {
    const btn = document.getElementById('confirm-grant');
    const amount = Number(document.getElementById('grant-amount').value);
    const user = auth.currentUser;

    if (!user) return showAlert("Please login to grant wishes", 'error');
    if (amount < 100) return showAlert("Minimum grant is ₦100", 'error');
    if (amount > currentRemaining) return showAlert("Amount exceeds remaining wish amount", 'error');

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
