const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';

// Middleware to capture raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));

// GitHub webhook endpoint
app.post('/webhook', (req, res) => {
    console.log('[WEBHOOK] Received webhook request');

    // Verify GitHub signature
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        console.error('[WEBHOOK] No signature found');
        return res.status(401).send('Unauthorized');
    }

    // Calculate expected signature
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(req.body).digest('hex');
    
    // Compare signatures
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        console.error('[WEBHOOK] Invalid signature');
        return res.status(401).send('Unauthorized');
    }

    // Parse the payload
    let payload;
    try {
        payload = JSON.parse(req.body.toString());
    } catch (error) {
        console.error('[WEBHOOK] Failed to parse payload:', error);
        return res.status(400).send('Invalid payload');
    }

    // Check if this is a push to main branch
    if (payload.ref !== 'refs/heads/main') {
        console.log(`[WEBHOOK] Ignoring push to ${payload.ref}`);
        return res.status(200).send('Not main branch');
    }

    console.log('[WEBHOOK] Push to main detected, triggering deploy...');

    // Execute deploy script
    const deployScript = path.join(__dirname, 'deploy.sh');
    exec(`bash ${deployScript}`, (error, stdout, stderr) => {
        if (error) {
            console.error('[WEBHOOK] Deploy failed:', error);
            console.error('[WEBHOOK] stderr:', stderr);
            return;
        }
        console.log('[WEBHOOK] Deploy output:', stdout);
        if (stderr) {
            console.error('[WEBHOOK] Deploy stderr:', stderr);
        }
    });

    // Respond immediately (don't wait for deploy to complete)
    res.status(200).send('Deploy triggered');
});

// Health check endpoint
app.get('/webhook/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`[WEBHOOK] Server listening on port ${PORT}`);
});