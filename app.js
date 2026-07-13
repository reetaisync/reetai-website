const express = require('express');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

// Import Google's official OAuth2 validation client
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Google Auth Client using your Environment variables
// Ensure GOOGLE_CLIENT_ID is added to your .env file
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const authClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- MULTI-ACCOUNTING GATEWAY CORE MIDDLEWARE HANDLERS ---
app.use(cors());
app.use(express.json());

// --- TEMPORARY RELAXED DEVELOPMENT CSP HEADER ---
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", 
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "script-src * 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; " +
        "style-src * 'unsafe-inline'; " +
        "img-src * data: blob:; " +
        "connect-src * 'unsafe-inline'; " +
        "frame-src * https://accounts.google.com;"
    );
    next();
});

// Create a new route ---for contruction business----
app.use(express.static('public'));


app.use('/construct', express.static( path.join(
        __dirname,
        'products',
        'construct'
        ) )
);

app.get('/construct',(req,res)=>{ res.sendFile( path.join(
        __dirname,
        'products',
        'construct',
        'index.html'
        )
    );
});

//const projectRoutes = require('./src/routes/projects');
//app.use('/api/projects', projectRoutes);

// --- Register Route ---
//const purchaseRequestRoutes = require('./src/routes/purchaseRequests');

//app.use('/api/purchase-requests',purchaseRequestRoutes);

//const vendorsRoute = require('./src/routes/vendors');
//app.use('/api/vendors', require('./src/routes/vendors'));

//const purchaseOrderRoutes = require('./src/routes/purchaseOrders');

//app.use('/api/purchase-orders',purchaseOrderRoutes);

//const goodsReceiptRoutes = require('./src/routes/goodsReceipts');

//app.use('/api/goods-receipts',goodsReceiptRoutes);

//const invoiceRoutes = require('./src/routes/invoices');

//app.use('/api/invoices',invoiceRoutes);

//const paymentRoutes = require('./src/routes/payments');

//app.use('/api/payments',paymentRoutes);


// --- CRITICAL ROUTE FIX: Deliver your static index layout page ---
app.use(express.static(path.join(__dirname, 'public')));

// Fallback path router to catch standard base browser queries cleanly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- GOOGLE AUTHENTICATION TOKEN VERIFICATION ENDPOINT ---
app.post('/api/v1/auth/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ status: "ERROR", message: "Token payload missing." });
    }

    try {
        // Cryptographically verify the token integrity against Google's public keys
        const ticket = await authClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID, 
        });
        
        // Extract the verified user profile properties
        const payload = ticket.getPayload();
        const userId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];

        console.log(`Verified Session: ${name} (${email}) | UID: ${userId}`);

        // TODO: Mint a local JWT session token, or find/create the user record in your database here

        return res.status(200).json({
            status: "SUCCESS",
            message: "Authentication successful.",
            user: { id: userId, email, name }
        });

    } catch (error) {
        console.error("Token verification failed structural constraints:", error.message);
        return res.status(401).json({
            status: "ERROR",
            message: "Cryptographic verification signature mismatch or expired token."
        });
    }
});

// --- MOCK ENTERPRISE INGESTION LAYER PROCESSING ENDPOINT ---
app.post('/api/v1/ingest', (req, res) => {
    const targetLedger = req.headers['x-target-ledger'] || 'qbo';
    const { invoice_id, amount, vendor_name } = req.body;

    if (!invoice_id || !amount) {
        return res.status(400).json({
            status: "ERROR",
            code: 400,
            message: "Missing mandatory ledger mapping attributes."
        });
    }

    return res.status(201).json({
        status: "SUCCESS",
        code: 201,
        message: `Transaction successfully recorded inside ${targetLedger.toUpperCase()} sandbox tables.`,
        transaction: { invoice_id, total: parseFloat(amount), entity: vendor_name }
    });
});

// Global runtime execution listener block
app.listen(PORT, () => {
    console.log(`🚀 ReetAI Infrastructure Layer operating live on environment channel: ${PORT}`);
});