import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { handleImageError } from '../utils/imageUtils';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend, ResponsiveContainer as PieResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, Legend as LineLegend, ResponsiveContainer as LineResponsiveContainer } from 'recharts';

const TABS = ['all', 'pending', 'processing', 'completed', 'cancelled'];

const getStatusFromNumber = (statusNumber) => {
  const statusMap = {
    0: 'pending',
    1: 'processing',
    2: 'completed',
    3: 'cancelled'
  };
  return statusMap[statusNumber] || 'unknown';
};

const getStatusText = (status) => {
  const statusTexts = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completada',
    cancelled: 'Cancelada',
    unknown: 'Desconocido'
  };
  return statusTexts[status] || 'Desconocido';
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-slate-100 text-slate-800 border-slate-200'
  };
  return colors[status] || colors.unknown;
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Estados que permiten cancelación (según la lógica del backend)
  const CANCELABLE_STATUSES = [0, 1]; // PENDING, PROCESSING

  // Colores para los estados en los gráficos
  const STATUS_COLORS = {
    pending: '#FACC15', // amarillo
    processing: '#3B82F6', // azul
    completed: '#22C55E', // verde
    cancelled: '#EF4444', // rojo
  };

  // Definir los estados para los gráficos
  const estados = ['pending', 'processing', 'completed', 'cancelled'];

  // Datos para el PieChart
  const pieData = [
    { name: 'Pendiente', value: orders.filter(o => getStatusFromNumber(o.status) === 'pending').length, color: STATUS_COLORS.pending },
    { name: 'Procesando', value: orders.filter(o => getStatusFromNumber(o.status) === 'processing').length, color: STATUS_COLORS.processing },
    { name: 'Completada', value: orders.filter(o => getStatusFromNumber(o.status) === 'completed').length, color: STATUS_COLORS.completed },
    { name: 'Cancelada', value: orders.filter(o => getStatusFromNumber(o.status) === 'cancelled').length, color: STATUS_COLORS.cancelled },
  ];

  // Agrupar órdenes por día para el LineChart (últimos 7 días)
  function getDay(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }
  // Generar los últimos 7 días (rolling window)
  const today = new Date();
  today.setHours(0,0,0,0);
  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    return d.toISOString().slice(0,10);
  });
  // Construir datos para el gráfico de líneas por día
  const lineData = days.map(day => {
    const data = { day };
    estados.forEach(status => {
      data[status] = orders.filter(o => getDay(o.createdAt) === day && getStatusFromNumber(o.status) === status).length;
    });
    data['all'] = orders.filter(o => getDay(o.createdAt) === day).length;
    return data;
  });
  const [lineStatus, setLineStatus] = useState('all');

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
        method: 'PUT',
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
        method: 'PUT',
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para contar órdenes por estado
  const getOrderCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };
    orders.forEach(order => {
      const status = getStatusFromNumber(order.status);
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });
    return counts;
  };

  // Filtrar órdenes según el tab activo
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => getStatusFromNumber(order.status) === activeTab);
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen gradient-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <svg className="h-16 w-16 sm:h-24 sm:w-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">
              No tienes permisos para acceder a esta página
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 max-w-md mx-auto">
              <p className="text-red-700 text-sm sm:text-base">Solo los administradores pueden gestionar órdenes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-6 text-red-700 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <svg className="h-4 w-4 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-sm sm:text-base">Error: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Gestión de Órdenes</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-8">
            Administra y actualiza el estado de las órdenes de los clientes
          </p>
        </div>
        {/* Gráficos de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* PieChart a la izquierda */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 text-gray-700">Órdenes por Estado</h2>
            <PieResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip />
                <PieLegend />
              </PieChart>
            </PieResponsiveContainer>
          </div>
          {/* LineChart a la derecha */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 text-gray-700">Órdenes por Día (últimos 7 días)</h2>
            <div className="mb-2 flex flex-wrap gap-2 justify-center">
              <button onClick={() => setLineStatus('all')} className={`px-2 py-1 rounded ${lineStatus==='all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Todos</button>
              {estados.map(status => (
                <button key={status} onClick={() => setLineStatus(status)} className={`px-2 py-1 rounded ${lineStatus===status ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{getStatusText(status)}</button>
              ))}
            </div>
            <LineResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickFormatter={d => d.slice(5).replace('-', '/')} />
                <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} interval={0} tickCount={6} tick={{fontSize: 12}} tickFormatter={v => (v % 5 === 0 ? v : '')} />
                <LineTooltip />
                <LineLegend />
                <Line type="monotone" dataKey={lineStatus} stroke={lineStatus==='all' ? '#6366F1' : STATUS_COLORS[lineStatus]} strokeWidth={3} dot />
              </LineChart>
            </LineResponsiveContainer>
          </div>
        </div>
        {/* Tabs de estado */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="card p-2 flex flex-wrap justify-center gap-1 sm:gap-2">
            {TABS.map(tab => {
              const counts = getOrderCounts();
              const count = counts[tab] || 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === tab ? getStatusColor(tab) : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                >
                  <span>{tab === 'all' ? 'Todas' : getStatusText(tab)}</span>
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold bg-white/80 rounded-full border border-current/20">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {getFilteredOrders().map((order) => (
            <div key={order.id} className="card p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3 sm:mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gradient">Orden #{order.id}</h3>
                    <span className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border ${getStatusColor(getStatusFromNumber(order.status))}`}>
                      {getStatusText(getStatusFromNumber(order.status))}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span><strong>Cliente:</strong> {order.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span><strong>Total:</strong> ${order.total?.toLocaleString('es-AR') || '0'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                      </svg>
                      <span><strong>Items:</strong> {order.items?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Creada:</strong> {formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items de la orden */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Productos</h4>
                <div className="space-y-2 sm:space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img 
                          src={item.product?.image || '/images/bariloche.jpg'} 
                          alt={item.product?.name || 'Producto'} 
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                          onError={handleImageError}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.product?.name || 'Producto desconocido'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {item.quantity} x ${item.price?.toLocaleString('es-AR') || '0'}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        ${((item.quantity || 0) * (item.price || 0)).toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controles de administración */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Cambiar estado:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Pendiente</option>
                    <option value={1}>Procesando</option>
                    <option value={2}>Completada</option>
                    <option value={3}>Cancelada</option>
                  </select>
                </div>
                
                <div className="flex space-x-2 sm:space-x-3">
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                      className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
                    >
                      {cancellingOrder === order.id ? 'Cancelando...' : 'Cancelar Orden'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {getFilteredOrders().length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="mb-6 sm:mb-8">
                <svg className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-600 text-base sm:text-lg">No hay órdenes {activeTab === 'all' ? '' : getStatusText(activeTab)} aún</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
