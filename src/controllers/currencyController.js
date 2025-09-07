const axios = require('axios');
const { getCache, setCache, CACHE_KEYS } = require('../utils/cache');

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
    console.log('Currency endpoint called');
    
    // Verificar cache Redis primero
    const cacheKey = CACHE_KEYS.CURRENCY_RATES;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    // Usar tasas simuladas temporalmente
    const mockRates = {
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

    const payload = {
      success: true,
      base: 'EUR',
      rates: mockRates,
      timestamp: Math.floor(Date.now() / 1000),
      cached: false,
      message: "Tasas simuladas - API temporal"
    };

    // Actualizar cache Redis y memoria
    await setCache(cacheKey, payload, parseInt(process.env.CACHE_TTL_CURRENCY || "3600", 10));
    exchangeRatesCache = { base: 'EUR', rates: mockRates, timestamp: payload.timestamp };
    lastCacheUpdate = Date.now();

    console.log('Returning mock rates');
    
    res.json(payload);
  } catch (error) {
    console.error('Error in currency controller:', error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};

// Convertir un monto especifico
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
    // Fallback a conversion simulada
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
    // Verificar cache Redis primero
    const cacheKey = CACHE_KEYS.CURRENCY_SYMBOLS;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    const apiKey = process.env.FIXER_API_KEY;
    
    if (!apiKey || apiKey === "26b2e203275b8d6d253c1fa72dbc0890") {
      // Devolver simbolos simulados
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
      
      const payload = {
        success: true,
        symbols: mockSymbols,
        message: "Símbolos simulados - Configura FIXER_API_KEY para símbolos reales"
      };
      
      // Cachear por 24 horas
      await setCache(cacheKey, payload, 86400);
      
      return res.json(payload);
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

    const payload = {
      success: true,
      symbols: response.data.symbols
    };
    
    // Cachear por 24 horas
    await setCache(cacheKey, payload, 86400);
    
    res.json(payload);

  } catch (error) {
    console.error('Error al obtener símbolos:', error);
    
    // Fallback a simbolos simulados
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
    
    const payload = {
      success: true,
      symbols: mockSymbols,
      message: "Símbolos simulados - Error en API de Fixer.io"
    };
    
    // Cachear fallback por 1 hora
    await setCache(cacheKey, payload, 3600);
    
    res.json(payload);
  }
};

module.exports = {
  getExchangeRates,
  convertCurrency,
  getAvailableCurrencies
}; 