import { useCurrency } from '../context/CurrencyContext';

const CurrencyInfo = () => {
  const { 
    selectedCurrency, 
    exchangeRates, 
    lastUpdate, 
    loading, 
    error,
    getCurrencyInfo 
  } = useCurrency();

  const currencyInfo = getCurrencyInfo(selectedCurrency);

  const formatLastUpdate = (date) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
          <span className="text-xs sm:text-sm text-blue-700">Actualizando tasas de cambio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <svg className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs sm:text-sm text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!exchangeRates || selectedCurrency === 'EUR') {
    return null;
  }

  const eurRate = exchangeRates[selectedCurrency];
  if (!eurRate) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-xs sm:text-sm text-green-700">
            <strong>1 EUR = {eurRate.toFixed(4)} {selectedCurrency}</strong>
          </span>
        </div>
        <div className="text-xs text-green-600">
          Actualizado: {formatLastUpdate(lastUpdate)}
        </div>
      </div>
      <div className="mt-1 sm:mt-2 text-xs text-green-600">
        Mostrando precios en {currencyInfo.name} ({currencyInfo.symbol})
      </div>
    </div>
  );
};

export default CurrencyInfo; 