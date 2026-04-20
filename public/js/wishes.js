import { apiRequest, showAlert, toggleLoading, triggerConfetti, isAuthenticated } from './utils.js';

// ====================== CREATE WISH ======================
const createWishForm = document.getElementById('create-wish-form');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phone-error');

const amountInput = document.getElementById('amount');
const amountError = document.getElementById('amount-error');
const messageInput = document.getElementById('message');
const messageCounter = document.getElementById('message-counter');

const WEEKLY_LIMIT = 5000;

const updateWeeklyAllowance = async () => {
    const display = document.getElementById('weekly-allowance-display');
    if (!display) return;

    try {
        // Fetch remaining allowance from Django backend
        display.classList.remove('hidden');
        const data = await apiRequest('/wishes/allowance/'); // Partner's Django API endpoint
        const remaining = data.remaining;
        display.innerHTML = `Weekly Remaining: <span class="font-bold text-accent">₦${remaining.toLocaleString()}</span> / ₦${WEEKLY_LIMIT.toLocaleString()}`;
    } catch (error) {
        console.error("Error updating allowance:", error);
        display.innerText = "Error loading allowance.";
    }
};

const validatePhone = (number) => {
    // Regex for Nigerian phone numbers: Starts with 0, second digit is 7, 8, or 9, followed by 9 more digits
    return /^0[789][01]\d{8}$/.test(number);
};

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        // Strip non-numeric characters
        let val = e.target.value.replace(/\D/g, '');
        e.target.value = val;

        if (val.length > 0 && !validatePhone(val)) {
            phoneError.classList.remove('hidden');
            phoneInput.classList.add('border-red-500/50');
        } else {
            phoneError.classList.add('hidden');
            phoneInput.classList.remove('border-red-500/50');
        }
    });
}

const MIN_AMOUNT = 100;
const validateAmount = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < MIN_AMOUNT) {
        amountError.classList.remove('hidden');
        amountInput.classList.add('border-red-500/50');
        return false;
    } else {
        amountError.classList.add('hidden');
        amountInput.classList.remove('border-red-500/50');
        return true;
    }
};

if (amountInput) {
    amountInput.addEventListener('input', (e) => {
        // Ensure only numbers and handle min/max
        let val = e.target.value.replace(/\D/g, '');
        e.target.value = val;
        validateAmount(val);
    });
}

if (messageInput && messageCounter) {
    messageInput.addEventListener('input', (e) => {
        messageCounter.textContent = e.target.value.length;
    });
}

if (createWishForm) {
    createWishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = createWishForm.querySelector('button[type="submit"]');

        if (!isAuthenticated()) {
            showAlert("Please log in to make a wish", 'error');
            return;
        }
        
        const amount = Number(amountInput.value);
        try {
            const wishData = {
                type: document.getElementById('type').value,
                network: document.getElementById('network').value,
                category: document.getElementById('category')?.value || 'KINDNESS',
                total_amount: amount,
                phone: phoneInput.value.trim(),
                message: document.getElementById('message').value.trim(),
            };

            toggleLoading(btn, true, 'Submitting your wish...');
            await apiRequest('/wishes/', {
                method: 'POST',
                body: JSON.stringify(wishData)
            });
            
            showAlert("Wish created successfully! 💛", 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            console.error(error);
            showAlert("Failed to create wish. Please try again.", 'error');
        } finally {
            toggleLoading(btn, false);
        }
    });
}

// Filter click handler for Browse Page
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // UI Update: Toggle active classes
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active', 'bg-accent', 'text-primary-dark');
            b.classList.add('bg-[var(--card-bg)]');
        });
        btn.classList.add('active', 'bg-accent', 'text-primary-dark');
        btn.classList.remove('bg-[var(--card-bg)]');
        
        fetchAllWishes(btn.dataset.filter);
    });
});

