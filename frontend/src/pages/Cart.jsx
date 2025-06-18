import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la orden');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Carrito de Compras</h1>
            <p className="text-lg text-slate-600 mb-8">
              Inicia sesión para ver tu carrito
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Carrito de Compras</h1>
          <p className="text-lg text-slate-600">
            Revisa tus paquetes seleccionados
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-8">Tu carrito está vacío</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Ver Paquetes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="p-6">
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-slate-800">{item.product.name}</h3>
                          <p className="text-slate-600">{item.product.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-lg font-medium text-slate-900">
                            ${(item.product.price * item.quantity * 1000).toLocaleString('es-AR')}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-lg font-medium text-slate-800 mb-4">Resumen del Pedido</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${(total * 1000).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Impuestos</span>
                    <span>${(total * 1000 * 0.21).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between text-lg font-medium text-slate-900">
                      <span>Total</span>
                      <span>${(total * 1000 * 1.21).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Procesando...' : 'Finalizar Compra'}
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
