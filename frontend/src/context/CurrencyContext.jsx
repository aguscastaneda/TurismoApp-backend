import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency debe ser usado dentro de un CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Monedas populares con sus símbolos
  const popularCurrencies = [
    { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
    { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
    { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
    { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
    { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
    { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
    { code: 'UYU', symbol: '$', name: 'Peso Uruguayo' },
    { code: 'JPY', symbol: '¥', name: 'Yen Japonés' },
    { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano' },
    { code: 'CAD', symbol: 'C$', name: 'Dólar Canadiense' },
    { code: 'CHF', symbol: 'CHF', name: 'Franco Suizo' },
    { code: 'CNY', symbol: '¥', name: 'Yuan Chino' }
  ];

  // Obtener tasas de cambio
  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:3000/api/currency/rates');
      
      if (response.data.success) {
        setExchangeRates(response.data.rates);
        setLastUpdate(new Date(response.data.timestamp * 1000));
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error('Error al obtener tasas de cambio:', err);
      setError('Error al cargar las tasas de cambio');
    } finally {
      setLoading(false);
    }
  };

  // Convertir precio usando tasas base EUR
  const convertPrice = (price, fromCurrency = 'USD', toCurrency = selectedCurrency) => {
    if (!exchangeRates || fromCurrency === toCurrency) {
      return price;
    }

    // Las tasas están en base EUR, necesitamos convertir correctamente
    const eurRateFrom = exchangeRates[fromCurrency];
    const eurRateTo = exchangeRates[toCurrency];
    
    if (!eurRateFrom || !eurRateTo) {
      return price;
    }

    // Convertir: fromCurrency -> EUR -> toCurrency
    const priceInEUR = price / eurRateFrom;
    const convertedPrice = priceInEUR * eurRateTo;
    
    return convertedPrice;
  };

  // Formatear precio
  const formatPrice = (price, currency = selectedCurrency) => {
    const currencyInfo = popularCurrencies.find(c => c.code === currency);
    const symbol = currencyInfo ? currencyInfo.symbol : currency;
    
    // Función para formatear números con formato español (puntos para miles, coma para decimales)
    const formatNumber = (num) => {
      return num.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    };
    
    // Formatear según la moneda
    switch (currency) {
      case 'JPY':
      case 'CNY':
        return `${symbol}${Math.round(price).toLocaleString('es-ES')}`;
      case 'USD':
      case 'EUR':
      case 'GBP':
      case 'AUD':
      case 'CAD':
        return `${symbol}${formatNumber(price)}`;
      default:
        return `${symbol}${formatNumber(price)}`;
    }
  };

  // Obtener información de la moneda
  const getCurrencyInfo = (currency = selectedCurrency) => {
    return popularCurrencies.find(c => c.code === currency) || {
      code: currency,
      symbol: currency,
      name: currency
    };
  };

  // Cargar tasas de cambio al montar el componente
  useEffect(() => {
    fetchExchangeRates();
    
    // Actualizar cada hora
    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    loading,
    error,
    lastUpdate,
    popularCurrencies,
    convertPrice,
    formatPrice,
    getCurrencyInfo,
    fetchExchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 