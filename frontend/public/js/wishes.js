import { apiRequest, showAlert, toggleLoading, triggerConfetti, isAuthenticated, shareWish, sanitize } from './utils.js';
import { ENDPOINTS, VALIDATION, FINANCIAL, WISH_CATEGORIES, DATA_PLANS, OCCASION_CONFIG, SUCCESS_MESSAGES, UI_CONFIG, DATE_CONFIG, STORAGE_KEYS, WISH_TYPES, NETWORKS, ERROR_MESSAGES, NETWORK_PREFIXES, NETWORK_NAME_MAP } from './constants.js';
import { dummyWishes } from './seed-data.js'; // Keep for dev mode if needed

// ====================== CREATE WISH ======================
const createWishForm = document.getElementById('create-wish-form');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phone-error');

const amountInput = document.getElementById('amount');
const amountError = document.getElementById('amount-error');
const typeSelect = document.getElementById('type-select');
const categorySelect = document.getElementById('category-select');
const networkSelect = document.getElementById('network-select');
const planSelect = document.getElementById('plan-select');
const planSection = document.getElementById('plan-section');
const amountSection = document.getElementById('amount-section');
const bypassValidationCheckbox = document.getElementById('bypass-validation');
const messageInput = document.getElementById('message');
const messageCounter = document.getElementById('message-counter');
const formTitle = document.getElementById('form-title');

const updateWeeklyAllowance = async () => {
    const display = document.getElementById('weekly-allowance-display');
    if (!display) return;

    try {
        const data = await apiRequest(ENDPOINTS.WISHES_ALLOWANCE);
        const remaining = data.remaining;
        const spent = FINANCIAL.WEEKLY_LIMIT - remaining;
        const percentage = (spent / FINANCIAL.WEEKLY_LIMIT) * 100;

        display.classList.remove('hidden');
        let html = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] uppercase tracking-wider font-bold text-[#667085]">Weekly Allowance Spent</span>
                <span class="text-xs font-bold text-[#1a1a1a]">₦${remaining.toLocaleString()} left</span>
            </div>
            <div class="w-full bg-[#f0f0f0] h-2.5 rounded-full overflow-hidden shadow-inner">
                <div class="bg-[#FACC15] h-full rounded-full transition-all duration-1000 ease-out" style="width: ${percentage}%"></div>
            </div>
        `;

        if (remaining < FINANCIAL.ALLOWANCE_WARNING_THRESHOLD && remaining >= FINANCIAL.MIN_AMOUNT) {
            html += `
                <div class="mt-3 flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100 animate-fade-in">
                    <i class="fas fa-circle-exclamation"></i>
                    <span>Running low! You have less than ₦${FINANCIAL.ALLOWANCE_WARNING_THRESHOLD.toLocaleString()} left this week.</span>
                </div>
            `;
        }

        display.innerHTML = html;

        if (remaining < FINANCIAL.MIN_AMOUNT && createWishForm) {
            const btn = createWishForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-lock mr-2"></i> Weekly Limit Reached`;
                createWishForm.querySelectorAll('input, select, textarea').forEach(input => input.disabled = true);
            }
        }
    } catch (error) {
        console.error("Error updating allowance:", error);
    }
};

const validatePhone = (number) => {
    return VALIDATION.NIGERIAN_PHONE_REGEX.test(number);
};

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        e.target.value = val;

        if (!bypassValidationCheckbox?.checked && val.length > 0 && !validatePhone(val)) {
            phoneError?.classList.remove('hidden');
            phoneInput.classList.add('border-red-500/50');
        } else {
            phoneError?.classList.add('hidden');
            phoneInput.classList.remove('border-red-500/50');
        }

        if (val.length >= 4 && validatePhone(val)) {
            const prefix = val.substring(0, 4);
            let detectedNetwork = null;
            for (const netKey in NETWORK_PREFIXES) {
                if (NETWORK_PREFIXES[netKey].includes(prefix)) {
                    detectedNetwork = netKey;
                    break;
                }
            }
            if (detectedNetwork && networkSelect && networkSelect.value !== detectedNetwork) {
                networkSelect.value = detectedNetwork;
                networkSelect.dispatchEvent(new Event('change'));
            }
        }
    });
}

