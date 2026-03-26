import { auth, db, showAlert, toggleLoading } from './utils.js';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Create Wish
const createWishForm = document.getElementById('create-wish-form');
if (createWishForm) {
    createWishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = createWishForm.querySelector('button');
        const user = auth.currentUser;

        if (!user) return showAlert("You must be logged in", 'error');

        const wishData = {
            uid: user.uid,
            type: document.getElementById('type').value,
            network: document.getElementById('network').value,
            category: document.getElementById('category') ? document.getElementById('category').value : 'KINDNESS',
            total_amount: Number(document.getElementById('amount').value),
            amount_paid: 0,
            remaining_amount: Number(document.getElementById('amount').value),
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
            status: 'OPEN',
            created_at: serverTimestamp()
        };

        try {
            toggleLoading(btn, true, 'Submitting Wish...');
            await addDoc(collection(db, 'wishes'), wishData);
            showAlert("Wish created successfully!", 'success');
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            toggleLoading(btn, false);
        }
    });
}

// Fetch My Wishes (Dashboard)
export const fetchMyWishes = async () => {
    const container = document.getElementById('my-wishes-container');
    const user = auth.currentUser;
    if (!container || !user) return;

    try {
        const q = query(
            collection(db, 'wishes'),
            where('uid', '==', user.uid),
            orderBy('created_at', 'desc')
        );
        const snapshot = await getDocs(q);
        
        container.innerHTML = '';
        document.getElementById('stat-wishes').innerText = snapshot.size;
        document.getElementById('wish-count').innerText = `${snapshot.size} total`;

        if (snapshot.empty) {
            container.innerHTML = '<div class="p-12 text-center text-gray-500">No wishes yet.</div>';
            return;
        }

        snapshot.forEach(doc => {
            const wish = doc.data();
            const progress = (wish.amount_paid / wish.total_amount) * 100;
            
            container.innerHTML += `
                <div class="p-6 hover:bg-[#F9F5EE] transition">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="text-[10px] font-medium px-2 py-1 rounded-full bg-[#F9F5EE] border border-[#E0D5C5]/80 uppercase tracking-wide">${wish.type}</span>
                            <h3 class="text-base font-semibold mt-2">${wish.network} - ₦${wish.total_amount}</h3>
                        </div>
                        <span class="text-xs font-medium text-[#7A7A7A]">${wish.status}</span>
                    </div>
                    <div class="w-full bg-[#dbeafe] rounded-full h-2 mb-2">
                        <div class="bg-[#2563eb] h-2 rounded-full" style="width: ${progress}%"></div>
                    </div>
                    <p class="text-xs text-[#7A7A7A]">₦${wish.amount_paid} raised of ₦${wish.total_amount}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error fetching wishes:", error);
    }
};

// Fetch All Wishes (Browse)
export const fetchAllWishes = async (filter = 'ALL') => {
    const container = document.getElementById('browse-wishes-container');
    if (!container) return;

    try {
        let q = query(
            collection(db, 'wishes'),
            where('status', 'in', ['OPEN', 'PARTIALLY_FULFILLED']),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);
        container.innerHTML = '';

        const wishes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (filter === 'ALL') {
                wishes.push({ id: doc.id, ...data });
            } else if (filter === 'AIRTIME' || filter === 'DATA') {
                if (data.type === filter) wishes.push({ id: doc.id, ...data });
            } else if (filter === 'FESTIVE' || filter === 'KINDNESS') {
                if ((data.category || 'KINDNESS') === filter) wishes.push({ id: doc.id, ...data });
            }
        });

        if (wishes.length === 0) {
            container.innerHTML = '<div class="col-span-full p-20 text-center text-gray-500">No wishes found.</div>';
            return;
        }

        wishes.forEach(wish => {
            const progress = (wish.amount_paid / wish.total_amount) * 100;
            container.innerHTML += `
                <div class="bg-white rounded-2xl p-6 border border-[#bfdbfe] hover:bg-[#eff6ff] transition">
                    <div class="flex justify-between items-start mb-3">
                        <div class="space-y-1">
                            <span class="text-[10px] font-medium px-2 py-1 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] uppercase tracking-wide">${wish.type}</span>
                            <span class="inline-block text-[10px] px-2 py-1 rounded-full bg-[#fefce8] text-[#854d0e] border border-[#facc15]/60">${wish.category || 'KINDNESS'}</span>
                        </div>
                        <span class="text-[10px] text-[#7A7A7A]">${wish.created_at?.toDate ? new Date(wish.created_at.toDate()).toLocaleDateString() : ''}</span>
                    </div>
                    <h3 class="text-base font-semibold mb-1">${wish.network} ${wish.type === 'DATA' ? 'Data' : 'Airtime'}</h3>
                    <p class="text-sm text-[#7A7A7A] mb-5 line-clamp-2">${wish.message || 'No message provided.'}</p>
                    
                    <div class="mb-6">
                        <div class="flex justify-between text-xs mb-2">
                            <span class="font-medium">₦${wish.amount_paid} <span class="text-[#7A7A7A]">raised</span></span>
                            <span class="font-medium text-[#2E2E2E]">₦${wish.total_amount}</span>
                        </div>
                        <div class="w-full bg-[#dbeafe] rounded-full h-2">
                            <div class="bg-[#2563eb] h-2 rounded-full" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <button onclick="openGrantModal('${wish.id}', ${wish.remaining_amount}, '${wish.type}', '${wish.network}')" 
                            class="w-full bg-[#2563eb] text-white py-3 rounded-full text-sm font-medium hover:bg-[#1d4ed8] transition-colors">
                        Grant wish
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error fetching wishes:", error);
    }
};

// Initial fetches
auth.onAuthStateChanged(user => {
    if (user) {
        fetchMyWishes();
    }
    fetchAllWishes();
});

// Filter logic
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-[#2563eb]', 'text-white'));
        e.target.classList.add('active', 'bg-[#2563eb]', 'text-white');
        fetchAllWishes(e.target.dataset.filter);
    });
});
