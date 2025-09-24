import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getDestinationImage, handleImageError } from '../utils/imageUtils';
import useWeather from '../hooks/useWeather';
import { useCurrency } from '../context/CurrencyContext';

const horarios = [
  '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'
];
const maxPeople = 8;

const todayStr = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTypeLabel = (price) => {
  const priceNum = parseFloat(price);
  if (priceNum <= 300) return "Low Cost";
  if (priceNum <= 600) return "Medium Cost";
  return "High Cost";
};
const getTypeColor = (price) => {
  const priceNum = parseFloat(price);
  if (priceNum <= 300) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (priceNum <= 600) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-purple-100 text-purple-800 border-purple-200";
};
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

const ScheduleTrip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = location.state?.product;
  const [fechaIda, setFechaIda] = useState('');
  const [fechaVuelta, setFechaVuelta] = useState('');
  const [horaIda, setHoraIda] = useState('');
  const [horaVuelta, setHoraVuelta] = useState('');
  const [people, setPeople] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { weather, loading: weatherLoading, getWeatherIcon } = useWeather(product?.destination || 'Buenos Aires');
  const { convertPrice, formatPrice } = useCurrency();

  if (!product) {
    return <div className="p-6">No se encontró el paquete seleccionado.</div>;
  }

  const validate = () => {
    setError('');
    if (!fechaIda || !fechaVuelta || !horaIda || !horaVuelta) {
      setError('Debes completar todas las opciones.');
      return false;
    }
    const hoy = todayStr();
    if (fechaIda < hoy) {
      setError('La fecha de ida no puede ser anterior a hoy.');
      return false;
    }
    if (fechaVuelta <= fechaIda) {
      setError('La fecha de regreso debe ser posterior a la de ida.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setIsAdding(true);
    setError('');
    setSuccess('');
    // Guardar configuración personalizada en localStorage para el producto
    const customConfig = { fechaIda, fechaVuelta, horaIda, horaVuelta };
    let customTrips = JSON.parse(localStorage.getItem('customTrips') || '{}');
    customTrips[product.id] = customConfig;
    localStorage.setItem('customTrips', JSON.stringify(customTrips));
    const ok = await addToCart(product.id, people);
    if (ok) {
      setSuccess('¡Viaje configurado y agregado al carrito!');
      setTimeout(() => navigate('/cart'), 1500);
    } else {
      setError('Error al agregar al carrito.');
    }
    setIsAdding(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative w-full sm:w-64 h-48 overflow-hidden rounded flex-shrink-0">
          <img
            src={getDestinationImage(product.destination)}
            alt={product.destination}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(product.price)} shadow-lg`}>
              {getTypeLabel(product.price)}
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Origen:</span> {product.origin || 'Buenos Aires'}</div>
            <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Destino:</span> {product.destination}</div>
            <div className="text-gray-700 text-sm mb-1"><span className="font-semibold">Precio:</span> {formatPrice(convertPrice(product.price, 'USD'))}</div>
            <div className="text-gray-700 text-sm mb-2"><span className="font-semibold">Descripción:</span> {product.description}</div>
          </div>
        </div>
      </div>
      {/* Info de clase, estrellas, personas, reseñas y clima */}
      <div className="mt-4 flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>{getFlightClass(product.price)}</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{getHotelStars(product.price)}</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 10a3 3 0 100-6 3 3 0 000 6zm6 0a3 3 0 100-6 3 3 0 000 6zM7 12a5 5 0 00-5 5v1h6v-1a5 5 0 00-1-3.874A5.002 5.002 0 017 12zm6 0a5 5 0 00-4 4.9V18h8v-1a5 5 0 00-4-4.9z" />
            </svg>
            <span>Hasta {maxPeople} personas</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.09 10,15.27 4.82,18.09 6,12.26 1.49,8.09 7.41,7.36" />
            </svg>
            <span>4.5/5 (12 reseñas)</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl w-full sm:w-auto min-w-[260px] max-w-lg mx-auto sm:mx-0 mb-2 mt-2 sm:mt-0 text-base">
            <div className="flex items-center space-x-2 text-sm mb-3">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span className="font-medium text-blue-800">Clima en {product.destination || 'Destino'}</span>
            </div>
            {weatherLoading ? (
              <div className="text-xs text-gray-500">Cargando clima...</div>
            ) : weather ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{getWeatherIcon(weather.weather[0].main)}</div>
                  <div className="text-lg font-semibold text-gray-800">{Math.round(weather.main.temp)}°C</div>
                  <div className="text-sm text-gray-600 capitalize">{weather.weather[0].description}</div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
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
              <div className="text-xs text-gray-500">No disponible</div>
            )}
          </div>
        </div>
      </div>
      {/* Configuración de viaje */}
      <div className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de ida</label>
          <input
            type="date"
            min={todayStr()}
            value={fechaIda}
            onChange={e => {
              const selectedDate = e.target.value;
              const today = todayStr();
              if (selectedDate >= today) {
                setFechaIda(selectedDate);
                // Si la fecha de vuelta es anterior a la nueva fecha de ida, la limpiamos
                if (fechaVuelta && selectedDate > fechaVuelta) {
                  setFechaVuelta('');
                }
              }
            }}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de regreso</label>
          <input
            type="date"
            min={fechaIda || todayStr()}
            value={fechaVuelta}
            onChange={e => {
              const selectedDate = e.target.value;
              const minDate = fechaIda || todayStr();
              if (selectedDate >= minDate) {
                setFechaVuelta(selectedDate);
              }
            }}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Horario de partida</label>
          <select
            value={horaIda}
            onChange={e => setHoraIda(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Seleccionar horario</option>
            {horarios.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Horario de regreso</label>
          <select
            value={horaVuelta}
            onChange={e => setHoraVuelta(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Seleccionar horario</option>
            {horarios.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-center">Número de personas</label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPeople(prev => Math.max(1, prev - 1))}
              disabled={people <= 1}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center text-lg font-semibold transition-colors"
            >
              -
            </button>
            <span className="text-3xl font-bold min-w-[4rem] text-center">{people}</span>
            <button
              onClick={() => setPeople(prev => Math.min(maxPeople, prev + 1))}
              disabled={people >= maxPeople}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center text-lg font-semibold transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {success && <div className="mt-4 text-green-600">{success}</div>}
      <button
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleAdd}
        disabled={isAdding || !fechaIda || !fechaVuelta || !horaIda || !horaVuelta}
      >
        {isAdding ? 'Agregando...' : 'Agregar al carrito'}
      </button>
    </div>
  );
};

export default ScheduleTrip; 