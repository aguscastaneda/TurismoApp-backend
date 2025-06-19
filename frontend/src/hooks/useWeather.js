import { useState, useEffect } from 'react';

const useWeather = (location) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mapeo de ciudades con caracteres especiales a nombres que la API puede reconocer
  const cityNameMapping = {
    'Iguazú': 'Iguazu',
    'Iguazu': 'Iguazu',
    'Buenos Aires': 'Buenos Aires',
    'Bariloche': 'San Carlos de Bariloche',
    'Mendoza': 'Mendoza',
    'Salta': 'Salta',
    'Ushuaia': 'Ushuaia',
    'Córdoba': 'Cordoba',
    'Cordoba': 'Cordoba'
  };

  // Normalizar el nombre de la ciudad
  const normalizeCityName = (cityName) => {
    if (!cityName) return 'Buenos Aires';
    
    // Buscar en el mapeo primero
    const mappedName = cityNameMapping[cityName];
    if (mappedName) return mappedName;
    
    // Si no está en el mapeo, intentar normalizar caracteres especiales
    return cityName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^\w\s-]/g, '') // Remover caracteres especiales excepto espacios y guiones
      .trim();
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar que la API key esté disponible
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        console.log('API Key disponible:', apiKey ? 'Sí' : 'No');
        console.log('API Key (primeros 10 caracteres):', apiKey ? apiKey.substring(0, 10) + '...' : 'No disponible');

        if (!apiKey) {
          throw new Error('API key no configurada');
        }

        const normalizedLocation = normalizeCityName(location);
        console.log('Ciudad original:', location);
        console.log('Ciudad normalizada:', normalizedLocation);

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedLocation)}&appid=${apiKey}&units=metric&lang=es`;
        console.log('URL de la API:', url.replace(apiKey, 'API_KEY_OCULTA'));

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Respuesta del servidor:', response.status, errorText);
          
          if (response.status === 401) {
            throw new Error('API key inválida o no autorizada. Verifica tu clave en OpenWeatherMap.');
          } else if (response.status === 404) {
            // Intentar con el nombre original sin normalizar como fallback
            if (normalizedLocation !== location) {
              console.log('Intentando con nombre original como fallback...');
              const fallbackUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric&lang=es`;
              const fallbackResponse = await fetch(fallbackUrl);
              
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                setWeather(fallbackData);
                return;
              }
            }
            
            // Si ambos intentos fallan, usar datos de clima por defecto para Buenos Aires
            console.log('Usando clima por defecto para Buenos Aires...');
            const defaultUrl = `https://api.openweathermap.org/data/2.5/weather?q=Buenos Aires&appid=${apiKey}&units=metric&lang=es`;
            const defaultResponse = await fetch(defaultUrl);
            
            if (defaultResponse.ok) {
              const defaultData = await defaultResponse.json();
              setWeather(defaultData);
              return;
            }
            
            throw new Error(`No se pudo obtener el clima para "${location}". Mostrando clima de Buenos Aires por defecto.`);
          } else {
            throw new Error(`Error ${response.status}: ${errorText}`);
          }
        }

        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeather();
    }
  }, [location]);

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️'
    };
    return icons[condition] || '🌡️';
  };

  return {
    weather,
    loading,
    error,
    getWeatherIcon
  };
};

export default useWeather; 