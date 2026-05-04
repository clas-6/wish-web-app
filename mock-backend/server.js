const express = require("express");
const cors = require("cors");
const app = express();

// Data Plans (Hardcoded in mock server for self-containment)
const DATA_PLANS = {
    MTN: [
        {
          plan: '1GB', type: 'SHARE', service_id: 240,
          amount_user: 450, amount_reseller: 440, amount_api: 420, validity: '7 Days'
        },
        {
          plan: '5GB', type: 'SHARE', service_id: 101,
          amount_user: 1850, amount_reseller: 1830, amount_api: 1790, validity: '30 Days'
        },
        {
          plan: '3GB', type: 'SHARE', service_id: 100,
          amount_user: 1450, amount_reseller: 1420, amount_api: 1370, validity: '30 Days'
        },
        {
          plan: '2GB', type: 'SHARE', service_id: 99,
          amount_user: 980, amount_reseller: 970, amount_api: 950, validity: '30 Days'
        },
        {
          plan: '500MB', type: 'SHARE', service_id: 97,
          amount_user: 330, amount_reseller: 320, amount_api: 300, validity: '7 Days'
        },
        {
          plan: '2GB', type: 'SHARE', service_id: 265,
          amount_user: 870, amount_reseller: 860, amount_api: 840, validity: '7 Days'
        }
    ],
    AIRTEL: [
        {
          plan: '1GB', type: 'DIRECT', service_id: 331,
          amount_user: 789, amount_reseller: 787, amount_api: 784, validity: '7 Days'
        },
        {
          plan: '3GB', type: 'DIRECT', service_id: 341,
          amount_user: 986, amount_reseller: 985, amount_api: 980, validity: '2 Days'
        },
        {
          plan: '3GB', type: 'AWOOF', service_id: 320,
          amount_user: 1050, amount_reseller: 1040, amount_api: 1030, validity: '2 Days'
        },
        {
          plan: '3.5 GB', type: 'DIRECT', service_id: 310,
          amount_user: 1479, amount_reseller: 1476, amount_api: 1470, validity: '7 Days'
        }
    ],
    GLO: [
        {
          plan: '1GB', type: 'CG', service_id: 409,
          amount_user: 285, amount_reseller: 283, amount_api: 280, validity: '3 Days'
        },
        {
          plan: '3GB', type: 'CG', service_id: 410,
          amount_user: 850, amount_reseller: 845, amount_api: 835, validity: '3 Days'
        },
        {
          plan: '5GB', type: 'CG', service_id: 411,
          amount_user: 1425, amount_reseller: 1410, amount_api: 1395, validity: '3 Days'
        },
        {
          plan: '1GB', type: 'CG', service_id: 412,
          amount_user: 340, amount_reseller: 335, amount_api: 330, validity: '7 Days'
        },
        {
          plan: '3GB', type: 'CG', service_id: 413,
          amount_user: 1020, amount_reseller: 1000, amount_api: 980, validity: '7 Days'
        }
    ],
    "9MOBILE": [
        {
          plan: '500MB', type: 'CG', service_id: 68,
          amount_user: 260, amount_reseller: 257, amount_api: 255, validity: '30 Days'
        },
        {
          plan: '1GB', type: 'CG', service_id: 69,
          amount_user: 500, amount_reseller: 495, amount_api: 490, validity: '30 Days'
        },
        {
          plan: '2GB', type: 'CG', service_id: 71,
          amount_user: 1000, amount_reseller: 990, amount_api: 980, validity: '30 Days'
        }
    ]
};

app.use(express.json());
app.use(cors());

// In-memory storage (cleared on server restart)
let users = [];
let wishes = [];
let grants = [];
let clients = [];

// --- AUTHENTICATION ---

// Register: POST /api/users/register
app.post("/api/users/register", (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ detail: "User already exists" });
    
    const newUser = { id: Date.now(), email, password };
    users.push(newUser);
    console.log(`👤 User Registered: ${email}`);
    res.json({ message: "Registration successful" });
});

// Login (Token): POST /api/users/token
app.post("/api/users/token", (req, res) => {
    const { username, password } = req.body; 
    const user = users.find(u => u.email === username && u.password === password);
    
    if (!user) return res.status(401).json({ detail: "Invalid email or password" });

    console.log(`🔑 User Logged In: ${username}`);
    res.json({
        user_id: user.id,
        access_token: `mock_jwt_token_${user.id}`,
        token_type: "bearer"
    });
});

// Helper to get user ID from token (mock implementation)
const getUserIdFromToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]; // Get the token part
        if (token.startsWith('mock_jwt_token_')) {
            return token.split('mock_jwt_token_')[1]; // Extract user ID
        }
    }
    return null;
};

// Helper to calculate remaining weekly allowance
const getRemainingAllowance = (userId) => {
    const WEEKLY_LIMIT = 5000;
    const userWishes = wishes.filter(w => String(w.user_id) === String(userId));
    const spent = userWishes.reduce((sum, w) => sum + (Number(w.total_amount) || 0), 0);
    return Math.max(0, WEEKLY_LIMIT - spent);
};

// --- WISHES ---

// Real-time Events (SSE)
app.get("/api/events", (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    clients.push(res);
    req.on('close', () => {
        clients = clients.filter(c => c !== res);
    });
});

const broadcast = (data) => {
    clients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
};

// Get All Wishes: GET /api/wishes
app.get("/api/wishes", (req, res) => {
    const { type, status } = req.query;
    let filteredWishes = [...wishes];

    if (type && type !== 'ALL') {
        filteredWishes = filteredWishes.filter(w => w.type === type);
    }
    if (status) {
        filteredWishes = filteredWishes.filter(w => w.status === status);
    }

    res.json(filteredWishes);
});