const validateAmount = (amount) => {
    const numAmount = Number(amount);
    amountError?.classList.add('hidden');
    amountInput?.classList.remove('border-red-500/50');

    if (isNaN(numAmount) || numAmount < FINANCIAL.MIN_AMOUNT) {
        if (amountError) amountError.innerText = `Amount must be at least ₦${FINANCIAL.MIN_AMOUNT}`;
        amountError?.classList.remove('hidden');
        amountInput?.classList.add('border-red-500/50');
        return false;
    }

    if (numAmount > FINANCIAL.WEEKLY_LIMIT) {
        if (amountError) amountError.innerText = `Wish cannot exceed the ₦${FINANCIAL.WEEKLY_LIMIT} weekly limit`;
        amountError?.classList.remove('hidden');
        amountInput?.classList.add('border-red-500/50');
        return false;
    }
    return true;
};

if (amountInput) {
    amountInput.addEventListener('input', (e) => {
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

const populateCreateWishForm = () => {
    if (!typeSelect || !networkSelect || !planSelect) return;

    networkSelect.innerHTML = '<option value="">Select Network</option>';
    Object.values(NETWORKS).forEach(net => {
        const opt = document.createElement('option');
        opt.value = net === '9mobile' ? '9MOBILE' : net.toUpperCase();
        opt.textContent = net;
        networkSelect.appendChild(opt);
    });

    typeSelect.innerHTML = '<option value="">Select Type</option>';
    Object.values(WISH_TYPES).forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type.charAt(0) + type.slice(1).toLowerCase();
        typeSelect.appendChild(opt);
    });

    const updatePlans = () => {
        const network = networkSelect.value;
        const type = typeSelect.value;
        const submitBtn = createWishForm?.querySelector('button[type="submit"]');

        planSelect.innerHTML = '<option value="">Select Plan</option>';
        
        if (type === WISH_TYPES.DATA) {
            planSection?.classList.remove('hidden');
            amountSection?.classList.add('hidden');
            if (formTitle) formTitle.innerText = "Create a Wish";
            if (submitBtn) submitBtn.innerText = "Create Wish";

            if (network && DATA_PLANS[network]) {
                planSelect.disabled = false;
                DATA_PLANS[network].forEach((plan, index) => {
                    const opt = document.createElement('option');
                    opt.value = index;
                    opt.textContent = `${plan.plan} (${plan.validity}) - ₦${plan.amount_user}`;
                    planSelect.appendChild(opt);
                });
            }
        } else {
            planSection?.classList.add('hidden');
            amountSection?.classList.remove('hidden');
            if (formTitle) formTitle.innerText = "Create a Wish";
            if (submitBtn) submitBtn.innerText = "Create Wish";
        }
    };

    networkSelect.addEventListener('change', updatePlans);
    typeSelect.addEventListener('change', updatePlans);

    planSelect.addEventListener('change', () => {
        const network = networkSelect.value;
        const index = planSelect.value;
        if (network && index !== "") {
            const plan = DATA_PLANS[network][index];
            if (amountInput) amountInput.value = plan.amount_user;
        }
    });

    updatePlans();
};

if (createWishForm) {
    createWishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = createWishForm.querySelector('button[type="submit"]');
        if (!isAuthenticated()) { showAlert("Please log in to make a wish", 'error'); return; }
        
        const amount = Number(amountInput?.value || 0);
        const currentAllowance = await apiRequest(ENDPOINTS.WISHES_ALLOWANCE);
        
        if (currentAllowance.remaining < FINANCIAL.MIN_AMOUNT) {
            showAlert("You have reached your weekly wish limit.", 'error');
            return;
        } 
        
        if (typeSelect?.value === WISH_TYPES.AIRTIME) {
            if (!validateAmount(amount)) return;
        } else if (typeSelect?.value === WISH_TYPES.DATA && !planSelect?.value) {
            showAlert("Please select a data plan.", 'error');
            return;
        }

        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        try {
            const wishData = {
                type: typeSelect.value,
                network: networkSelect.value,
                category: WISH_CATEGORIES.KINDNESS,
                total_amount: amount,
                phone: phoneInput.value.trim(),
                message: messageInput?.value.trim() || '',
                user_id: userId
            };

            if (typeSelect.value === 'DATA' && planSelect.value !== '') {
                const selectedPlan = DATA_PLANS[networkSelect.value][parseInt(planSelect.value)];
                wishData.data_category = planSelect.value;
                wishData.service_id = selectedPlan.service_id;
                wishData.amount_api = selectedPlan.amount_api;
                wishData.total_amount = selectedPlan.amount_user;
            }

            toggleLoading(btn, true, 'Submitting...');
            await apiRequest(ENDPOINTS.WISHES, { method: 'POST', body: JSON.stringify(wishData) });
            showAlert(SUCCESS_MESSAGES.WISH_CREATED, 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        } catch (error) {
            showAlert("Failed to create wish.", 'error');
        } finally {
            toggleLoading(btn, false);
        }
    });
}

