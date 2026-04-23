import { apiRequest, showAlert, toggleLoading, triggerConfetti, isAuthenticated } from './utils.js';
import { ENDPOINTS, VALIDATION, FINANCIAL, WISH_CATEGORIES, SUCCESS_MESSAGES, UI_CONFIG, DATE_CONFIG } from './constants.js';
import { dummyWishes } from './seed-data.js';

// ====================== CREATE WISH ======================
const createWishForm = document.getElementById('create-wish-form');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phone-error');

const amountInput = document.getElementById('amount');
const amountError = document.getElementById('amount-error');
const messageInput = document.getElementById('message');
const messageCounter = document.getElementById('message-counter');

const updateWeeklyAllowance = async () => {
    const display = document.getElementById('weekly-allowance-display');
    if (!display) return;

    try {
        // Fetch remaining allowance from Django backend
        display.classList.remove('hidden');
        const data = await apiRequest(ENDPOINTS.WISHES_ALLOWANCE); // Partner's Django API endpoint
        const remaining = data.remaining;
        display.innerHTML = `Weekly Remaining: <span class="font-bold text-accent">₦${remaining.toLocaleString()}</span> / ₦${FINANCIAL.WEEKLY_LIMIT.toLocaleString()}`;
    } catch (error) {
        console.error("Error updating allowance:", error);
        display.innerText = "Error loading allowance.";
    }
};

const validatePhone = (number) => {
    return VALIDATION.NIGERIAN_PHONE_REGEX.test(number);
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

const validateAmount = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < FINANCIAL.MIN_AMOUNT) {
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
                category: document.getElementById('category')?.value || WISH_CATEGORIES.KINDNESS,
                total_amount: amount,
                phone: phoneInput.value.trim(),
                message: document.getElementById('message').value.trim(),
            };

            toggleLoading(btn, true, 'Submitting your wish...');
            await apiRequest(ENDPOINTS.WISHES, {
                method: 'POST',
                body: JSON.stringify(wishData)
            });
            
            showAlert(SUCCESS_MESSAGES.WISH_CREATED, 'success');
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

    const shimmerCard = `
        <div class="furni-card p-6 shimmer">
            <div class="flex justify-between items-start mb-4">
                <div class="w-20 h-6 bg-[var(--card-border)] rounded-full opacity-20"></div>
                <div class="w-8 h-8 bg-[var(--card-border)] rounded-full opacity-20"></div>
            </div>
            <div class="h-6 bg-[var(--card-border)] rounded w-1/2 mb-4 opacity-20"></div>
            <div class="h-2 bg-[var(--card-border)] rounded-full w-full mt-6 opacity-20"></div>
        </div>
    `;

    // Show shimmer placeholders
    container.innerHTML = `
        ${shimmerCard}
        ${shimmerCard}
    `;

    try {
        let wishes = [];
        
        if (location.hostname === "localhost") {
            // Local Simulation: Try to fetch, if fails, show nothing instead of shimmer forever
            try {
                wishes = await apiRequest(ENDPOINTS.WISHES_MINE);
            } catch (e) {
                console.warn("Dev Mode: Django API unreachable. Showing mock 'My Wishes'.");
                // Filter dummy wishes to simulate "mine"
                wishes = dummyWishes.slice(0, 1); 
            }
        } else {
            wishes = await apiRequest(ENDPOINTS.WISHES_MINE);
        }

        // Update Dashboard Stats
        const statWishes = document.getElementById('stat-wishes');
        const wishCount = document.getElementById('wish-count');
        
        container.innerHTML = '';
        if (statWishes) statWishes.innerText = wishes.length;
        if (wishCount) wishCount.innerText = `${wishes.length} wishes`;

        if (wishes.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-20 px-6 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--card-border)] text-center flex flex-col items-center">
                    <div class="w-24 h-24 bg-accent/5 text-accent rounded-full flex items-center justify-center text-5xl mb-6 animate-pulse">
                        <i class="fas fa-sparkles"></i>
                    </div>
                    <h3 class="text-2xl font-semibold mb-2 text-inherit">No wishes found</h3>
                    <p class="opacity-60 text-lg mb-8 max-w-md">You haven't made any wishes yet. Start by asking for something small and quiet.</p>
                    <a href="create-wish.html" class="px-8 py-4 bg-accent text-primary-dark font-bold rounded-2xl hover:scale-105 transition-transform">
                        Create Your First Wish
                    </a>
                </div>`;
            return;
        }

        let html = '';
        wishes.forEach(wish => {
            const progress = wish.total_amount > 0 ? (wish.amount_paid / wish.total_amount) * 100 : 0;

            html += `
                <div class="furni-card p-6 animate-fade-in">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-xs uppercase tracking-widest px-3 py-1 bg-[var(--card-border)] rounded-full">${wish.type}</span>
                            <h3 class="text-xl font-semibold mt-3">${wish.network} - ₦${wish.total_amount}</h3>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="shareWish('${wish.id}', '${wish.type}', ${wish.total_amount})" class="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-border)] hover:opacity-80 transition-all">
                                <i class="fas fa-share-nodes text-xs"></i>
                            </button>
                            <span class="text-xs px-3 py-1 bg-[var(--card-border)] rounded-full">${wish.status}</span>
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <div class="flex justify-between text-xs mb-1">
                            <span>₦${wish.amount_paid} raised</span>
                            <span>₦${wish.total_amount}</span>
                        </div>
                        <div class="w-full bg-[var(--card-border)] h-2 rounded-full overflow-hidden">
                            <div class="bg-accent h-full rounded-full transition-all" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error("Error fetching my wishes:", error);
    }
};

