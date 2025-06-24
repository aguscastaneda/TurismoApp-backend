import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SimpleGoogleLogin from "../components/SimpleGoogleLogin";
import logoPestania from "../assets/logo.png";


const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");


    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate("/");
      } else {
        setError("Email o contraseña incorrectos");
      }
    } catch (error) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSuccess = async (googleData) => {
    try {
      const success = await loginWithGoogle(googleData);
      if (!success) {
        setError("Error al autenticar con Google");
      }
    } catch (error) {
      setError("Error al autenticar con Google");
    }
  };


  const handleGoogleFailure = (error) => {
    setError("Error al autenticar con Google");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logoPestania}
              alt="Logo"
              className="w-20 h-20 rounded-full shadow-lg object-cover"
            />
          </div>


          <div className="relative h-12 mb-2">
            <h1 className="text-3xl font-bold text-white absolute inset-0 flex items-center justify-center transition-all duration-200">
              ¡Bienvenido de vuelta!
            </h1>
          </div>


          <div className="text-primary-200 text-sm font-medium mb-2">
            Español
          </div>


          <p className="text-primary-100">Inicia sesión en tu cuenta</p>
        </div>


        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-primary-200/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>
            </div>


            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>


            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>


            <div className="relative flex items-center">
              <div className="flex-grow border-t border-primary-300" />
              <span className="px-4 text-primary-500 text-sm">o continúa con</span>
              <div className="flex-grow border-t border-primary-300" />
            </div>


            <SimpleGoogleLogin
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleFailure}
            />


            <div className="text-center text-sm text-gray-800 mt-4">
              ¿No tenes cuenta?{" "}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                Regístrate aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default Login;




