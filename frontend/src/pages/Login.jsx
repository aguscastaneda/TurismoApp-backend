import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SimpleGoogleLogin from "../components/SimpleGoogleLogin";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-50"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h1 className="text-3xl font-bold text-slate-800">TurismoApp</h1>
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border">
            <Link to="/login">
              <button className="text-slate-600 hover:text-slate-800 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200">
                Iniciar Sesión
              </button>
            </Link>
            <span className="text-slate-400">/</span>
            <Link to="/register">
              <button className="text-slate-600 hover:text-slate-800 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200">
                Registrarse
              </button>
            </Link>
          </div>
        </div>

        {/* Contenido centrado */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-xl p-8">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Iniciar Sesión</h2>
                <p className="text-slate-600">
                  Ingresa tus credenciales para acceder a tu cuenta
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-slate-700 font-medium block">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-slate-700 font-medium block">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>

                <SimpleGoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onFailure={handleGoogleFailure}
                  buttonText="Continuar con Google"
                />

                <div className="text-center text-sm text-slate-600">
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                    Regístrate
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
