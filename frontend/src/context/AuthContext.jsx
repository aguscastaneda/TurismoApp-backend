import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect, logout: auth0Logout } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            `${API_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Error al verificar la sesión:", error);
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          const userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const response = await axios.post(`${API_URL}/api/auth/google`, {
            email: userInfo.data.email,
            name: userInfo.data.name,
            googleId: userInfo.data.sub
          });

          const { token: jwtToken, user: userData } = response.data;
          localStorage.setItem("token", jwtToken);
          setUser(userData);
          navigate("/");
        } catch (error) {
          console.error("Error en autenticación con Google:", error);
          navigate("/login");
        }
      }
    };

    handleGoogleAuth();
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        userData
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return true;
    } catch (error) {
      console.error("Error en registro:", error);
      return false;
    }
  };

  const loginWithGoogle = () => {
    loginWithRedirect({
      appState: { returnTo: window.location.origin }
    });
  };

  const logout = () => {
    if (isAuthenticated) {
      auth0Logout({
        returnTo: window.location.origin
      });
    }
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const Auth0ProviderWithConfig = ({ children }) => {
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
    console.error("Auth0 configuration is missing. Please check your environment variables.");
    return children;
  }

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: `https://${AUTH0_DOMAIN}/api/v2/`,
        scope: "openid profile email"
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </Auth0Provider>
  );
};
