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
      0: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      1: 'bg-blue-100 text-blue-800 border-blue-200',
      2: 'bg-green-100 text-green-800 border-green-200',
      3: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[statusNumber] || 'bg-slate-100 text-slate-800 border-slate-200';
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
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <svg className="h-24 w-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
            <p className="text-lg text-gray-600 mb-8">
              No tienes permisos para acceder a esta página
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-700">Solo los administradores pueden gestionar órdenes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Error: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Gestión de Órdenes</h1>
          <p className="text-lg text-gray-600">
            Administra y actualiza el estado de las órdenes de los clientes
          </p>
        </div>

          <div className="space-y-6">
            {orders.map((order) => (
            <div key={order.id} className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-2xl font-bold text-gradient">Orden #{order.id}</h3>
                    <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span><strong>Cliente:</strong> {order.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span><strong>Total:</strong> ${order.total?.toLocaleString('es-AR') || '0'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                      </svg>
                      <span><strong>Items:</strong> {order.items?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Creada:</strong> {formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                    </div>
                  </div>

              {/* Items de la orden */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Productos</h4>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={item.product?.image || '/images/default.jpg'} 
                          alt={item.product?.name || 'Producto'} 
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/images/default.jpg';
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{item.product?.name || 'Producto desconocido'}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} x ${item.price?.toLocaleString('es-AR') || '0'}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${((item.quantity || 0) * (item.price || 0)).toLocaleString('es-AR')}
                      </p>
                  </div>
                  ))}
                </div>
              </div>

              {/* Controles de administración */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Cambiar estado:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Pendiente</option>
                    <option value={1}>Procesando</option>
                    <option value={2}>Completada</option>
                    <option value={3}>Cancelada</option>
                  </select>
                    </div>
                    
                <div className="flex space-x-3">
                    {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrder === order.id}
                      className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                      {cancellingOrder === order.id ? 'Cancelando...' : 'Cancelar Orden'}
                        </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {orders.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-8">
                <svg className="h-24 w-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 text-lg">No hay órdenes para gestionar</p>
                <p className="text-gray-500 text-sm mt-2">Las órdenes aparecerán aquí cuando los clientes realicen compras</p>
              </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
