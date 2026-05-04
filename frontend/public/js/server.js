const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// In-memory storage (cleared on server restart)
let users = [];
let wishes = [
    {
        id: "1",
        type: "AIRTIME",
        network: "MTN",
        category: "KINDNESS",
        total_amount: 500,
        amount_paid: 0,
        remaining_amount: 500,
        phone: "08011112222",
        message: "Initial mock wish",
        status: "OPEN",
        created_at: new Date().toISOString()
    }
];
let grants = [];

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
    const { username, password } = req.body; // username is the email per frontend logic
    const user = users.find(u => u.email === username && u.password === password);
    
    if (!user) return res.status(401).json({ detail: "Invalid email or password" });

    console.log(`🔑 User Logged In: ${username}`);
    res.json({
        user_id: user.id,
        access_token: `mock_jwt_token_${user.id}`,
        token_type: "bearer"
    });
});

// Helper to get user ID from token
const getUserIdFromToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) return authHeader.split('_')[3];
    return null;
};

// --- WISHES ---

// Health Check for /api
app.get("/api", (req, res) => {
    res.json({ status: "alive", message: "WISH Mock API is running" });
});

// Get All Wishes: GET /api/wishes
app.get("/api/wishes", (req, res) => {
    res.json(wishes);
});

// Create Wish: POST /api/wishes
app.post("/api/wishes", (req, res) => {
    const wish = {
        ...req.body,
        id: Math.random().toString(36).substr(2, 9),
        amount_paid: 0,
        remaining_amount: req.body.total_amount,
        status: "OPEN",
        created_at: new Date().toISOString()
    };
    wishes.push(wish);
    console.log(`✨ Wish Created: ${wish.type} ₦${wish.total_amount}`);
    res.json(wish);
});

// Allowance: GET /api/wishes/allowance
app.get("/api/wishes/allowance", (req, res) => {
    res.json({ remaining: 5000 });
});

// --- GRANTS & VTU ---

// Grant Wish: POST /api/grants/initialize
app.post("/api/grants/initialize", (req, res) => {
    const { wish_id, amount, granter_id } = req.body;
    const wish = wishes.find(w => w.id === wish_id);
    if (!wish) return res.status(404).json({ detail: "Wish not found" });

    console.log(`💳 Initializing Payment for Wish: ${wish_id} by Granter ${granter_id}`);

    const newGrant = {
        id: Math.random().toString(36).substr(2, 9),
        wish_id,
        granter_id,
        amount,
        status: "SUCCESS",
        created_at: new Date().toISOString()
    };
    grants.push(newGrant);
    
    // Simulate Paystack Redirect (we just redirect back to dashboard for mock)
    res.json({ authorization_url: `dashboard.html?status=success&reference=mock_trx_${newGrant.id}` });

    // Simulate Background Processing (Payment Verification -> VTU Fulfillment)
    setTimeout(() => {
        console.log(`📡 Simulating VTU Fulfillment for ${wish.phone}...`);
        
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            if (success) {
                wish.amount_paid += amount;
                wish.remaining_amount -= amount;
                if (wish.remaining_amount <= 0) wish.status = "FULFILLED";
                console.log("✅ VTU SUCCESS");
            } else {
                console.log("❌ VTU FAILED");
            }
        }, 2000);
    }, 3000);
});

// Get My Grants: GET /api/grants/mine
app.get("/api/grants/mine", (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ detail: "Unauthorized" });
    const myGrants = grants.filter(g => g.granter_id == userId);
    res.json(myGrants);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Mock Backend running at http://localhost:${PORT}/api`);
    console.log(`👉 Update API_CONFIG.BASE_URL in constants.js to this URL.`);
});