import { useState, useEffect } from "react";
import PackageCard from '../components/PackageCard';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("low-cost");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (!response.ok) {
          throw new Error('Error al cargar los paquetes');
        }
        const data = await response.json();
        setPackages(data);
      } catch (error) {
        console.error('Error fetching packages:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
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
        return "bg-emerald-100 text-emerald-800";
      case "medium-cost":
        return "bg-amber-100 text-amber-800";
      case "high-cost":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Descubre el Mundo</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Encuentra el viaje perfecto para ti con nuestras opciones
            <span className="text-emerald-600 font-semibold"> low cost</span>,
            <span className="text-amber-600 font-semibold"> medium cost</span> y
            <span className="text-purple-600 font-semibold"> high cost</span>
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-slate-200 shadow-sm">
              <span className="text-slate-600">Más de 10,000 viajeros felices</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-lg p-1 shadow-sm mb-8">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? getTabColor(tab.id)
                    : "text-slate-600 hover:text-slate-800"
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
                <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-lg">No hay paquetes {tab.label.toLowerCase()} disponibles</p>
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