// ====================== BROWSE & DASHBOARD LOGIC ======================

// ====================== WISH RENDERING ======================
const getNetworkClass = (network) => {
    const net = String(network || '').toLowerCase();
    if (net.includes('mtn')) return 'network-mtn';
    if (net.includes('glo')) return 'network-glo';
    if (net.includes('airtel')) return 'network-airtel';
    if (net.includes('9mobile')) return 'network-9mobile';
    return 'bg-gray-100 text-gray-800';
};

const getNetworkIcon = (network) => {
    const net = String(network || '').toLowerCase();
    if (net.includes('mtn')) return 'fa-bolt';
    if (net.includes('glo')) return 'fa-leaf';
    if (net.includes('airtel')) return 'fa-signal';
    if (net.includes('9mobile')) return 'fa-wave-square';
    return 'fa-wifi';
};

const createWishCardHTML = (wish, isMine = false) => {
    const progress = (wish.amount_paid / wish.total_amount) * 100;
    const networkClass = getNetworkClass(wish.network);
    const networkIcon = getNetworkIcon(wish.network);
    
    return `
        <div class="furni-card p-6 mb-6 hover:scale-[1.02] transition-all stagger-item">
            <div class="flex justify-between items-start mb-4">
                <div class="wish-badge ${networkClass}">
                    <i class="fas ${networkIcon}"></i>
                    <span>${sanitize(wish.network)}</span>
                </div>
                <span class="wish-badge bg-gray-100 text-gray-600">
                    <i class="fas ${wish.type === 'DATA' ? 'fa-wifi' : 'fa-phone'}"></i>
                    ${sanitize(wish.type)}
                </span>
            </div>
            
            <div class="mb-4">
                <p class="text-3xl font-bold tracking-tight">₦${Number(wish.total_amount).toLocaleString()}</p>
                <p class="text-xs text-[#667085] font-medium mt-1">Requested by Anonymous</p>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            
            <div class="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                <span>Raised: ₦${Number(wish.amount_paid).toLocaleString()}</span>
                <span>${Math.round(progress)}%</span>
            </div>

            ${!isMine ? `
                <div class="wish-card-footer">
                    <button onclick="openGrantModal('${sanitize(wish.id)}', ${wish.remaining_amount}, '${sanitize(wish.type)}', '${sanitize(wish.network)}')" 
                            class="w-full bg-[#FACC15] text-[#1a1a1a] font-bold py-4 rounded-2xl hover:bg-[#eab308] transition-all btn-shimmer flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20">
                        <i class="fas fa-heart text-red-500"></i>
                        Grant this Wish
                    </button>
                </div>
            ` : `
                <div class="wish-card-footer flex justify-between items-center">
                    <span class="text-xs font-bold ${wish.status === 'OPEN' ? 'text-green-500' : 'text-blue-500'}">
                        <i class="fas ${wish.status === 'OPEN' ? 'fa-circle-dot' : 'fa-circle-check'} mr-1"></i>
                        ${sanitize(wish.status)}
                    </span>
                    <button onclick="shareWish('${sanitize(wish.id)}', '${sanitize(wish.type)}', ${wish.total_amount})" 
                            class="text-xs font-bold text-[#667085] hover:text-[#1a1a1a] transition-all flex items-center gap-1">
                        <i class="fas fa-share-nodes"></i> Share
                    </button>
                </div>
            `}
        </div>
    `;
};

