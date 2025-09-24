import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SimpleGoogleLogin from "../components/SimpleGoogleLogin";
import logoPestana from "../assets/logo.png";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img4.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img2.jpg";

const images = [img1, img2, img3, img4];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 400); // duración del desvanecimiento
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

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
      if (success) navigate("/");
      else setLocalError("Error al registrar el usuario");
    } catch {
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
      if (!success) setLocalError("Error al registrarse con Google");
    } catch {
      setLocalError("Error al registrarse con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setLocalError("Error al registrarse con Google");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Fondo con dos imágenes superpuestas para transición sin espacio en blanco */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={images[currentImage]}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            fade ? "opacity-0" : "opacity-100"
          }`}
          key={currentImage}
        />
        <img
          src={images[(currentImage + 1) % images.length]}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
          key={(currentImage + 1) % images.length}
        />
      </div>

      {/* Overlay con desenfoque */}
      <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm z-10" />

      {/* Formulario */}
      <div className="relative z-20 flex items-center justify-center h-full px-4 sm:px-6">
        <div className="auth-form p-4 sm:p-6 rounded-2xl w-full max-w-sm sm:max-w-md animate-fade-in">
          <div className="text-center mb-4 sm:mb-6">
            <img
              src={logoPestana}
              alt="Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full shadow-md mb-2 sm:mb-3 object-cover"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-primary-700">Crear Cuenta</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Completá el formulario para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="input-field text-sm sm:text-base"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-5 sm:h-5 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-12 sm:pl-14 text-sm sm:text-base"
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
                Contraseña
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-5 sm:h-5 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12 sm:pl-14 pr-20 sm:pr-24 text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 text-xs sm:text-sm"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-foreground mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-5 sm:h-5 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-12 sm:pl-14 pr-20 sm:pr-24 text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 text-xs sm:text-sm"
                >
                  {showConfirmPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {localError && (
              <div className="text-red-500 text-xs sm:text-sm text-center bg-red-50 p-2 sm:p-3 rounded-lg shadow">
                {localError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm sm:text-base py-2 sm:py-3"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>

            <div className="flex items-center gap-2 sm:gap-3 my-3">
              <hr className="flex-grow border-blue-200" />
              <span className="text-xs sm:text-sm text-muted-foreground">o continúa con</span>
              <hr className="flex-grow border-blue-200" />
            </div>

            <SimpleGoogleLogin
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleError}
              buttonText="Registrarse con Google"
            />

            <div className="text-center text-xs sm:text-sm text-muted-foreground mt-3">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-primary-600 hover:underline font-medium">
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
