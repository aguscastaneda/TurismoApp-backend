import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const { isAuthenticated } = useAuth();

  const CANCELABLE_STATUSES = [0, 1]; // PENDING, PROCESSING

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/api/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.error || 'Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta orden? Esta acción no se puede deshacer.')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
     
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: 3, OrderStatus: { ...order.OrderStatus, name: 'CANCELLED' } }
          : order
      ));
      alert(response.data.message || 'Orden cancelada correctamente');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.error || 'Error al cancelar la orden');
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusClasses = (status) => {
    // Convertir número a string si es necesario
    const statusStr = typeof status === 'number' ? getStatusFromNumber(status) : status;
    
    switch (statusStr) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'UNKNOWN':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    // Convertir número a string si es necesario
    const statusStr = typeof status === 'number' ? getStatusFromNumber(status) : status;
    
    const statusTexts = {
      PENDING: 'Pendiente',
      PROCESSING: 'Procesando',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      UNKNOWN: 'Desconocido'
    };
    return statusTexts[statusStr] || 'Desconocido';
  };

  const getStatusFromNumber = (statusNumber) => {
    const statusMap = {
      0: 'PENDING',
      1: 'PROCESSING',
      2: 'COMPLETED',
      3: 'CANCELLED'
    };
    return statusMap[statusNumber] || 'UNKNOWN';
  };

  // Funcion para contar ordenes por estado
  const getOrderCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.OrderStatus?.name || order.status || order.orderStatus;
      
      // Si es un objeto con propiedades id y name, extraer el name
      if (typeof status === 'object' && status !== null && status.name) {
        const statusKey = status.name.toLowerCase();
        if (counts.hasOwnProperty(statusKey)) {
          counts[statusKey]++;
        }
      }
      
      // Si el estado es un número, convertirlo a string
      if (typeof status === 'number') {
        const statusStr = getStatusFromNumber(status).toLowerCase();
        if (counts.hasOwnProperty(statusStr)) {
          counts[statusStr]++;
        }
      }
      
      // Si es string, contar directamente
      if (typeof status === 'string') {
        const statusKey = status.toLowerCase();
        if (counts.hasOwnProperty(statusKey)) {
          counts[statusKey]++;
        }
      }
    });

    return counts;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    
    return orders.filter(order => {
      const status = order.OrderStatus?.name || order.status || order.orderStatus;
      
      // Si es un objeto con propiedades id y name, extraer el name
      if (typeof status === 'object' && status !== null && status.name) {
        return status.name.toLowerCase() === activeTab;
      }
      
      // Si el estado es un número, convertirlo a string
      if (typeof status === 'number') {
        const statusStr = getStatusFromNumber(status);
        return statusStr.toLowerCase() === activeTab;
      }
      
      // Si es string, comparar directamente (convertir a string por seguridad)
      return String(status || '').toLowerCase() === activeTab;
    });
  };
 
  const getTabButtonClasses = (tab, isActive) => {
    const baseClasses = 'px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200';
    if (!isActive) {
      return `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-800`;
    }
    switch (tab) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
      case 'completed':
        return `${baseClasses} bg-emerald-100 text-emerald-800 border-emerald-200`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
      case 'all':
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
    }
  };
 
  const TABS = ['all', 'pending', 'processing', 'completed', 'cancelled'];
 
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

  if (error && !orders.length) {
    return (
      <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error: {error}</span>
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mis Órdenes</h1>
          <p className="text-lg text-gray-600">Historial de tus compras y aventuras.</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="card p-2 flex flex-wrap justify-center gap-2">
            {TABS.map(tab => {
              const counts = getOrderCounts();
              const count = counts[tab] || 0;
              
              return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={getTabButtonClasses(tab, activeTab === tab)}
              >
                  <span>{tab === 'all' ? 'Todas' : getStatusText(tab.toUpperCase())}</span>
                  <span className="ml-2 px-2 py-1 text-xs font-bold bg-white/80 rounded-full border border-current/20">
                    {count}
                  </span>
              </button>
              );
            })}
          </div>
        </div>
       
        <div className="space-y-6">
          {getFilteredOrders().map((order) => {
            // Determinar el estado real de la orden
            let orderStatus = order.OrderStatus?.name || order.status || order.orderStatus;
            
            // Si es un objeto con propiedades id y name, extraer el name
            if (typeof orderStatus === 'object' && orderStatus !== null && orderStatus.name) {
              orderStatus = orderStatus.name;
            }
            
            // Si es número, convertirlo a string
            if (typeof orderStatus === 'number') {
              orderStatus = getStatusFromNumber(orderStatus);
            }
            
            // Si aún no tenemos un estado válido, usar UNKNOWN
            if (!orderStatus) {
              orderStatus = 'UNKNOWN';
            }
            
            return (
              <div key={order.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gradient">Orden #{order.id}</h3>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                  <div className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusClasses(orderStatus)}`}>
                    {getStatusText(orderStatus)}
                </div>
              </div>

                <div className="my-4 border-t border-gray-200"></div>

              <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <img 
                          src={item.product?.image || '/images/default.jpg'} 
                          alt={item.product?.name || 'Producto'} 
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/images/default.jpg';
                          }}
                        />
                      <div>
                          <p className="font-semibold text-gray-800">{item.product?.name || 'Producto desconocido'}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity || 0} x ${(item.price || 0).toLocaleString('es-AR')}
                        </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">${((item.quantity || 0) * (item.price || 0)).toLocaleString('es-AR')}</p>
                  </div>
                ))}
              </div>

                <div className="my-4 border-t border-gray-200"></div>

              <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">Total: <span className="text-gradient">${(order.total || 0).toLocaleString('es-AR')}</span></p>
                {CANCELABLE_STATUSES.includes(order.status) && (
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
            );
          })}
          
          {getFilteredOrders().length === 0 && (
            <div className="text-center py-16">
              <div className="mb-8">
                <svg className="h-24 w-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-600 text-lg">No tienes órdenes {activeTab === 'all' ? '' : activeTab} aún</p>
        </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;