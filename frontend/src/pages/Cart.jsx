import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { convertPrice, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const customTrips = JSON.parse(localStorage.getItem('customTrips') || '{}');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            ...customTrips[item.productId]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la orden');
      }

      const data = await response.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }

      clearCart();
      navigate('/my-orders');
    } catch (error) {
      console.error('Error during checkout:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <svg className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Carrito de Compras</h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Inicia sesión para ver tu carrito
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Carrito de Compras</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Revisa tus paquetes seleccionados
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 text-red-700">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="mb-6 sm:mb-8">
              <svg className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">Tu carrito está vacío</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3"
            >
              Ver Paquetes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Productos en el carrito</h2>
                  <div className="space-y-4 sm:space-y-6">
                    {cart.map((item) => {
                      let customTrips = {};
                      try { customTrips = JSON.parse(localStorage.getItem('customTrips') || '{}'); } catch {}
                      const config = customTrips[item.productId];
                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-medium text-gray-800">{item.product.name}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">{item.product.description}</p>
                            {config && (
                              <div className="mt-2 text-xs sm:text-sm text-gray-700">
                                <div><span className="font-semibold">Fecha de ida:</span> {config.fechaIda} <span className="ml-2 font-semibold">Horario:</span> {config.horaIda}</div>
                                <div><span className="font-semibold">Fecha de regreso:</span> {config.fechaVuelta} <span className="ml-2 font-semibold">Horario:</span> {config.horaVuelta}</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-gray-700 font-semibold mb-1">Personas</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
                                >
                                  -
                                </button>
                                <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 min-w-[80px] sm:min-w-[120px] text-right">
                              {formatPrice(convertPrice(item.product.price, 'USD') * item.quantity)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-600 hover:text-red-700 transition-colors duration-200 p-1"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card p-4 sm:p-6 lg:sticky lg:top-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Resumen del Pedido</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(convertPrice(total, 'USD'))}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Impuestos (21%)</span>
                    <span>{formatPrice(convertPrice(total * 0.21, 'USD'))}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span className="text-gradient">{formatPrice(convertPrice(total * 1.21, 'USD'))}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-sm sm:text-base py-2 sm:py-3"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      'Finalizar Compra'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
