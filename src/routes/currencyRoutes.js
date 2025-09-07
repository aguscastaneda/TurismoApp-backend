const express = require('express');
const router = express.Router();
const { 
  getExchangeRates, 
  convertCurrency, 
  getAvailableCurrencies 
} = require('../controllers/currencyController');

// Obtener tasas de cambio
router.get('/rates', getExchangeRates);

// Convertir moneda especifica
router.get('/convert', convertCurrency);

// Obtener monedas disponibles
router.get('/symbols', getAvailableCurrencies);

module.exports = router; 