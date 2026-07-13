// ============================================================================
// REETAI MIDDLEWARE SYSTEM DIAGNOSTIC TRACER SCRIPT
// ============================================================================

const TARGET_PORT = process.env.PORT || 3000;
const INGEST_ENDPOINT = `https://pdaga-122-172-86-245.run.pinggy-free.link/api/v1/ingest`;

async function triggerAutomatedLedgerIngestTest() {
    console.log('🏁 [DIAGNOSTIC] Launching internal pipeline integration test...');
    
    // Construct the mock data payload mimicking a clean AI extraction record
    const mockInvoicePayload = {
        "invoice_id": "INV-AI-2026-X88",
        "amount": "1450.75",
        "vendor_name": "Pervez rehman Sandbox Company_US_1", // Matches your exact connected sandbox company!
        "gstin": "IN-29AAFCR7762D1Z4"
    };

    try {
        console.log(`📡 [DIAGNOSTIC] Dispatching transaction packet vectors to gateway: ${INGEST_ENDPOINT}`);
        
        // Issue the outbound network fetch request hitting your local Express gateway
        const response = await fetch(INGEST_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-target-ledger': 'qbo' // <-- Routes directly to your active QuickBooks strategy!
            },
            body: JSON.stringify(mockInvoicePayload)
        });

        const resultJson = await response.json();

        if (!response.ok) {
            console.error('\n❌ [DIAGNOSTIC FAILURE] Ingestion loop rejected by gateway engine.');
            console.error('Error Trace:', resultJson);
            return;
        }

        console.log('\n===================================================');
        console.log('✅ [DIAGNOSTIC SUCCESS] TRANSACTION RECONCILED SAFELY!');
        console.log(`Status Message: ${resultJson.message}`);
        console.log(`Invoice Registered: ${resultJson.reconciled_schema.invoice_number}`);
        console.log(`Total Value Streamed: $${resultJson.reconciled_schema.total_amount}`);
        console.log('===================================================\n');

    } catch (error) {
        console.error('\n🚨 [CRITICAL INFRASTRUCTURE FAULT] Test runner failed to reach host loop:');
        console.error(error.message);
    }
}

// Fire execution sequence
triggerAutomatedLedgerIngestTest();
