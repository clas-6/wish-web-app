import { auth, db, showAlert, toggleLoading } from './utils.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ====================== CREATE WISH ======================
const createWishForm = document.getElementById('create-wish-form');

if (createWishForm) {
    createWishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = createWishForm.querySelector('button[type="submit"]');
        const user = auth.currentUser;

        if (!user) {
            showAlert("Please log in to make a wish", 'error');
            return;
        }

        const wishData = {
            uid: user.uid,
            type: document.getElementById('type').value,
            network: document.getElementById('network').value,
            category: document.getElementById('category')?.value || 'KINDNESS',
            total_amount: Number(document.getElementById('amount').value),
            amount_paid: 0,
            remaining_amount: Number(document.getElementById('amount').value),
            phone: document.getElementById('phone').value.trim(),
            message: document.getElementById('message').value.trim(),
            status: 'OPEN',
            created_at: serverTimestamp()
        };

        try {
            toggleLoading(btn, true, 'Submitting your wish...');
            
            await addDoc(collection(db, 'wishes'), wishData);
            
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

// ====================== FETCH MY WISHES (Dashboard) ======================
export const fetchMyWishes = async () => {
    const container = document.getElementById('my-wishes-container');
    const user = auth.currentUser;
    if (!container || !user) return;

    // Show shimmer placeholders
    container.innerHTML = `
        <div class="furni-card p-6 shimmer min-h-[140px]"></div>
        <div class="furni-card p-6 shimmer min-h-[140px]"></div>
    `;

    try {
        const q = query(
            collection(db, 'wishes'),
            where('uid', '==', user.uid),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);
        container.innerHTML = '';

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 opacity-60">
                    You haven't made any wishes yet.<br>
                    <a href="create-wish.html" class="text-accent underline">Make your first wish</a>
                </div>`;
            return;
        }

        snapshot.forEach(doc => {
            const wish = doc.data();
            const progress = wish.total_amount > 0 ? (wish.amount_paid / wish.total_amount) * 100 : 0;

            container.innerHTML += `
                <div class="furni-card p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-xs uppercase tracking-widest px-3 py-1 bg-[var(--card-border)] rounded-full">${wish.type}</span>
                            <h3 class="text-xl font-semibold mt-3">${wish.network} - ₦${wish.total_amount}</h3>
                        </div>
                        <span class="text-xs px-3 py-1 bg-[var(--card-border)] rounded-full">${wish.status}</span>
                    </div>
                    
                    <div class="mt-6">
                        <div class="flex justify-between text-xs mb-1">
                            <span>₦${wish.amount_paid} raised</span>
                            <span>₦${wish.total_amount}</span>
                        </div>
                        <div class="w-full bg-[var(--card-border)] h-2 rounded-full overflow-hidden">
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
    const container = document.getElementById('browse-wishes-container');
    if (!container) return;

    // Show shimmer placeholders
    container.innerHTML = `
        <div class="furni-card p-6 shimmer min-h-[380px]"></div>
        <div class="furni-card p-6 shimmer min-h-[380px]"></div>
        <div class="furni-card p-6 shimmer min-h-[380px]"></div>
    `;

    try {
        const q = query(
            collection(db, 'wishes'),
            where('status', 'in', ['OPEN', 'PARTIALLY_FULFILLED']),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);
        container.innerHTML = '';

        let wishes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (filter === 'ALL' || 
                (filter === data.type) || 
                (filter === (data.category || 'KINDNESS'))) {
                wishes.push({ id: doc.id, ...data });
            }
        });

        if (wishes.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 opacity-60">No open wishes at the moment.</div>`;
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
                        <span class="text-xs bg-[var(--card-border)] px-3 py-1 rounded-full">${new Date(wish.created_at?.toDate()).toLocaleDateString('en-NG', {month:'short', day:'numeric'})}</span>
                    </div>

                    <p class="opacity-90 line-clamp-3 mb-6 min-h-[60px]">
                        ${wish.message || "No message provided."}
                    </p>

                    <div class="mb-5">
                        <div class="flex justify-between text-xs mb-1.5">
                            <span class="opacity-70">Raised</span>
                            <span class="font-medium">₦${wish.amount_paid} / ₦${wish.total_amount}</span>
                        </div>
                        <div class="h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
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

// Auto fetch when user is logged in
auth.onAuthStateChanged(user => {
    if (user) {
        fetchMyWishes();
    }
    fetchAllWishes('ALL');
});