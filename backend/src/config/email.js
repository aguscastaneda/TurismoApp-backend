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
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb; text-align: center;">Verifica tu correo electronico</h2>
        <p style="text-align: center;">Tu codigo de verificacion es:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p style="text-align: center;">Este codigo expirara en 10 minutos.</p>
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
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * 1000).toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "¡Compra exitosa! - Olimpiadas Turismo",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">¡Gracias por tu compra!</h2>
          <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">Tu orden ha sido procesada exitosamente y está siendo confirmada.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Detalles de la orden:</h3>
            <p><strong>Número de orden:</strong> #${orderDetails.id}</p>
            <p><strong>Fecha:</strong> ${new Date(orderDetails.date).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937;">Productos adquiridos:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Producto</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
          </div>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; font-weight: bold; color: #1e40af;">Total:</span>
              <span style="font-size: 20px; font-weight: bold; color: #1e40af;">$${(orderDetails.total * 1000).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <p style="text-align: center; color: #6b7280; margin-top: 30px;">
            Puedes ver el estado de tu orden en tu perfil de usuario.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
              Gracias por elegir Olimpiadas Turismo
            </p>
          </div>
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
    0: '#fbbf24', // amarillo
    1: '#3b82f6', // azul
    2: '#10b981', // verde
    3: '#ef4444'  // rojo
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Actualización de orden #${orderDetails.id} - Olimpiadas Turismo`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">Actualización de tu orden</h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Detalles de la orden:</h3>
            <p><strong>Número de orden:</strong> #${orderDetails.id}</p>
            <p><strong>Fecha:</strong> ${new Date(orderDetails.date).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Total:</strong> $${(orderDetails.total * 1000).toLocaleString('es-AR')}</p>
          </div>

          <div style="background-color: ${statusColors[newStatus]}20; border: 2px solid ${statusColors[newStatus]}; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: ${statusColors[newStatus]}; margin: 0;">Nuevo estado: ${statusTexts[newStatus]}</h3>
          </div>

          <p style="text-align: center; color: #6b7280; margin-top: 30px;">
            Puedes ver más detalles de tu orden en tu perfil de usuario.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
              Gracias por elegir Olimpiadas Turismo
            </p>
          </div>
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
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * 1000).toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Orden creada - Olimpiadas Turismo",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">¡Orden creada exitosamente!</h2>
          <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">Tu orden ha sido creada y está pendiente de pago.</p>
          
          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #d97706; margin: 0;">⚠️ Pendiente de pago</h3>
            <p style="color: #92400e; margin: 10px 0 0 0;">Completa el pago para confirmar tu orden</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Detalles de la orden:</h3>
            <p><strong>Número de orden:</strong> #${orderDetails.id}</p>
            <p><strong>Fecha:</strong> ${new Date(orderDetails.date).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937;">Productos en tu orden:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Producto</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
          </div>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; font-weight: bold; color: #1e40af;">Total:</span>
              <span style="font-size: 20px; font-weight: bold; color: #1e40af;">$${(orderDetails.total * 1000).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <p style="text-align: center; color: #6b7280; margin-top: 30px;">
            Completa el pago para recibir la confirmación final de tu orden.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
              Gracias por elegir Olimpiadas Turismo
            </p>
          </div>
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
