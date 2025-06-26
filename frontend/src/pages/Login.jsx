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


const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(false);
  const { login, loginWithGoogle } = useAuth();
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
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const success = await login(formData.email, formData.password);
      if (success) navigate("/");
      else setError("Email o contraseña incorrectos");
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSuccess = async (googleData) => {
    try {
      const success = await loginWithGoogle(googleData);
      if (!success) setError("Error al autenticar con Google");
    } catch {
      setError("Error al autenticar con Google");
    }
  };


  const handleGoogleFailure = () => setError("Error al autenticar con Google");


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
      <div className="relative z-20 flex items-center justify-center h-full px-4">
        <div className="auth-form p-6 rounded-2xl w-full max-w-md animate-fade-in">
          <div className="text-center mb-4">
            <img
              src={logoPestana}
              alt="Logo"
              className="w-16 h-16 mx-auto rounded-full shadow-md mb-2 object-cover"
            />
            <h1 className="text-2xl font-bold text-primary-700">¡Bienvenido de vuelta!</h1>
            <p className="text-sm text-muted-foreground mt-1">Inicia sesión en tu cuenta</p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>
            </div>


            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1">
                Contraseña
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500"
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 text-sm"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>


            {/* Error */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg shadow">
                {error}
              </div>
            )}


            {/* Botón */}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>


            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <hr className="flex-grow border-blue-200" />
              <span className="text-sm text-muted-foreground">o continúa con</span>
              <hr className="flex-grow border-blue-200" />
            </div>


            <SimpleGoogleLogin onSuccess={handleGoogleSuccess} onFailure={handleGoogleFailure} />


            <div className="text-center text-sm text-muted-foreground mt-3">
              ¿No tenés cuenta?{" "}
              <Link to="/register" className="text-primary-600 hover:underline font-medium">
                Registrate aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default Login;
