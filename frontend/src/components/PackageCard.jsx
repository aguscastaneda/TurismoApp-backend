import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import useWeather from '../hooks/useWeather';
import { useNavigate } from 'react-router-dom';

const PackageCard = ({ package: pkg }) => {
  const [people, setPeople] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { convertPrice, formatPrice } = useCurrency();
  const { weather, loading: weatherLoading, getWeatherIcon } = useWeather(pkg.destination || 'Buenos Aires');
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(pkg.id, people);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Ocultar después de 3 segundos
  };

  const maxPeople = 8; // Límite fijo de 8 personas

  // Convertir precio a la moneda seleccionada
  const convertedPrice = convertPrice(pkg.price, 'USD');
  const formattedPrice = formatPrice(convertedPrice * people);

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

  const getDestinationImage = (destination) => {
    const images = {
      // Destinos argentinos
      'Bariloche': '/images/bariloche.jpg',
      'Iguazú': '/images/iguazujpg.jpg',
      'Mendoza': '/images/mendoza.jpeg',
      'Salta': '/images/salta.jpg',
      'Ushuaia': '/images/ushuaiajpg.jpg',
      'Córdoba': '/images/cordoba.jpg',
      
      // Destinos internacionales
      'Río de Janeiro': '/images/rio-janeiro.jpg',
      'Santiago de Chile': '/images/santiago-chile.jpg',
      'Lima': '/images/lima.jpeg',
      'Bogotá': '/images/bogota.jpeg',
      'Ciudad de México': '/images/mexico.jpg',
      'Nueva York': '/images/new-york.jpg',
      'París': '/images/paris.jpg',
      'Tokio': '/images/tokio.jpg'
    };
   
    const imageUrl = images[destination] || '/images/default.jpg';
    return imageUrl;
  };

  return (
    <div className="package-card h-full flex flex-col">
      {/* Imagen del destino */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getDestinationImage(pkg.destination)}
          alt={`${pkg.destination}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            e.target.src = '/images/default.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTypeColor(pkg.price)} shadow-lg`}>
            {getTypeLabel(pkg.price)}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">{pkg.name}</h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-medium">
              Buenos Aires → {pkg.destination || 'Destino'}
            </span>
          </div>
          
          {pkg.description && (
            <div className="text-gray-600 text-sm mb-4 leading-relaxed">
              {pkg.description}
            </div>
          )}

          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-gray-700">{getFlightClass(pkg.price)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-gray-700">{getHotelStars(pkg.price)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span className="text-gray-700">Hasta {maxPeople} personas</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <svg className="h-4 w-4 text-amber-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-gray-700">4.5/5 (12 reseñas)</span>
              </div>
            </div>

            {/* Información del clima */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-sm mb-2">
                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="font-medium text-blue-800">Clima en {pkg.destination || 'Destino'}</span>
              </div>

              {weatherLoading ? (
                <div className="text-sm text-gray-500">Cargando clima...</div>
              ) : weather ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getWeatherIcon(weather.weather[0].main)}</div>
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{Math.round(weather.main.temp)}°C</div>
                      <div className="text-sm text-gray-600 capitalize">{weather.weather[0].description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
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
                <div className="text-sm text-gray-500">No disponible</div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-gray-700 font-medium text-sm">
                Número de personas
              </label>
              <input
                type="number"
                min="1"
                max={maxPeople}
                value={people}
                onChange={(e) => setPeople(Math.max(1, Math.min(maxPeople, Number(e.target.value) || 1)))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Precio y botón */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="text-3xl font-bold text-gradient mb-4">
            {formattedPrice}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={pkg.stock === 0}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pkg.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
          </button>
          
          {/* Mensaje de confirmación */}
          {showSuccess && (
            <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg animate-fade-in">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">¡Agregado al carrito exitosamente!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
