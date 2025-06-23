import { useState, useEffect } from "react";
import PackageCard from '../components/PackageCard';
import { useAuth } from '../context/AuthContext';


// Datos de prueba temporales
const mockPackages = [
  {
    id: 1,
    name: "Buenos Aires - Río de Janeiro",
    destination: "Río de Janeiro",
    price: 250,
    description: "Paquete completo con vuelo directo y hotel 3 estrellas en Copacabana",
    stock: 10
  },
  {
    id: 2,
    name: "Buenos Aires - Santiago de Chile",
    destination: "Santiago de Chile",
    price: 180,
    description: "Escape a la capital chilena con alojamiento céntrico",
    stock: 15
  },
  {
    id: 3,
    name: "Buenos Aires - Lima",
    destination: "Lima",
    price: 320,
    description: "Descubre la gastronomía peruana con hotel boutique",
    stock: 8
  },
  {
    id: 4,
    name: "Buenos Aires - Bogotá",
    destination: "Bogotá",
    price: 450,
    description: "Aventura colombiana con tours incluidos",
    stock: 12
  },
  {
    id: 5,
    name: "Buenos Aires - Ciudad de México",
    destination: "Ciudad de México",
    price: 580,
    description: "Explora la cultura azteca con hotel 4 estrellas",
    stock: 6
  },
  {
    id: 6,
    name: "Buenos Aires - Nueva York",
    destination: "Nueva York",
    price: 850,
    description: "La ciudad que nunca duerme con hotel en Manhattan",
    stock: 4
  },
  {
    id: 7,
    name: "Buenos Aires - París",
    destination: "París",
    price: 1200,
    description: "Romance en la ciudad de la luz con hotel 5 estrellas",
    stock: 3
  },
  {
    id: 8,
    name: "Buenos Aires - Tokio",
    destination: "Tokio",
    price: 1500,
    description: "Aventura japonesa con guía local incluido",
    stock: 2
  }
];


