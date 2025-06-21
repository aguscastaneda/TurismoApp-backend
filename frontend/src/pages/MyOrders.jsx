import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const { isAuthenticated } = useAuth();

  // Estados que permiten cancelación (según la lógica del backend)
  const CANCELABLE_STATUSES = [0, 1]; // PENDING, PROCESSING

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
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

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

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

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    
    const statusMap = {
      'pending': 0,
      'processing': 1,
      'completed': 2,
      'cancelled': 3
    };
    
    return orders.filter(order => order.status === statusMap[activeTab]);
  };

  const getOrderCount = (status) => {
    const statusMap = {
      'all': null,
      'pending': 0,
      'processing': 1,
      'completed': 2,
      'cancelled': 3
    };
    
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === statusMap[status]).length;
  };

  const tabs = [
    { id: 'all', label: 'Todas', count: getOrderCount('all') },
    { id: 'pending', label: 'Pendientes', count: getOrderCount('pending') },
    { id: 'processing', label: 'En Proceso', count: getOrderCount('processing') },
    { id: 'completed', label: 'Entregados', count: getOrderCount('completed') },
    { id: 'cancelled', label: 'Cancelados', count: getOrderCount('cancelled') }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Mis Órdenes</h1>
            <p className="text-lg text-slate-600 mb-8">
              Inicia sesión para ver tus órdenes
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

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Mis Órdenes</h1>
          <p className="text-lg text-slate-600">
            Historial de tus compras
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-8">No tienes órdenes aún</p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Ver Paquetes
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-8">
              No hay órdenes {activeTab !== 'all' ? `en estado "${tabs.find(t => t.id === activeTab)?.label}"` : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">
                      Orden #{order.id}
                    </h3>
                    <p className="text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-slate-800">{item.product.name}</h4>
                        <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-slate-900">
                        ${(item.product.price * item.quantity * 1000).toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-slate-800">Total</span>
                    <span className="text-xl font-bold text-slate-900">
                      ${(order.total * 1000).toLocaleString('es-AR')}
                    </span>
                  </div>
                  
                  {/* Botón de cancelación */}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
