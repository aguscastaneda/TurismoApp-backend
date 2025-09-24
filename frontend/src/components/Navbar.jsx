import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CurrencySelector from "./CurrencySelector";
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Cerrar menú al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 shadow-lg border-b border-slate-200" style={{ backgroundColor: '#03045E' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-200"
            >
              <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 transition-transform duration-200 hover:scale-110" />
              <span className="hidden sm:block">TurismoApp</span>
              <span className="sm:hidden">TurismoApp</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Mostrar CurrencySelector solo si no es admin */}
            {isAuthenticated && user?.role !== "ADMIN" && <CurrencySelector />}
            {!isAuthenticated ? (
              <>
                <Link to="/help">
                  <button className="flex items-center space-x-2 border border-slate-200 text-white border-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Ayuda</span>
                  </button>
                </Link>
                <div className="flex items-center space-x-2 ml-4">
                  <Link to="/login">
                    <button className="border border-slate-200 text-white border-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                      Ingresa
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="border border-slate-200 text-white border-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                      Registrate
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Mostrar Carrito y Mis Órdenes solo si no es admin */}
                {user?.role !== "ADMIN" && (
                  <>
                    <Link to="/cart" className="relative group">
                      <button className="flex items-center space-x-2 border border-slate-200 text-white border-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                        <svg className="h-5 w-5 text-white group-hover:text-[#03045E] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Carrito</span>
                        {cartItemsCount > 0 && (
                          <span className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-pink-500 group-hover:bg-pink-600 text-white rounded-full">
                            {cartItemsCount}
                          </span>
                        )}
                      </button>
                    </Link>

                    <Link to="/my-orders">
                      <button className="flex items-center space-x-2 border border-slate-200 text-white border-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Mis Órdenes</span>
                      </button>
                    </Link>
                  </>
                )}
                {/* Botón de ayuda solo para usuarios no admin, fuera del menú de usuario */}
                {user?.role === "ADMIN" && (
                  <>
                    <Link to="/admin/products">
                      <button className="flex items-center space-x-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Productos</span>
                      </button>
                    </Link>
                    <Link to="/admin/orders">
                      <button className="flex items-center space-x-2 border border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>Órdenes</span>
                      </button>
                    </Link>
                  </>
                )}
                {/* Menú de usuario */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 border border-slate-200 text-white border-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden xl:block">{user?.name} {user?.role === "ADMIN" && "(Admin)"} {user?.role === "SALES_MANAGER" && "(Manager)"}</span>
                    <span className="xl:hidden">{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      {/* Botón de ayuda dentro del menú de usuario, arriba de cerrar sesión */}
                      <Link to="/help">
                        <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors duration-200">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Ayuda</span>
                        </button>
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mostrar CurrencySelector solo si no es admin */}
            {isAuthenticated && user?.role !== "ADMIN" && <CurrencySelector />}
            {isAuthenticated && (
              <Link to="/cart" onClick={closeMenu} className="relative">
                <button className="flex items-center space-x-1 border border-slate-200 text-white border-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 p-2 rounded-md">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-pink-500 text-white rounded-full">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </Link>
            )}
            
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="flex flex-col justify-center items-center w-10 h-10 border-2 border-white text-white hover:bg-[#CAF0F8] hover:border-[#CAF0F8] hover:text-[#03045E] transition-all duration-200 rounded-md"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}></span>
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-slate-200/50 shadow-2xl">
            <div className="px-4 py-4 space-y-3">
              {!isAuthenticated ? (
                <>
                  {/* Moneda selector en móvil */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <h3 className="text-xs font-semibold text-blue-700 mb-2 flex items-center">
                      <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Moneda
                    </h3>
                    <CurrencySelector />
                  </div>
                  
                  <Link 
                    to="/help" 
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>Centro de Ayuda</span>
                    <svg className="h-3 w-3 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  <div className="space-y-2 pt-2">
                    <Link 
                      to="/login" 
                      onClick={closeMenu}
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={closeMenu}
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Crear Cuenta
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Mostrar CurrencySelector solo si no es admin */}
                  {user?.role !== "ADMIN" && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                      <h3 className="text-xs font-semibold text-blue-700 mb-2 flex items-center">
                        <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Moneda
                      </h3>
                      <CurrencySelector />
                    </div>
                  )}
                  {/* Mostrar Mis Órdenes solo si no es admin */}
                  {user?.role !== "ADMIN" && (
                    <div className="space-y-1">
                      <Link to="/my-orders" onClick={closeMenu} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg transition-all duration-300 group">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <span>Mis Órdenes</span>
                        <svg className="h-3 w-3 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                  {/* Panel de administración solo para admin */}
                  {user?.role === "ADMIN" && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                      <h3 className="text-xs font-semibold text-purple-700 mb-2 flex items-center">
                        <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Panel de Administración
                      </h3>
                      <div className="space-y-1">
                        <Link 
                          to="/admin/products" 
                          onClick={closeMenu}
                          className="flex items-center space-x-2 px-2 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors duration-300 group"
                        >
                          <svg className="h-3 w-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Gestionar Productos</span>
                        </Link>
                        <Link 
                          to="/admin/orders" 
                          onClick={closeMenu}
                          className="flex items-center space-x-2 px-2 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100 rounded-md transition-colors duration-300 group"
                        >
                          <svg className="h-3 w-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Gestionar Órdenes</span>
                        </Link>
                      </div>
                    </div>
                  )}
                  {/* Menú de usuario móvil: ayuda y cerrar sesión */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{user?.name}</div>
                        <div className="text-xs text-slate-500">
                          {user?.role === "ADMIN" && "Administrador"}
                          {user?.role === "SALES_MANAGER" && "Gerente de Ventas"}
                          {user?.role === "USER" && "Usuario"}
                        </div>
                      </div>
                    </div>
                    <Link to="/help" onClick={closeMenu} className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-300 group">
                      <svg className="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ayuda</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-300 group"
                    >
                      <svg className="h-3 w-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Franja azul al final para simetría */}
            <div className="h-2 bg-gradient-to-r from-[#03045E] to-[#023E8A]"></div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;