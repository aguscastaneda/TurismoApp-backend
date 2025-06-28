const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const helpRoutes = require("./routes/helpRoutes");

const app = express();

// CORS configuration

app.use(cors({
  origin: ['https://turismo21.site', 'https://www.turismo21.site'], // tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // si usás cookies o auth
}));


// Middleware
// app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  console.log('Headers:', req.headers);
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

// Simple test endpoint without database
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'Pong!', 
    timestamp: new Date().toISOString(),
    cors: 'Working'
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
