import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SimpleGoogleLogin from "../components/SimpleGoogleLogin";
import logoPestania from "../assets/logo.png";




const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();




  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    if (localError) {
      setLocalError("");
    }
  }, []);




  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (localError) {
      setLocalError("");
    }
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");




    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError("Todos los campos son requeridos");
      setLoading(false);
      return;
    }




    if (formData.password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }




    if (formData.password !== formData.confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }




    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
     
      if (success) {
        navigate("/");
      } else {
        setLocalError("Error al registrar el usuario");
      }
    } catch (error) {
      setLocalError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };




  const handleGoogleSuccess = async (googleData) => {
    setLoading(true);
    setLocalError("");
    try {
      const success = await loginWithGoogle(googleData);
      if (!success) {
        setLocalError("Error al registrarse con Google");
      }
    } catch (error) {
      setLocalError("Error al registrarse con Google");
    } finally {
      setLoading(false);
    }
  };




  const handleGoogleError = (error) => {
    setLocalError("Error al registrarse con Google");
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
          <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-primary-200 text-sm">Completá el formulario para registrarte</p>
        </div>




        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-primary-200/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-primary-800 mb-2">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                placeholder="Tu nombre completo"
                required
              />
            </div>




            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary-800 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>




            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary-800 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                placeholder="••••••••"
                required
              />
            </div>




            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary-800 mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                placeholder="••••••••"
                required
              />
            </div>




            {localError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {localError}
              </div>
            )}




            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-300 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>




            <div className="relative flex items-center">
              <div className="flex-grow border-t border-primary-300" />
              <span className="px-4 text-primary-500 text-sm">o regístrate con</span>
              <div className="flex-grow border-t border-primary-300" />
            </div>




            <SimpleGoogleLogin
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleError}
              buttonText="Registrarse con Google"
            />




            <div className="text-center text-sm text-primary-800 mt-4">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-primary-400 hover:text-primary-500 font-semibold transition-colors">
                Iniciá sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};




export default Register;
  