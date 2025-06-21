import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import useWeather from '../hooks/useWeather';

const PackageCard = ({ package: pkg }) => {
  const [people, setPeople] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, getProductMessage, clearProductMessage } = useCart();
  const { isAuthenticated } = useAuth();
  const { weather, loading: weatherLoading, getWeatherIcon } = useWeather(pkg.destination || 'Buenos Aires');

  const { success, error } = getProductMessage(pkg.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(pkg.id, people);
    } finally {
      setIsAdding(false);
    }
  };

  const getTypeColor = (price) => {
    const priceNum = parseFloat(price);
    if (priceNum <= 300) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    } else if (priceNum <= 600) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    } else {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  const getTypeLabel = (price) => {
    const priceNum = parseFloat(price);
    if (priceNum <= 300) {
      return "Low Cost";
    } else if (priceNum <= 600) {
      return "Medium Cost";
    } else {
      return "High Cost";
    }
  };

  // Simular datos de vuelo y alojamiento basados en el precio
  const getFlightClass = (price) => {
    const priceNum = parseFloat(price);
    if (priceNum <= 300) return "Clase Económica";
    if (priceNum <= 600) return "Clase Económica";
    return "Clase Económica / Business";
  };

  const getHotelStars = (price) => {
    const priceNum = parseFloat(price);
    if (priceNum <= 300) return "3 estrellas";
    if (priceNum <= 600) return "4 estrellas";
    return "5 estrellas";
  };

  const maxPeople = 8; // Límite fijo de 8 personas

  // Convertir precio a pesos argentinos (aproximadamente 1 USD = 1000 ARS)
  const convertToPesos = (price) => {
    return parseFloat(price) * 1000;
  };

  return (
    <div className="card h-full flex flex-col bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800 leading-tight">{pkg.name}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(pkg.price)}`}>
            {getTypeLabel(pkg.price)}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1">
          <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="font-medium">
            Buenos Aires → {pkg.destination || 'Destino'}
          </span>
        </div>
        {pkg.description && (
          <div className="text-slate-500 text-sm mb-4">
            {pkg.description}
          </div>
        )}

        <div className="space-y-4 text-slate-700">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{getFlightClass(pkg.price)}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{getHotelStars(pkg.price)}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Hasta {maxPeople} personas</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <svg className="h-4 w-4 text-amber-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>4.5/5 (12 reseñas)</span>
            </div>
          </div>

          {/* Información del clima */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm mb-2">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span className="font-medium text-blue-800">Clima en {pkg.destination || 'Destino'}</span>
            </div>

            {weatherLoading ? (
              <div className="text-sm text-slate-500">Cargando clima...</div>
            ) : weather ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getWeatherIcon(weather.weather[0].main)}</div>
                  <div>
                    <div className="text-lg font-semibold text-slate-800">{Math.round(weather.main.temp)}°C</div>
                    <div className="text-sm text-slate-600 capitalize">{weather.weather[0].description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span>{weather.main.humidity}% humedad</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{Math.round(weather.wind.speed)} km/h</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">No disponible</div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-slate-700 font-medium">
              Número de personas
            </label>
            <input
              type="number"
              min="1"
              max={maxPeople}
              value={people}
              onChange={(e) => setPeople(Math.max(1, Math.min(maxPeople, Number(e.target.value) || 1)))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="text-3xl font-bold text-blue-600">
            ${convertToPesos(pkg.price * people).toLocaleString('es-AR')}
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {/* Mensajes de éxito y error específicos del producto */}
        {success && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
            <button
              onClick={() => clearProductMessage(pkg.id)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => clearProductMessage(pkg.id)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <button
          onClick={handleAddToCart}
          disabled={!isAuthenticated || pkg.stock === 0 || isAdding}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Agregando...</span>
            </>
          ) : pkg.stock === 0 ? (
            'Agotado'
          ) : (
            'Agregar al Carrito'
          )}
        </button>
      </div>
    </div>
  );
};

export default PackageCard; 