<<<<<<< HEAD
# Turismo App: Plataforma de Comercio Electrónico de Viajes

¡Bienvenido a la experiencia definitiva para la gestión y compra de paquetes turísticos! Este sistema fusiona la potencia de React, Node.js, Prisma y MySQL para ofrecer una solución robusta, segura y escalable, pensada tanto para usuarios finales como para administradores exigentes.

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura y Módulos](#arquitectura-y-módulos)
- [Tecnologías Empleadas](#tecnologías-empleadas)
- [Instalación Paso a Paso](#instalación-paso-a-paso)
- [Ejecución y Despliegue](#ejecución-y-despliegue)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Roles y Permisos](#roles-y-permisos)
- [Advertencias y Buenas Prácticas](#advertencias-y-buenas-prácticas)
- [Detalles Técnicos Clave](#detalles-técnicos-clave)

---

## Descripción General

Esta plataforma permite a los usuarios explorar, seleccionar y adquirir paquetes turísticos, gestionando su carrito y órdenes con total transparencia. Los administradores pueden controlar productos, monitorear ventas y modificar estados de pedidos, todo desde un panel centralizado. La integración con MercadoPago garantiza transacciones seguras y ágiles.

## Arquitectura y Módulos

### 1. **Gestión de Usuarios**
- **Registro y Autenticación:** Soporta registro tradicional y autenticación mediante Google. Las contraseñas se almacenan cifradas y los tokens JWT aseguran sesiones protegidas.
- **Perfil:** Los usuarios pueden consultar y actualizar su información personal.
- **Roles:** Diferenciación clara entre clientes y administradores de ventas.

### 2. **Gestión de Productos**
- **CRUD Completo:** Los administradores pueden crear, leer, actualizar y eliminar productos turísticos. Cada producto incluye nombre, descripción, precio y stock.
- **Validaciones:** Control estricto de datos y stock para evitar inconsistencias.

### 3. **Carrito de Compras**
- **Persistencia:** Cada usuario posee un carrito único, donde puede agregar, modificar o eliminar productos.
- **Cálculo Dinámico:** El total se actualiza automáticamente según los productos y cantidades seleccionadas.
- **Control de Stock:** No permite agregar más productos de los disponibles.

### 4. **Órdenes y Pagos**
- **Checkout Seguro:** El usuario puede convertir su carrito en una orden, calculando impuestos y generando un pago a través de MercadoPago.
- **Estados de Orden:** Seguimiento detallado (pendiente, procesando, completada, cancelada). Los administradores pueden modificar el estado y los usuarios cancelar si corresponde.
- **Notificaciones:** Envío automático de correos electrónicos ante la creación y actualización de órdenes.

### 5. **Gestión de Monedas**
- **Conversión en Tiempo Real:** Consulta tasas de cambio actualizadas (o simuladas en desarrollo) y permite mostrar precios en múltiples monedas.
- **API Externa:** Integración con Fixer.io para tasas reales; fallback a valores simulados si no hay API key.

## Tecnologías Empleadas

### Frontend
- **React**: Interfaz de usuario dinámica y responsiva.
- **React Router**: Navegación fluida entre páginas.
- **Axios**: Comunicación eficiente con el backend.
- **Tailwind CSS**: Estilos modernos y personalizables.

### Backend
- **Node.js + Express**: Servidor robusto y escalable.
- **Prisma ORM**: Acceso seguro y tipado a la base de datos.
- **MySQL**: Almacenamiento confiable de datos.
- **JWT**: Autenticación segura.
- **MercadoPago SDK**: Procesamiento de pagos.

## Instalación Paso a Paso

### 1. **Requisitos Previos**
- Node.js v14 o superior
- MySQL en funcionamiento
- Cuenta de MercadoPago (para pruebas y producción)

### 2. **Clonar el Repositorio**
```bash
git clone https://github.com/aguscastaneda/TurismoApp.git
cd olimpiadaas
```

### 3. **Instalar Dependencias**
- **Frontend:**
  ```bash
  cd frontend
  npm install
  ```
- **Backend:**
  ```bash
  cd ../backend
  npm install
  ```

### 4. **Configurar Variables de Entorno**
Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido (ajusta los valores según tu entorno):
```
# Base de datos
DATABASE_URL="mysql://root:123456@localhost:3306/olimpiadas"

# JWT
JWT_SECRET="claveJWTolimpiadas"

# Server
PORT=3000

# MP
MERCADOPAGO_ACCESS_TOKEN="TEST-3613698802231358-061221-64301f5efdde18544bc536238ed1b58e-278776399"

# URLs
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# Google OAuth
GOOGLE_CLIENT_ID="939073150864-bbs064pgmjpt79hivp1176cuaj098dq7.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# Email
EMAIL_USER="olimpiadas2025fragata@gmail.com"
EMAIL_PASSWORD="iqsa lynr qkbi gehl"

# Fixer API
FIXER_API_KEY="26b2e203275b8d6d253c1fa72dbc0890"

```
Crea un archivo `.env` en la carpeta `frontend` con el siguiente contenido:
```

# API URL
VITE_API_URL="http://localhost:3000"

# Auth0 (manteniendo las que ya tenías)
VITE_AUTH0_DOMAIN="dev-nh11shh2k7v6aua4.us.auth0.com"
VITE_AUTH0_CLIENT_ID="CrfePy5ouTcybv7gNMI8oLT3VNQRjl1x"

# OpenWeather (manteniendo las que ya tenías)
VITE_OPENWEATHER_API_KEY="90a7f4f6399f32cc88079e3020d25066"

```

### 5. **Migrar la Base de Datos**
```bash
npx prisma migrate dev
```

## Ejecución y Despliegue

### 1. **Iniciar el Backend**
```bash
cd backend
npm run dev
```

### 2. **Iniciar el Frontend**
```bash
cd frontend
npm run dev
```

Accede a la aplicación desde [http://localhost:5173](http://localhost:5173)

## Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio (usuarios, productos, órdenes, monedas, carrito)
│   │   ├── middleware/       # Autenticación y control de roles
│   │   ├── routes/           # Definición de endpoints
│   │   ├── app.js            # Configuración principal de Express
│   │   └── index.js          # Punto de entrada del backend
│   ├── prisma/
│   │   └── schema.prisma     # Definición del modelo de datos
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # Componentes visuales reutilizables
    │   ├── context/          # Contextos globales (auth, carrito, moneda)
    │   ├── pages/            # Vistas principales (login, productos, carrito, órdenes)
    │   └── App.jsx           # Componente raíz
    └── package.json
```

## Roles y Permisos

- **CLIENT:** Usuario que puede explorar productos, gestionar su carrito y realizar compras.
- **SALES_MANAGER:** Administrador con privilegios para crear, modificar y eliminar productos, así como gestionar todas las órdenes.

## Advertencias y Buenas Prácticas
- **No compartas tu JWT_SECRET ni tokens de MercadoPago en repositorios públicos.**
- **Asegúrate de tener la base de datos MySQL activa antes de iniciar el backend.**
- **Utiliza variables de entorno para credenciales y claves sensibles.**
- **Realiza migraciones solo en entornos controlados para evitar pérdida de datos.**
- **Configura correctamente los orígenes permitidos (CORS) si despliegas en producción.**

## Detalles Técnicos Clave
- **Autenticación:** Basada en JWT, con expiración de 2 horas por sesión.
- **Pagos:** Integración directa con MercadoPago, manejo de webhooks y actualización automática de estados de orden.
- **Conversión de Moneda:** Cacheo inteligente de tasas para minimizar llamadas externas y fallback a valores simulados en desarrollo.
- **Notificaciones:** Envío de emails automáticos ante eventos críticos (creación y actualización de órdenes).
- **Control de Stock:** Validación estricta para evitar sobreventa de productos.

---

=======
# TurismoApp
>>>>>>> 9538bc48d3c0984d605eae4d7f84bc3758494c5c