// ====================== FETCH ALL WISHES (Browse Page) ======================
export const fetchAllWishes = async (filter = 'ALL') => {
    // Look for either the browse container or the home page container
    const container = document.getElementById('browse-wishes-container') || document.getElementById('wishes-container');
    if (!container) return;

    const shimmerCard = `
        <div class="furni-card p-6 shimmer">
            <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-3 w-full">
                    <div class="w-11 h-11 bg-[var(--card-border)] rounded-2xl opacity-20"></div>
                    <div class="space-y-2 flex-1">
                        <div class="h-6 bg-[var(--card-border)] rounded w-1/3 opacity-20"></div>
                        <div class="h-4 bg-[var(--card-border)] rounded w-1/4 opacity-20"></div>
                    </div>
                </div>
            </div>
            <div class="h-4 bg-[var(--card-border)] rounded w-full mb-2 opacity-20"></div>
            <div class="h-4 bg-[var(--card-border)] rounded w-2/3 mb-10 opacity-20"></div>
            <div class="h-2 bg-[var(--card-border)] rounded-full w-full mb-8 opacity-20"></div>
            <div class="h-14 bg-[var(--card-border)] rounded-2xl w-full opacity-20"></div>
        </div>
    `;

    // Show shimmer placeholders
    container.innerHTML = shimmerCard.repeat(3);

    try {
        let allWishes = [];
        
        if (location.hostname === "localhost") {
            try {
                allWishes = await apiRequest(ENDPOINTS.WISHES);
            } catch (e) {
                console.warn("Dev Mode: Django API unreachable. Using seed-data.js for preview.");
                allWishes = dummyWishes;
            }
        } else {
            allWishes = await apiRequest(ENDPOINTS.WISHES);
        }

        const wishes = allWishes.filter(w => filter === 'ALL' || w.type === filter || (w.category || 'KINDNESS') === filter);

        if (wishes.length === 0) {
            const emptyMsg = filter === 'ALL' 
                ? "The community is quiet right now. Every wish has been granted." 
                : `No wishes found for "${filter.toLowerCase()}".`;
            
            container.innerHTML = `
                <div class="col-span-full py-32 px-6 rounded-[3rem] bg-[var(--card-bg)] border border-[var(--card-border)] text-center flex flex-col items-center">
                    <div class="w-28 h-28 bg-[var(--card-border)] rounded-[2rem] flex items-center justify-center text-6xl mb-8 opacity-20">
                        <i class="fas fa-moon"></i>
                    </div>
                    <h2 class="text-3xl font-semibold mb-3 text-inherit">All wishes granted</h2>
                    <p class="opacity-60 text-xl max-w-lg">${emptyMsg}</p>
                </div>`;
            return;
        }

        let html = '';
        wishes.forEach(wish => {
            const progress = wish.total_amount > 0 ? (wish.amount_paid / wish.total_amount) * 100 : 0;
            const wishDate = wish.created_at ? new Date(wish.created_at) : new Date();

            html += `
                <div class="furni-card p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in">
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
                            <span class="text-xs bg-[var(--card-border)] px-3 py-1 rounded-full">${wishDate.toLocaleDateString(DATE_CONFIG.LOCALE, DATE_CONFIG.SHORT_DATE_FORMAT)}</span>
                        </div>
                    </div>

                    <p class="opacity-90 line-clamp-3 mb-6 min-h-[60px] text-inherit">
                        ${wish.message || "No message provided."}
                    </p>

                    <div class="mb-5">
                        <div class="flex justify-between text-xs mb-1.5">
                            <span class="text-white/70">Raised</span>
                            <span class="font-medium">₦${wish.amount_paid} / ₦${wish.total_amount}</span>
                        </div>
                        <div class="h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                            <div class="h-full bg-accent rounded-full transition-all" style="width: ${progress}%"></div>
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
        container.innerHTML = html;
    } catch (error) {
        console.error("Error fetching wishes:", error);
    }
};

// ====================== PULL TO REFRESH LOGIC ======================
const initPullToRefresh = () => {
    const scrollContainer = document.getElementById('browse-wishes-container') || 
                          document.getElementById('wishes-container') ||
                          document.getElementById('my-wishes-container');
    
    if (!scrollContainer) return;

    let startY = 0;
    let isPulling = false;
    
    // Create and inject indicator
    const indicator = document.createElement('div');
    indicator.id = 'pull-indicator';
    indicator.className = 'fixed left-1/2 -translate-x-1/2 flex items-center justify-center z-40 pointer-events-none opacity-0 transition-opacity duration-200';
    indicator.style.top = '70px'; // Adjust based on your navbar height
    indicator.innerHTML = `
        <div class="bg-accent text-primary-dark w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-100">
            <i class="fas fa-arrow-down"></i>
        </div>
    `;
    document.body.appendChild(indicator);

    window.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].pageY;
            isPulling = true;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;

        if (diff > 0 && window.scrollY === 0) {
            const pullDistance = Math.min(diff * UI_CONFIG.PULL_RESISTANCE, UI_CONFIG.PULL_THRESHOLD + 20);
            indicator.style.opacity = Math.min(pullDistance / UI_CONFIG.PULL_THRESHOLD, 1);
            indicator.querySelector('div').style.transform = `translateY(${pullDistance}px) rotate(${pullDistance * 2}deg)`;
            
            const icon = indicator.querySelector('i');
            if (pullDistance >= UI_CONFIG.PULL_THRESHOLD) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        }
    }, { passive: true });

    window.addEventListener('touchend', async () => {
        if (!isPulling) return;
        isPulling = false;

        const icon = indicator.querySelector('i');
        const div = indicator.querySelector('div');

        if (parseFloat(indicator.style.opacity) >= 1) {
            icon.className = 'fas fa-sync fa-spin';
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'ALL';
            await fetchAllWishes(activeFilter);
        }

        // Reset UI
        indicator.style.opacity = '0';
        div.style.transform = 'translateY(0) rotate(0deg)';
        setTimeout(() => { icon.className = 'fas fa-arrow-down'; }, 200);
    });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) { // Only fetch user-specific data if logged in
        fetchMyWishes(); 
        updateWeeklyAllowance(); // Fetch allowance
    }
    fetchAllWishes('ALL'); // Always fetch public wishes
    initPullToRefresh();
});