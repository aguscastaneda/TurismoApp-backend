import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [productMessages, setProductMessages] = useState({});
  const auth = useAuth();

  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
      setLoading(false);
    }
  }, [auth?.isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el carrito');
      }

      const data = await response.json();
      setCart(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!auth?.isAuthenticated) {
      setError('Debes iniciar sesión para agregar productos al carrito');
      return false;
    }

    try {
      // Limpiar mensajes previos para este producto
      setProductMessages(prev => ({
        ...prev,
        [productId]: { success: null, error: null }
      }));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar al carrito');
      }

      await fetchCart();
      
      // Mostrar mensaje de éxito para este producto específico
      setProductMessages(prev => ({
        ...prev,
        [productId]: { 
          success: `¡Paquete agregado exitosamente al carrito!`, 
          error: null 
        }
      }));
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setProductMessages(prev => ({
          ...prev,
          [productId]: { success: null, error: null }
        }));
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Mostrar mensaje de error para este producto específico
      setProductMessages(prev => ({
        ...prev,
        [productId]: { 
          success: null, 
          error: error.message 
        }
      }));
      
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!auth?.isAuthenticated) {
      setError('Debes iniciar sesión para modificar el carrito');
      return;
    }

    try {
      // Primero necesitamos obtener el itemId del carrito
      const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!cartResponse.ok) {
        throw new Error('Error al obtener el carrito');
      }

      const cartData = await cartResponse.json();
      const item = cartData.items.find(item => item.productId === parseInt(productId));
      
      if (!item) {
        throw new Error('Item no encontrado en el carrito');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al remover del carrito');
      }

      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!auth?.isAuthenticated) {
      setError('Debes iniciar sesión para modificar el carrito');
      return;
    }

    try {
      // Primero necesitamos obtener el itemId del carrito
      const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!cartResponse.ok) {
        throw new Error('Error al obtener el carrito');
      }

      const cartData = await cartResponse.json();
      const item = cartData.items.find(item => item.productId === parseInt(productId));
      
      if (!item) {
        throw new Error('Item no encontrado en el carrito');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cantidad');
      }

      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
    }
  };

  const clearCart = async () => {
    if (!auth?.isAuthenticated) {
      setError('Debes iniciar sesión para modificar el carrito');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al limpiar el carrito');
      }

      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message);
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getProductMessage = (productId) => {
    return productMessages[productId] || { success: null, error: null };
  };

  const clearProductMessage = (productId) => {
    setProductMessages(prev => ({
      ...prev,
      [productId]: { success: null, error: null }
    }));
  };

  const value = {
    cart,
    loading,
    error,
    success,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    refreshCart: fetchCart,
    clearMessages: () => {
      setError(null);
      setSuccess(null);
    },
    getProductMessage,
    clearProductMessage
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 