// Create Wish: POST /api/wishes
app.post("/api/wishes", (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ detail: "Unauthorized" });

    const amount = Number(req.body.total_amount);
    const remaining = getRemainingAllowance(userId);

    // For data plans, ensure total_amount matches the plan's user amount
    if (req.body.type === 'DATA' && req.body.network && req.body.data_category !== undefined && DATA_PLANS[req.body.network]) {
        const selectedPlan = DATA_PLANS[req.body.network][parseInt(req.body.data_category)];
        if (!selectedPlan || amount !== selectedPlan.amount_user) {
            return res.status(400).json({ detail: "Data plan amount mismatch." });
        }
    }
    if (amount > remaining) {
        return res.status(400).json({ detail: `Wish exceeds your remaining weekly allowance of ₦${remaining}` });
    }

    const wish = {
        ...req.body,
        id: Math.random().toString(36).substr(2, 9),
        user_id: userId,
        amount_paid: 0,
        remaining_amount: req.body.total_amount,
        service_id: req.body.service_id || null, // Store service ID for data plans
        amount_api: req.body.amount_api || null,   // Store API cost for data plans
        status: "OPEN",
        created_at: new Date().toISOString()
    };
    wishes.push(wish);
    console.log(`✨ Wish Created: ${wish.type} ₦${wish.total_amount} by User ${userId}`);
    res.json(wish);
});

// Get My Wishes: GET /api/wishes/mine
app.get("/api/wishes/mine", (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ detail: "Unauthorized" });
    const myWishes = wishes.filter(w => String(w.user_id) === String(userId));
    res.json(myWishes);
});

// Allowance: GET /api/wishes/allowance
app.get("/api/wishes/allowance", (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ detail: "Unauthorized" });
    res.json({ remaining: getRemainingAllowance(userId) });
});

// --- GRANTS & VTU SIMULATION ---

app.post("/api/grants/initialize", (req, res) => {
    const { wish_id, amount, granter_id } = req.body;
    if (!granter_id) return res.status(401).json({ detail: "Granter ID missing" });

    const wish = wishes.find(w => w.id === wish_id);
    if (!wish) return res.status(404).json({ detail: "Wish not found" });

    console.log(`💳 Initializing Payment for Wish: ${wish_id} by Granter ${granter_id}`);
    
    const newGrant = {
        id: Math.random().toString(36).substr(2, 9),
        wish_id: wish_id,
        granter_id: granter_id,
        amount: amount,
        status: "SUCCESS",
        created_at: new Date().toISOString()
    };
    grants.push(newGrant);

    // Update wish status to processing immediately
    wish.status = "PROCESSING";
    broadcast({ type: 'REFRESH_DATA', message: 'VTU Processing Started' });

    // Simulate Paystack Redirect (redirect back to dashboard with success status)
    res.json({ authorization_url: `dashboard.html?status=success&reference=mock_trx_${newGrant.id}&granter_id=${granter_id}` });

    // Simulate Background Processing
    setTimeout(() => {
        console.log(`📡 Simulating VTU Fulfillment for ${wish.phone}...`);
        
        setTimeout(() => {
            // Use amount_api for data wishes, otherwise use the granted amount
            const actualVtuAmount = wish.type === 'DATA' && wish.amount_api ? wish.amount_api : amount;

            const success = Math.random() > 0.1; // 90% success rate
            if (success) {
                wish.amount_paid += amount; // User-facing amount granted
                wish.remaining_amount -= amount;
                wish.status = wish.remaining_amount <= 0 ? "FULFILLED" : "PARTIALLY_FULFILLED";
                newGrant.status = "SUCCESS";
                console.log("✅ VTU SUCCESS");
                broadcast({ type: 'REFRESH_DATA', message: 'VTU Fulfilled' });
            } else {
                // If VTU fails, revert wish status to its previous state
                wish.status = wish.amount_paid > 0 ? "PARTIALLY_FULFILLED" : "OPEN";
                console.log("❌ VTU FAILED");
                newGrant.status = "FAILED";
                broadcast({ type: 'REFRESH_DATA', message: 'VTU Failed' });
            }
        }, 2000);
    }, 3000);
});

// Get My Grants: GET /api/grants/mine
app.get("/api/grants/mine", (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ detail: "Unauthorized" });
    const myGrants = grants.filter(g => String(g.granter_id) === String(userId));
    res.json(myGrants);
});

// Get Received Grants: GET /api/transactions/received
app.get("/api/transactions/received", (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ detail: "Unauthorized" });
    
    const myWishIds = wishes.filter(w => String(w.user_id) === String(userId)).map(w => w.id);
    const received = grants.filter(g => myWishIds.includes(g.wish_id));
    res.json(received);
});

// Verify Payment: GET /api/grants/verify/:reference
app.get("/api/grants/verify/:reference", (req, res) => {
    const { reference } = req.params;
    console.log(`🔍 Verifying Payment Reference: ${reference}`);
    
    // In our mock, if the reference starts with 'mock_trx_', it's valid
    if (reference && reference.startsWith('mock_trx_')) {
        res.json({ status: "success", message: "Payment verified" });
    } else {
        res.status(400).json({ status: "error", message: "Invalid payment reference" });
    }
});

// --- TESTING UTILITIES ---
app.post("/api/testing/clear", (req, res) => {
    wishes = [];
    grants = [];
    users = []; // Optionally clear users too
    
    console.log("🔥 All wishes, grants, and users cleared for testing.");
    // Notify all connected clients to refresh UI
    broadcast({ type: 'REFRESH_DATA', message: 'System Reset' });
    
    res.status(200).json({ message: "All data cleared." });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Mock Backend running at http://localhost:${PORT}/api`);
});