const express = require('express');
const path = require('path');
const { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } = require('./paypal');

// Importer et démarrer le bot Discord
require('./index.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour parser JSON
app.use(express.json());

// Servir les fichiers statiques
app.use(express.static('public'));

// Routes PayPal
app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
});

app.post("/paypal/order", async (req, res) => {
  // Request body should contain: { intent, amount, currency }
  await createPaypalOrder(req, res);
});

app.post("/paypal/order/:orderID/capture", async (req, res) => {
  await capturePaypalOrder(req, res);
});

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Site web démarré sur http://localhost:${PORT}`);
    console.log(`🎯 Accès public sur http://0.0.0.0:${PORT}`);
});

module.exports = app;