const Products = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("low-cost");
  const [backgroundSlide, setBackgroundSlide] = useState(0);
  const [isManualInteraction, setIsManualInteraction] = useState(false);
  const [languageIndex, setLanguageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAuthenticated } = useAuth();


  // Imágenes de fondo para el carrusel
  const backgroundImages = [
    'images/carrusel/carru1.avif',
    'images/carrusel/carru2.avif',
    'images/carrusel/carru3.avif',
    'images/carrusel/carru4.avif',
    'images/carrusel/carru5.avif',
    'images/carrusel/carru6.avif',
    'images/carrusel/carru7.avif'
  ];


  // Títulos en diferentes idiomas
  const titles = [
    "Senti. Viaja. Soñá.", // Español
    "Feel. Travel. Dream.", // Inglés
    "Sente. Viaje. Sonhe.", // Portugués
    "Siente. Viaja. Sueña.", // Español alternativo
    "Ressens. Voyage. Rêve.", // Francés
    "Fühle. Reise. Träume.", // Alemán
    "Senti. Viaggia. Sogna.", // Italiano
    "Siente. Viaja. Sueña." // Español (vuelve al inicio)
  ];


  // Función para manejar clic en el fondo
  const handleBackgroundClick = (e) => {
    // Evitar que se ejecute si se hace clic en los controles
    if (e.target.closest('button') || e.target.tagName === 'BUTTON') {
      return;
    }
   
    // Calcular en qué lado se hizo clic para navegar
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftClick = clickX < rect.width / 2;
   
    setIsManualInteraction(true);
   
    if (isLeftClick) {
      // Navegar a la imagen anterior
      setBackgroundSlide(prev =>
        prev === 0 ? backgroundImages.length - 1 : prev - 1
      );
    } else {
      // Navegar a la imagen siguiente
      setBackgroundSlide(prev =>
        prev === backgroundImages.length - 1 ? 0 : prev + 1
      );
    }
   
    // Resetear el estado de interacción manual después de 3 segundos
    setTimeout(() => setIsManualInteraction(false), 3000);
  };


  // Funciones específicas para los botones de navegación
  const handlePreviousSlide = () => {
    setIsManualInteraction(true);
    setBackgroundSlide(prev =>
      prev === 0 ? backgroundImages.length - 1 : prev - 1
    );
    setTimeout(() => setIsManualInteraction(false), 3000);
  };


  const handleNextSlide = () => {
    setIsManualInteraction(true);
    setBackgroundSlide(prev =>
      prev === backgroundImages.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsManualInteraction(false), 3000);
  };


  const handleDotClick = (index) => {
    setIsManualInteraction(true);
    setBackgroundSlide(index);
    setTimeout(() => setIsManualInteraction(false), 3000);
  };


  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError("");
       
        // Intentar obtener datos del backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        console.log('Intentando conectar a:', `${apiUrl}/api/products`);
        
        const response = await fetch(`${apiUrl}/api/products`);
        console.log('Respuesta del servidor:', response.status, response.statusText);
       
        if (response.ok) {
          const data = await response.json();
          console.log('Datos recibidos del backend:', data);
          setPackages(data);
        } else {
          // Si el backend falla, usar datos de prueba
          console.log('Backend no disponible, usando datos de prueba');
          setError(`Error del servidor: ${response.status} ${response.statusText}`);
          setPackages(mockPackages);
        }
      } catch (error) {
        console.log('Error conectando al backend, usando datos de prueba:', error);
        setError(`Error de conexión: ${error.message}`);
        // Usar datos de prueba en caso de error
        setPackages(mockPackages);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);


  // Carrusel automático de fondo
  useEffect(() => {
    // Solo ejecutar el movimiento automático si no hay interacción manual
    if (isManualInteraction) return;
   
    const interval = setInterval(() => {
      setBackgroundSlide((prev) =>
        prev === backgroundImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);


    return () => clearInterval(interval);
  }, [backgroundImages.length, isManualInteraction]);


  // Cambio automático de idioma del título
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
     
      setTimeout(() => {
        setLanguageIndex((prevIndex) =>
          (prevIndex + 1) % titles.length
        );
        setIsTransitioning(false);
      }, 200); // Duración de la transición de salida
     
    }, 2230); // Cambiar cada 2.23 segundos


    return () => clearInterval(interval);
  }, [titles.length]);


  if (loading) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }


  // Simular categorías de paquetes basadas en el precio
  const lowCostPackages = packages.filter(pkg => parseFloat(pkg.price) <= 300);
  const mediumCostPackages = packages.filter(pkg => parseFloat(pkg.price) > 300 && parseFloat(pkg.price) <= 600);
  const highCostPackages = packages.filter(pkg => parseFloat(pkg.price) > 600);


  const tabs = [
    { id: "low-cost", label: "Paquetes Low Cost", packages: lowCostPackages },
    { id: "medium-cost", label: "Paquetes Medium Cost", packages: mediumCostPackages },
    { id: "high-cost", label: "Paquetes High Cost", packages: highCostPackages }
  ];


  const getTabColor = (tabId) => {
    switch (tabId) {
      case "low-cost":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "medium-cost":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "high-cost":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };


  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section con Carrusel de Fondo */}
        <div className="relative h-96 mb-12 rounded-3xl overflow-hidden shadow-2xl">
          {/* Carrusel de imágenes de fondo */}
          <div className="absolute inset-0 cursor-pointer" onClick={handleBackgroundClick}>
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === backgroundSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Destino ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/default.jpg';
                  }}
                />
                {/* Overlay oscuro para mejorar legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50"></div>
              </div>
            ))}
          </div>


          {/* Contenido de la seccion principal */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
            <h1
              className={`text-6xl font-bold text-white mb-6 drop-shadow-2xl transition-all duration-200 ${
                isTransitioning
                  ? 'opacity-0 transform translate-y-2'
                  : 'opacity-100 transform translate-y-0'
              }`}
            >
              {titles[languageIndex]}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Encuentra el viaje perfecto con nuestras opciones
              <span className="text-emerald-300 font-semibold"> low cost</span>,
              <span className="text-amber-300 font-semibold"> medium cost</span> y
              <span className="text-purple-300 font-semibold"> high cost</span>
            </p>
            <div className="mt-8 flex justify-center">
              <div className="glass rounded-xl px-6 py-3 shadow-xl">
                <span className="text-gray-800 font-medium">Más de 10,000 viajeros felices</span>
              </div>
            </div>
          </div>


          {/* Indicadores del carrusel */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === backgroundSlide
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>


          {/* Botones de navegación */}
          <button
            onClick={handlePreviousSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 glass hover:bg-white/40 rounded-full p-3 transition-all duration-300 z-20"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 glass hover:bg-white/40 rounded-full p-3 transition-all duration-300 z-20"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>


        {/* Tabs */}
        <div className="card p-1 mb-8">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? getTabColor(tab.id)
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>


        {/* Tab Content */}
        {tabs.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tab.packages.map((pkg, index) => (
                <div key={pkg.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PackageCard package={pkg} />
                </div>
              ))}
            </div>
            {tab.packages.length === 0 && (
              <div className="text-center py-16">
                <div className="card p-8">
                  <p className="text-gray-500 text-lg">No hay paquetes {tab.label.toLowerCase()} disponibles</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default Products;