export const fetchMyWishes = async () => {
    const container = document.getElementById('my-wishes-container');
    if (!container || !isAuthenticated()) return;
    container.innerHTML = getSkeletonCard().repeat(2);
    try {
        const wishes = await apiRequest(ENDPOINTS.WISHES_MINE);
        container.innerHTML = '';
        updateDashboardStats(wishes.length, null);
        if (wishes.length === 0) {
            container.innerHTML = `<div class="text-center py-20 opacity-60"><p>No wishes found.</p></div>`;
            return;
        }
        container.classList.add('stagger-in');
        let html = '';
        wishes.forEach(wish => {
            html += createWishCardHTML(wish, true);
        });
        container.innerHTML = html;
    } catch (error) { console.error(error); }
};

export const fetchAllWishes = async (filter = 'ALL') => {
    const container = document.getElementById('browse-wishes-container') || document.getElementById('wishes-container');
    if (!container) return;
    container.innerHTML = getSkeletonCard().repeat(3);
    try {
        // IMPROVEMENT: Use server-side filtering via query parameters
        const query = filter !== 'ALL' ? `?type=${filter}&status=OPEN` : '?status=OPEN';
        const wishes = await apiRequest(`${ENDPOINTS.WISHES}${query}`);
        
        container.innerHTML = '';
        if (wishes.length === 0) {
            container.innerHTML = '<p class="text-center py-20 col-span-full">No open wishes.</p>';
            return;
        }
        container.classList.add('stagger-in');
        let html = '';
        wishes.forEach(wish => {
            html += createWishCardHTML(wish, false);
        });
        container.innerHTML = html;
    } catch (error) { console.error(error); }
};

export const fetchMyGrants = async () => {
    const container = document.getElementById('transactions-container');
    if (!container || !isAuthenticated()) return;
    try {
        const grants = await apiRequest('/grants/mine');
        updateDashboardStats(null, grants.length);
        if (grants.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 opacity-60">
                    <p class="text-2xl mb-2">🤲</p>
                    <p>No grants yet. Start spreading kindness!</p>
                </div>
            `;
            return;
        }
        let html = '<div class="flex flex-col">';
        grants.forEach(g => {
            html += `
                <div class="flex items-center justify-between p-5 border-b border-[var(--card-border)] last:border-0 hover:bg-[#f9fafb] transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg">
                            <i class="fas fa-gift"></i>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-[#1a1a1a]">₦${Number(g.amount).toLocaleString()} Granted</p>
                            <p class="text-[10px] text-[#667085] uppercase font-bold tracking-wider mt-0.5">${sanitize(new Date(g.created_at).toLocaleDateString())}</p>
                        </div>
                    </div>
                    <div class="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                        SUCCESS
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (error) { console.error(error); }
};

const updateDashboardStats = (w, g) => {
    if (document.getElementById('stat-wishes') && w !== null) document.getElementById('stat-wishes').innerText = w;
    if (document.getElementById('stat-granted') && g !== null) document.getElementById('stat-granted').innerText = g;
};

const getSkeletonCard = () => `<div class="furni-card p-6 shimmer mb-4"><div class="h-20 bg-gray-100 rounded-xl"></div></div>`;

const initPullToRefresh = () => { /* Simplified for brevity */ };

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        fetchMyWishes(); 
        fetchMyGrants();
        updateWeeklyAllowance();
    }
    fetchAllWishes('ALL');
    initPullToRefresh();
    if (createWishForm) {
        populateCreateWishForm();
    }
});
