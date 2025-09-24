import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderManagement from "./pages/OrderManagement";
import ProductManagement from "./pages/ProductManagement";
import Help from "./pages/Help";
import ScheduleTrip from "./pages/ScheduleTrip";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, isInitialized } = useAuth();

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading, isInitialized } = useAuth();

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ManagerRoute = ({ children }) => {
  const { isAuthenticated, user, loading, isInitialized } = useAuth();

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN" && user?.role !== "SALES_MANAGER") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, loading, isInitialized } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Mostrar loading solo mientras se inicializa la autenticación
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Rutas donde no mostrar la navbar
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen gradient-bg">
      {!shouldHideNavbar && <Navbar />}
      <main className={!shouldHideNavbar ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Products />} />
          <Route path="/help" element={<Help />} />
          <Route path="/cart" element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          } />
          <Route path="/my-orders" element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          } />
          <Route path="/admin/orders" element={
            <ManagerRoute>
              <OrderManagement />
            </ManagerRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <ProductManagement />
            </AdminRoute>
          } />
          <Route path="/schedule-trip/:id" element={<ScheduleTrip />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "474698593228-58gn7dgf5635377j1f3frpht94spnp88.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <CurrencyProvider>
              <AppContent />
            </CurrencyProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
