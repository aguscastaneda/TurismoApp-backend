import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Estados que permiten cancelación (según la lógica del backend)
  const CANCELABLE_STATUSES = [0, 1]; // PENDING, PROCESSING

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar las órdenes');
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log(`Actualizando orden ${orderId} a estado ${newStatus}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: parseInt(newStatus) })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el estado');
      }

      const updatedOrder = await response.json();
      console.log('Orden actualizada:', updatedOrder);

      // Actualizar la lista de órdenes con la orden actualizada
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: parseInt(newStatus) } : order
      ));
      
      // Limpiar cualquier error previo
      setError(null);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta orden? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cancelar la orden');
      }

      const result = await response.json();
      
      // Actualizar la lista de órdenes con la orden cancelada
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 3 } // 3 = CANCELLED
          : order
      ));

      // Mostrar mensaje de éxito
      alert(result.message || 'Orden cancelada correctamente');
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.message || 'Error al cancelar la orden');
    } finally {
      setCancellingOrder(null);
    }
  };

  const canCancelOrder = (order) => {
    return CANCELABLE_STATUSES.includes(order.status);
  };

  const getStatusColor = (status) => {
    const statusNumber = typeof status === 'string' ? parseInt(status) : status;
    const colors = {
      0: 'bg-yellow-100 text-yellow-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-red-100 text-red-800'
    };
    return colors[statusNumber] || 'bg-slate-100 text-slate-800';
  };

  const getStatusText = (status) => {
    const statusNumber = typeof status === 'string' ? parseInt(status) : status;
    const statusTexts = {
      0: 'PENDIENTE',
      1: 'PROCESANDO',
      2: 'COMPLETADA',
      3: 'CANCELADA'
    };
    return statusTexts[statusNumber] || 'DESCONOCIDO';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Gestión de Órdenes</h1>
            <p className="text-lg text-slate-600 mb-8">
              Acceso no autorizado
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Gestión de Órdenes</h1>
          <p className="text-lg text-slate-600">
            Administra y actualiza el estado de las órdenes
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No hay órdenes para gestionar</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800">
                        Orden #{order.id}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Cliente: {order.user.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value={0}>Pendiente</option>
                        <option value={1}>En Proceso</option>
                        <option value={2}>Completada</option>
                        <option value={3}>Cancelada</option>
                      </select>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                        <div>
                          <p className="text-slate-800">{item.product.name}</p>
                          <p className="text-sm text-slate-600">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="text-slate-900 font-medium">
                          ${(item.product.price * item.quantity * 1000).toLocaleString('es-AR')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-600">Total</p>
                      <p className="text-lg font-bold text-slate-900">
                        ${(order.total * 1000).toLocaleString('es-AR')}
                      </p>
                    </div>
                    
                    {/* Botón de cancelación para administradores */}
                    {canCancelOrder(order) && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrder === order.id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          {cancellingOrder === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Cancelando...
                            </>
                          ) : (
                            'Cancelar Orden'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
