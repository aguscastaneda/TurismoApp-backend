const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Manual de ayuda para clientes
const manualCliente = {
  titulo: "Guía de Soporte - Cliente",
  secciones: [
    {
      titulo: "Problemas Comunes",
      items: [
        {
          problema: "No puedo iniciar sesión",
          solucion: "Verifica que tu correo y contraseña sean correctos. Si usas Google, asegúrate de que tu cuenta esté activa."
        },
        {
          problema: "No puedo registrarme",
          solucion: "Asegúrate de que el correo no esté ya registrado. Usa una contraseña segura."
        },
        {
          problema: "No puedo agregar productos al carrito",
          solucion: "Verifica que hayas iniciado sesión y que el producto tenga stock disponible."
        },
        {
          problema: "No puedo finalizar la compra",
          solucion: "Asegúrate de tener productos en el carrito y que tus datos estén completos. Si el problema persiste, intenta refrescar la página o contacta soporte."
        },
        {
          problema: "No recibo emails de confirmación",
          solucion: "Revisa tu carpeta de spam o correo no deseado. Si no llega el email, espera unos minutos o contacta soporte."
        },
        {
          problema: "La página no carga correctamente",
          solucion: "Intenta refrescar la página, limpiar la caché del navegador o usar otro navegador."
        }
      ]
    },
    {
      titulo: "Cómo Usar la Aplicación",
      items: [
        {
          titulo: "Navegación",
          descripcion: "Usa el menú superior para navegar entre las diferentes secciones. El carrito muestra la cantidad de productos agregados."
        },
        {
          titulo: "Búsqueda de Productos",
          descripcion: "Los productos están organizados por destinos. Puedes ver detalles, precios y disponibilidad."
        },
        {
          titulo: "Proceso de Compra",
          descripcion: "1. Agrega productos al carrito 2. Revisa tu carrito 3. Completa el pago 4. Recibe confirmación"
        }
      ]
    },
    {
      titulo: "Información de Contacto",
      items: [
        {
          titulo: "Soporte Técnico",
          descripcion: "Email: olimpiadas2025fragata@gmail.com"
        },
        {
          titulo: "Horarios de Atención",
          descripcion: "Lunes a Viernes: 9:00 - 18:00"
        }
      ]
    }
  ]
};

// Manual de ayuda para administradores
const manualAdmin = {
  titulo: "Guía de Soporte - Administrador",
  secciones: [
    {
      titulo: "Problemas Comunes",
      items: [
        {
          problema: "No puedo crear un producto",
          solucion: "Asegúrate de completar todos los campos requeridos. No uses comas en el precio, solo puntos para decimales (ej: 1234.56)."
        },
        {
          problema: "No puedo actualizar un producto",
          solucion: "Verifica que el producto exista y que los datos sean válidos."
        },
        {
          problema: "No puedo ver las órdenes",
          solucion: "Asegúrate de tener permisos de administrador o manager."
        },
        {
          problema: "No puedo cambiar el estado de una orden",
          solucion: "Solo los administradores y managers pueden cambiar el estado de las órdenes."
        },
        {
          problema: "No puedo eliminar un producto",
          solucion: "Verifica que el producto no esté asociado a órdenes activas."
        },
        {
          problema: "No puedo acceder a la gestión de productos",
          solucion: "Debes tener rol ADMIN para acceder a esta sección."
        }
      ]
    },
    {
      titulo: "Funciones de Administración",
      items: [
        {
          titulo: "Gestión de Productos",
          descripcion: "Puedes crear, editar y eliminar productos. Cada producto debe tener nombre, descripción, precio y stock."
        },
        {
          titulo: "Gestión de Órdenes",
          descripcion: "Revisa y actualiza el estado de las órdenes. Los estados disponibles son: Pendiente, Confirmada, En Proceso, Enviada, Entregada, Cancelada."
        },
        {
          titulo: "Estadísticas",
          descripcion: "Monitorea las ventas y el rendimiento de la aplicación desde el panel de administración."
        }
      ]
    },
    {
      titulo: "Información de Contacto",
      items: [
        {
          titulo: "Soporte Técnico",
          descripcion: "Email: olimpiadas2025fragata@gmail.com"
        }
      ]
    }
  ]
};

// Obtener manual de ayuda según el rol del usuario
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role === "ADMIN") {
      res.json(manualAdmin);
    } else {
      res.json(manualCliente);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el manual de ayuda" });
  }
});

// Obtener manual de ayuda sin autenticación (para usuarios no logueados)
router.get('/public', async (req, res) => {
  try {
    res.json(manualCliente);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el manual de ayuda" });
  }
});

module.exports = router; 