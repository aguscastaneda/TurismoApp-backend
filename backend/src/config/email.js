const nodemailer = require("nodemailer");

// Configuracion del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: false,
  port: 587,
  requireTLS: true,
  debug: true,
  logger: true
});

// Funcion para enviar correo de verificacion
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verifica tu correo electronico",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px; font-size: 28px; font-weight: 300;">Verifica tu Email</h2>
          <p style="text-align: center; color: #666; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
            Gracias por registrarte. Para completar tu verificación, ingresa el siguiente código:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
          </div>
          
          <p style="text-align: center; color: #888; font-size: 14px; margin-top: 30px;">
            ⏰ Este código expirará en 10 minutos
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};

// Funcion para enviar correo de compra exitosa
const sendPurchaseEmail = async (email, orderDetails) => {
  // Crear tabla HTML con los items
  const itemsTable = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.product ? item.product.name : item.name}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">$${(item.price * 1000).toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "¡Compra exitosa! - TurismoApp",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px; font-size: 28px; font-weight: 300;">¡Compra Exitosa!</h2>
          <p style="text-align: center; color: #6b7280; margin-bottom: 40px; font-size: 16px;">Tu orden ha sido procesada correctamente</p>
          
          <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px;">Detalles de la Orden</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <strong style="color: #6b7280; font-size: 14px;">Número de orden:</strong><br>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">#${orderDetails.id}</span>
              </div>
              <div>
                <strong style="color: #6b7280; font-size: 14px;">Fecha:</strong><br>
                <span style="color: #374151; font-size: 14px;">${new Date(orderDetails.createdAt || orderDetails.date).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>

          <h3 style="color: #374151; margin: 30px 0 20px 0; font-size: 18px;">Productos Adquiridos</h3>
          <div style="background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 15px; text-align: left; color: #374151; font-weight: 600; font-size: 14px;">Producto</th>
                  <th style="padding: 15px; text-align: center; color: #374151; font-weight: 600; font-size: 14px;">Cantidad</th>
                  <th style="padding: 15px; text-align: right; color: #374151; font-weight: 600; font-size: 14px;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
          </div>

          <div style="background-color: #2563eb; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; color: white;">
              <span style="font-size: 18px; font-weight: 500;">Total:</span>
              <span style="font-size: 22px; font-weight: bold;">$${(orderDetails.total * 1000).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <p style="text-align: center; color: #6b7280; margin-top: 30px; font-size: 16px; line-height: 1.6;">
            Puedes ver el estado de tu orden en tu perfil de usuario.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de compra exitosa enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("Error al enviar correo de compra:", error);
    return false;
  }
};

// Funcion para enviar correo de actualizacion de estado
const sendOrderStatusUpdateEmail = async (email, orderDetails, newStatus) => {
  const statusTexts = {
    0: 'PENDIENTE',
    1: 'EN PROCESO',
    2: 'COMPLETADA',
    3: 'CANCELADA'
  };

  const statusColors = {
    0: '#f59e0b', // amarillo
    1: '#3b82f6', // azul
    2: '#10b981', // verde
    3: '#ef4444'  // rojo
  };

  const statusIcons = {
    0: '⏳',
    1: '🔄',
    2: '✅',
    3: '❌'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Actualización de orden #${orderDetails.id} - TurismoApp`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px; font-size: 28px; font-weight: 300;">Actualización de Orden</h2>
          <p style="text-align: center; color: #6b7280; margin-bottom: 40px; font-size: 16px;">Tu orden ha sido actualizada</p>
          
          <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px;">Detalles de la Orden</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <strong style="color: #6b7280; font-size: 14px;">Número de orden:</strong><br>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">#${orderDetails.id}</span>
              </div>
              <div>
                <strong style="color: #6b7280; font-size: 14px;">Fecha:</strong><br>
                <span style="color: #374151; font-size: 14px;">${new Date(orderDetails.createdAt || orderDetails.date).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div style="grid-column: 1 / -1;">
                <strong style="color: #6b7280; font-size: 14px;">Total:</strong><br>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">$${(orderDetails.total * 1000).toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          <div style="background-color: ${statusColors[newStatus]}15; border: 2px solid ${statusColors[newStatus]}; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 15px;">${statusIcons[newStatus]}</div>
            <h3 style="color: ${statusColors[newStatus]}; margin: 0; font-size: 20px; font-weight: 600;">Nuevo Estado: ${statusTexts[newStatus]}</h3>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">
              ${newStatus === 0 ? 'Tu orden está siendo revisada' : 
                newStatus === 1 ? 'Tu orden está siendo procesada' :
                newStatus === 2 ? '¡Tu orden ha sido completada!' :
                'Tu orden ha sido cancelada'}
            </p>
          </div>

          <p style="text-align: center; color: #6b7280; margin-top: 30px; font-size: 16px; line-height: 1.6;">
            Puedes ver más detalles de tu orden en tu perfil de usuario.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de actualización de estado enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("Error al enviar correo de actualización:", error);
    return false;
  }
};

// Funcion para enviar correo de orden creada
const sendOrderCreatedEmail = async (email, orderDetails) => {
  // Crear tabla HTML con los items
  const itemsTable = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.product ? item.product.name : item.name}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">$${(item.price * 1000).toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Orden creada - TurismoApp",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px; font-size: 28px; font-weight: 300;">¡Orden Creada!</h2>
          <p style="text-align: center; color: #6b7280; margin-bottom: 40px; font-size: 16px;">Tu orden está pendiente de pago</p>
          
          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 15px;">⚠️</div>
            <h3 style="color: #d97706; margin: 0; font-size: 20px; font-weight: 600;">Pendiente de Pago</h3>
            <p style="color: #92400e; margin: 10px 0 0 0; font-size: 16px;">
              Completa el pago para confirmar tu orden
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px;">Detalles de la Orden</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <strong style="color: #6b7280; font-size: 14px;">Número de orden:</strong><br>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">#${orderDetails.id}</span>
              </div>
              <div>
                <strong style="color: #6b7280; font-size: 14px;">Fecha:</strong><br>
                <span style="color: #374151; font-size: 14px;">${new Date(orderDetails.createdAt || orderDetails.date).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>

          <h3 style="color: #374151; margin: 30px 0 20px 0; font-size: 18px;">Productos en tu Orden</h3>
          <div style="background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 15px; text-align: left; color: #374151; font-weight: 600; font-size: 14px;">Producto</th>
                  <th style="padding: 15px; text-align: center; color: #374151; font-weight: 600; font-size: 14px;">Cantidad</th>
                  <th style="padding: 15px; text-align: right; color: #374151; font-weight: 600; font-size: 14px;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
          </div>

          <div style="background-color: #2563eb; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; color: white;">
              <span style="font-size: 18px; font-weight: 500;">Total:</span>
              <span style="font-size: 22px; font-weight: bold;">$${(orderDetails.total * 1000).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <p style="text-align: center; color: #6b7280; margin-top: 30px; font-size: 16px; line-height: 1.6;">
            Completa el pago para recibir la confirmación final de tu orden.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de orden creada enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("Error al enviar correo de orden creada:", error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPurchaseEmail,
  sendOrderCreatedEmail,
  sendOrderStatusUpdateEmail,
};