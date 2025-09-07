const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const helpRoutes = require("./routes/helpRoutes");
const { connectRabbitMQ } = require("./config/rabbitmq");

const app = express();

// Inicializar conexiones
async function initializeConnections() {
  try {
    console.log('🔄 Inicializando conexiones...');
    
    // Conectar RabbitMQ
    await connectRabbitMQ();
    
    console.log('✅ Todas las conexiones inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error inicializando conexiones:', error);
    // No salir del proceso, continuar sin las conexiones
    console.log('⚠️ Continuando sin RabbitMQ (modo degradado)');
  }
}

// Inicializar conexiones al arrancar
initializeConnections();

// CORS configuration
const corsOptions = {
  origin: [
    "https://turismo21.site",
    "https://www.turismo21.site",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token',
    'Origin',
    'Accept',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Rutas
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/help", helpRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: "Algo salio mal!", 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
