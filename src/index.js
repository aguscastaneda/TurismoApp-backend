require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});