// ====================== FETCH MY WISHES (Dashboard) ======================
export const fetchMyWishes = async () => {
    const container = document.getElementById('my-wishes-container');
    if (!container || !isAuthenticated()) { /* Optional: Redirect to login or show empty state if not authenticated */ return; }

    // Show shimmer placeholders
    container.innerHTML = `
        <div class="furni-card p-6 shimmer min-h-[140px]"></div>
        <div class="furni-card p-6 shimmer min-h-[140px]"></div>
    `;

    try {
        const wishes = await apiRequest('/wishes/mine/'); // Partner's Django API endpoint
        container.innerHTML = '';

        if (wishes.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-20 flex flex-col items-center">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-4">✨</div>
                    <p class="opacity-60 text-lg mb-6">You haven't made any wishes yet.</p>
                    <a href="create-wish.html" class="px-6 py-3 bg-accent text-primary-dark font-bold rounded-2xl hover:opacity-90 transition">
                        Make your first wish
                    </a>
                </div>`;
            return;
        }

        wishes.forEach(wish => {
            const progress = wish.total_amount > 0 ? (wish.amount_paid / wish.total_amount) * 100 : 0;

            container.innerHTML += `
                <div class="furni-card p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-xs uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full">${wish.type}</span>
                            <h3 class="text-xl font-semibold mt-3">${wish.network} - ₦${wish.total_amount}</h3>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="shareWish('${wish.id}', '${wish.type}', ${wish.total_amount})" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all">
                                <i class="fas fa-share-nodes text-xs"></i>
                            </button>
                            <span class="text-xs px-3 py-1 bg-white/20 rounded-full">${wish.status}</span>
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <div class="flex justify-between text-xs mb-1">
                            <span>₦${wish.amount_paid} raised</span>
                            <span>₦${wish.total_amount}</span>
                        </div>
                        <div class="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div class="bg-accent h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error fetching my wishes:", error);
    }
};

// ====================== FETCH ALL WISHES (Browse Page) ======================
export const fetchAllWishes = async (filter = 'ALL') => {
    // Look for either the browse container or the home page container
    const container = document.getElementById('browse-wishes-container') || document.getElementById('wishes-container');
    if (!container) return;

    // Show shimmer placeholders
    container.innerHTML = `
        <div class="furni-card p-6 shimmer min-h-[380px]"></div>
        <div class="furni-card p-6 shimmer min-h-[380px]"></div>
        <div class="furni-card p-6 shimmer min-h-[380px]"></div>
    `;

    try {
        const allWishes = await apiRequest('/wishes/'); // Partner's Django API endpoint
        container.innerHTML = '';
        
        const wishes = allWishes.filter(w => filter === 'ALL' || w.type === filter || (w.category || 'KINDNESS') === filter);

        if (wishes.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-24 flex flex-col items-center">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-4">🌙</div>
                    <p class="opacity-60 text-lg">No open wishes at the moment.</p>
                    <p class="text-sm opacity-40 mt-2">Check back later or post your own wish!</p>
                </div>`;
            return;
        }

        wishes.forEach(wish => {
            const progress = wish.total_amount > 0 ? (wish.amount_paid / wish.total_amount) * 100 : 0;

            container.innerHTML += `
                <div class="furni-card p-6 hover:scale-[1.02] transition-all duration-300">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 bg-accent text-primary-dark font-bold rounded-2xl flex items-center justify-center">
                                ${wish.network.substring(0,3)}
                            </div>
                            <div>
                                <p class="text-2xl font-bold">₦${wish.total_amount}</p>
                                <p class="text-sm opacity-70">${wish.type} • ${wish.network}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="shareWish('${wish.id}', '${wish.type}', ${wish.total_amount})" class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all text-accent">
                                <i class="fas fa-share-nodes"></i>
                            </button>
                            <span class="text-xs bg-white/20 px-3 py-1 rounded-full">${new Date(wish.created_at).toLocaleDateString('en-NG', {month:'short', day:'numeric'})}</span>
                        </div>
                    </div>

                    <p class="text-white/90 line-clamp-3 mb-6 min-h-[60px]">
                        ${wish.message || "No message provided."}
                    </p>

                    <div class="mb-5">
                        <div class="flex justify-between text-xs mb-1.5">
                            <span class="text-white/70">Raised</span>
                            <span class="font-medium">₦${wish.amount_paid} / ₦${wish.total_amount}</span>
                        </div>
                        <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div class="h-2 bg-accent rounded-full transition-all" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <button onclick="openGrantModal('${wish.id}', ${wish.remaining_amount}, '${wish.type}', '${wish.network}')" 
                            class="w-full bg-accent hover:opacity-90 text-primary-dark font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                        <i class="fas fa-heart"></i>
                        Grant This Wish
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error fetching wishes:", error);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) { // Only fetch user-specific data if logged in
        fetchMyWishes(); 
        updateWeeklyAllowance(); // Fetch allowance
    }
    fetchAllWishes('ALL'); // Always fetch public wishes
});