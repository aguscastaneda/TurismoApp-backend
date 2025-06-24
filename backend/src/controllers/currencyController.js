const axios = require('axios');

// Cache para las tasas de cambio (se actualiza cada hora)
let exchangeRatesCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

// Tasas de cambio simuladas para desarrollo (base EUR)
const mockExchangeRates = {
  EUR: 1.0000,
  USD: 1.0870,
  GBP: 0.8558,
  JPY: 163.0435,
  AUD: 1.6522,
  CAD: 1.4674,
  CHF: 0.9565,
  CNY: 7.8261,
  ARS: 1358.7086,
  CLP: 1100.0157,
  COP: 4736.9395,
  MXN: 22.1275,
  PEN: 4.1276,
  UYU: 46.8593
};

// Obtener tasas de cambio desde Fixer.io
const getExchangeRates = async (req, res) => {
  try {
    // Siempre usar EUR como base
    const base = 'EUR';
    // Verificar si tenemos cache válido
    const now = Date.now();
    if (exchangeRatesCache && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
      return res.json({
        success: true,
        base: exchangeRatesCache.base,
        rates: exchangeRatesCache.rates,
        timestamp: lastCacheUpdate,
        cached: true
      });
    }
    // Obtener API key desde variables de entorno
    const apiKey = process.env.FIXER_API_KEY;
    if (!apiKey) {
      // Usar tasas simuladas si no hay API key configurada
      exchangeRatesCache = {
        base: 'EUR',
        rates: mockExchangeRates,
        timestamp: Math.floor(Date.now() / 1000)
      };
      lastCacheUpdate = now;
      return res.json({
        success: true,
        base: 'EUR',
        rates: mockExchangeRates,
        timestamp: Math.floor(Date.now() / 1000),
        cached: false,
        message: "Tasas simuladas - Configura FIXER_API_KEY para tasas reales"
      });
    }
    // Hacer petición a Fixer.io
    const response = await axios.get(`https://data.fixer.io/api/latest`, {
      params: {
        access_key: apiKey,
        base: base,
        symbols: 'USD,EUR,GBP,JPY,AUD,CAD,CHF,CNY,ARS,CLP,COP,MXN,PEN,UYU'
      }
    });
    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        error: response.data.error?.info || "Error al obtener tasas de cambio"
      });
    }
    // Actualizar cache
    exchangeRatesCache = response.data;
    lastCacheUpdate = now;
    res.json({
      success: true,
      base: response.data.base,
      rates: response.data.rates,
      timestamp: response.data.timestamp,
      cached: false
    });
  } catch (error) {
    // Fallback a tasas simuladas en caso de error
    exchangeRatesCache = {
      base: 'EUR',
      rates: mockExchangeRates,
      timestamp: Math.floor(Date.now() / 1000)
    };
    lastCacheUpdate = Date.now();
    res.json({
      success: true,
      base: 'EUR',
      rates: mockExchangeRates,
      timestamp: Math.floor(Date.now() / 1000),
      cached: false,
      message: "Tasas simuladas - Error en API de Fixer.io"
    });
  }
};

// Convertir un monto específico
const convertCurrency = async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: "Se requieren los parámetros: amount, from, to"
      });
    }
    // Usar tasas base EUR
    // Obtener tasas de cambio (de cache o mock)
    let rates = exchangeRatesCache && exchangeRatesCache.rates ? exchangeRatesCache.rates : mockExchangeRates;
    // Si no hay tasas en cache, obtenerlas
    if (!rates[from] || !rates[to]) {
      return res.status(400).json({
        success: false,
        error: "Moneda no soportada"
      });
    }
    // Conversion: de 'from' a EUR, luego de EUR a 'to'
    const amountInEUR = parseFloat(amount) / rates[from];
    const result = amountInEUR * rates[to];
    return res.json({
      success: true,
      result: result,
      query: { from, to, amount: parseFloat(amount) }
    });
  } catch (error) {
    // Fallback a conversión simulada
    const { amount, from, to } = req.query;
    const fromRate = mockExchangeRates[from] || 1;
    const toRate = mockExchangeRates[to] || 1;
    const result = (parseFloat(amount) / fromRate) * toRate;
    res.json({
      success: true,
      result: result,
      query: { from, to, amount: parseFloat(amount) },
      message: "Conversión simulada - Error en API de Fixer.io"
    });
  }
};

// Obtener monedas disponibles
const getAvailableCurrencies = async (req, res) => {
  try {
    const apiKey = process.env.FIXER_API_KEY;
    
    if (!apiKey || apiKey === "26b2e203275b8d6d253c1fa72dbc0890") {
      // Devolver símbolos simulados
      const mockSymbols = {
        USD: "US Dollar",
        EUR: "Euro",
        GBP: "British Pound",
        JPY: "Japanese Yen",
        AUD: "Australian Dollar",
        CAD: "Canadian Dollar",
        CHF: "Swiss Franc",
        CNY: "Chinese Yuan",
        ARS: "Argentine Peso",
        CLP: "Chilean Peso",
        COP: "Colombian Peso",
        MXN: "Mexican Peso",
        PEN: "Peruvian Sol",
        UYU: "Uruguayan Peso"
      };
      
      return res.json({
        success: true,
        symbols: mockSymbols,
        message: "Símbolos simulados - Configura FIXER_API_KEY para símbolos reales"
      });
    }

    const response = await axios.get(`https://data.fixer.io/api/symbols`, {
      params: {
        access_key: apiKey
      }
    });

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        error: response.data.error?.info || "Error al obtener símbolos"
      });
    }

    res.json({
      success: true,
      symbols: response.data.symbols
    });

  } catch (error) {
    console.error('Error al obtener símbolos:', error);
    
    // Fallback a símbolos simulados
    const mockSymbols = {
      USD: "US Dollar",
      EUR: "Euro",
      GBP: "British Pound",
      JPY: "Japanese Yen",
      AUD: "Australian Dollar",
      CAD: "Canadian Dollar",
      CHF: "Swiss Franc",
      CNY: "Chinese Yuan",
      ARS: "Argentine Peso",
      CLP: "Chilean Peso",
      COP: "Colombian Peso",
      MXN: "Mexican Peso",
      PEN: "Peruvian Sol",
      UYU: "Uruguayan Peso"
    };
    
    res.json({
      success: true,
      symbols: mockSymbols,
      message: "Símbolos simulados - Error en API de Fixer.io"
    });
  }
};

module.exports = {
  getExchangeRates,
  convertCurrency,
  getAvailableCurrencies
}; 