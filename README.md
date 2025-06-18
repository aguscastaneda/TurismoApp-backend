# Turismo App

Una plataforma de comercio electronico desarrollada con React, Node.js y Prisma.

## Caracteristicas

- Autenticacion de usuarios (registro, login, sesion persistente)
- Gestion de productos (CRUD)
- Carrito de compras
- Proceso de checkout
- Integracion con MercadoPago
- Panel de administracion
- Gestion de ordenes

## Tecnologias Utilizadas

### Frontend
- React
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express
- Prisma (ORM)
- MySQL
- JWT para autenticacion
- MercadoPago SDK

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL
- Cuenta de MercadoPago (para pagos)

## Instalacion

1. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

1. Configurar variables de entorno:
   - Crear archivo .env en la carpeta backend con las siguientes variables:
   ```
   DATABASE_URL="mysql://root:123456@localhost:3306/olimpiadas"
   JWT_SECRET="claveJWTolimpiadas"
   PORT=3000
   MERCADOPAGO_ACCESS_TOKEN="TEST-3613698802231358-061221-64301f5efdde18544bc536238ed1b58e-278776399"
   BACKEND_URL="http://localhost:3000"
   FRONTEND_URL="http://localhost:5173"
   ```

2. Ejecutar migraciones de la base de datos:
```bash
cd backend
npx prisma migrate dev
```

## Ejecucion

1. Iniciar el backend:
```bash
cd backend
npm run dev
```

2. Iniciar el frontend:
```bash
cd frontend
npm run dev
```

## Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── App.jsx
    └── package.json
```

## Roles de Usuario

- CLIENT: Usuario regular que puede comprar productos
- SALES_MANAGER: Administrador que puede gestionar productos y ordenes

## Base de datos

La base de datos que utiliza el sistema se llama @olimpiadas.sql" y esta ubicada en:
"C:\Users\agust\OneDrive\Documentos"

## Code para commitear 

cd "/c/Users/agust/OneDrive/Escritorio/olimpiadaas"
git status
git add .
git commit -m ""
git pull
git push
