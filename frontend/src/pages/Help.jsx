import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Help = () => {
  const { user, isAuthenticated } = useAuth();
  const [helpData, setHelpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const endpoint = isAuthenticated ? '/api/help' : '/api/help/public';
        const response = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, config);
        
        setHelpData(response.data);
      } catch (err) {
        setError('Error al cargar la información de ayuda');
        console.error('Error fetching help data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{helpData?.titulo}</h1>
          <p className="text-white/80 text-lg">
            Encuentra respuestas a tus preguntas y soluciones a problemas comunes
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {helpData?.secciones.map((seccion, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(index)}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  activeSection === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {seccion.titulo}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {helpData?.secciones[activeSection] && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {helpData.secciones[activeSection].titulo}
              </h2>
              
              <div className="space-y-6">
                {helpData.secciones[activeSection].items.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6">
                    {item.problema ? (
                      // Problema y solución
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.problema}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.solucion}
                        </p>
                      </div>
                    ) : (
                      // Título y descripción
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.titulo}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Necesitas más ayuda?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Contacto por Email</h3>
              </div>
              <p className="text-gray-600 mb-2">
                Envía un email detallando tu problema y te responderemos lo antes posible.
              </p>
              <a
                href="mailto:olimpiadas2025fragata@gmail.com"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                olimpiadas2025fragata@gmail.com
              </a>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Horarios de Atención</h3>
              </div>
              <p className="text-gray-600 mb-2">
                Nuestro equipo de soporte está disponible en los siguientes horarios:
              </p>
              <p className="text-gray-800 font-medium">
                Lunes a Viernes: 9:00 - 18:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help; 