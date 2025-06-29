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
  // Tasas de cambio para conversión USD a ARS
  const exchangeRates = {
    EUR: 1.0000,
    USD: 1.0870,
    ARS: 1358.7086
  };

  // Función para convertir moneda
  const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    
    if (!fromRate || !toRate) return amount;
    
    // Convertir: fromCurrency -> EUR -> toCurrency
    const amountInEUR = amount / fromRate;
    return amountInEUR * toRate;
  };

  // Calcular totales en USD y ARS
  const subtotalUSD = orderDetails.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const taxesUSD = subtotalUSD * 0.21;
  const totalUSD = subtotalUSD + taxesUSD;

  // Convertir a pesos argentinos
  const subtotalARS = convertCurrency(subtotalUSD, 'USD', 'ARS', exchangeRates);
  const taxesARS = convertCurrency(taxesUSD, 'USD', 'ARS', exchangeRates);
  const totalARS = convertCurrency(totalUSD, 'USD', 'ARS', exchangeRates);

  // Crear tabla HTML con los items
  const itemsTable = orderDetails.items.map(item => {
    const priceUSD = parseFloat(item.price);
    const priceARS = convertCurrency(priceUSD, 'USD', 'ARS', exchangeRates);
    const totalItemUSD = priceUSD * item.quantity;
    const totalItemARS = convertCurrency(totalItemUSD, 'USD', 'ARS', exchangeRates);
    
    return `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.product ? item.product.name : item.name}</td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${item.quantity}</td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">$${priceARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">$${totalItemARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
      </tr>
    `;
  }).join('');

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
                  <th style="padding: 15px; text-align: right; color: #374151; font-weight: 600; font-size: 14px;">Precio Unit.</th>
                  <th style="padding: 15px; text-align: right; color: #374151; font-weight: 600; font-size: 14px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
          </div>

          <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px;">Resumen de Cuenta</h3>
            <div style="space-y: 3;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 16px;">Subtotal (productos):</span>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">$${subtotalARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 16px;">Impuestos (21%):</span>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">$${taxesARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 2px solid #10b981; margin-top: 8px;">
                <span style="color: #10b981; font-size: 18px; font-weight: 600;">Total pagado:</span>
                <span style="color: #10b981; font-size: 20px; font-weight: bold;">$${totalARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          <div style="background-color: #10b981; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; color: white;">
              <span style="font-size: 18px; font-weight: 500;">Total Final:</span>
              <span style="font-size: 22px; font-weight: bold;">$${totalARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
            </div>
          </div>

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #0369a1; font-size: 14px; margin: 0; text-align: center;">
              <strong>💡 Información:</strong> Los precios están convertidos a pesos argentinos usando la tasa de cambio actual (1 USD = $${exchangeRates.ARS.toLocaleString('es-AR')} ARS)
            </p>
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

  // Si newStatus no se proporciona, usar el status de la orden
  const status = newStatus !== undefined ? newStatus : orderDetails.status;
  const statusText = statusTexts[status] || 'DESCONOCIDO';
  const statusColor = statusColors[status] || '#6b7280';
  const statusIcon = statusIcons[status] || '❓';

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

          <div style="background-color: ${statusColor}15; border: 2px solid ${statusColor}; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 15px;">${statusIcon}</div>
            <h3 style="color: ${statusColor}; margin: 0; font-size: 20px; font-weight: 600;">Nuevo Estado: ${statusText}</h3>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">
              ${status === 0 ? 'Tu orden está siendo revisada' : 
                status === 1 ? 'Tu orden está siendo procesada' :
                status === 2 ? '¡Tu orden ha sido completada!' :
                status === 3 ? 'Tu orden ha sido cancelada' :
                'Tu orden ha sido actualizada'}
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
  // Tasas de cambio para conversión USD a ARS
  const exchangeRates = {
    EUR: 1.0000,
    USD: 1.0870,
    ARS: 1358.7086
  };

  // Función para convertir moneda
  const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    
    if (!fromRate || !toRate) return amount;
    
    // Convertir: fromCurrency -> EUR -> toCurrency
    const amountInEUR = amount / fromRate;
    return amountInEUR * toRate;
  };

  // Calcular totales en USD y ARS
  const subtotalUSD = orderDetails.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const taxesUSD = subtotalUSD * 0.21;
  const totalUSD = subtotalUSD + taxesUSD;

  // Convertir a pesos argentinos
  const subtotalARS = convertCurrency(subtotalUSD, 'USD', 'ARS', exchangeRates);
  const taxesARS = convertCurrency(taxesUSD, 'USD', 'ARS', exchangeRates);
  const totalARS = convertCurrency(totalUSD, 'USD', 'ARS', exchangeRates);

  // Crear tabla HTML con los items (precios en USD)
  const itemsTable = orderDetails.items.map(item => {
    const priceUSD = parseFloat(item.price);
    const priceARS = convertCurrency(priceUSD, 'USD', 'ARS', exchangeRates);
    const totalItemUSD = priceUSD * item.quantity;
    const totalItemARS = convertCurrency(totalItemUSD, 'USD', 'ARS', exchangeRates);
    
    return `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.product ? item.product.name : item.name}</td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${item.quantity}</td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">$${priceARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">$${totalItemARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
      </tr>
    `;
  }).join('');

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
                  <th style="padding: 15px; text-align: right; color: #374151; font-weight: 600; font-size: 14px;">Precio Unit.</th>
                  <th style="padding: 15px; text-align: right; color: #374151; font-weight: 600; font-size: 14px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
          </div>

          <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px;">Resumen de Cuenta</h3>
            <div style="space-y: 3;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 16px;">Subtotal (productos):</span>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">$${subtotalARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 16px;">Impuestos (21%):</span>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">$${taxesARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 2px solid #2563eb; margin-top: 8px;">
                <span style="color: #2563eb; font-size: 18px; font-weight: 600;">Total a cobrar:</span>
                <span style="color: #2563eb; font-size: 20px; font-weight: bold;">$${totalARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          <div style="background-color: #2563eb; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; color: white;">
              <span style="font-size: 18px; font-weight: 500;">Total Final:</span>
              <span style="font-size: 22px; font-weight: bold;">$${totalARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
            </div>
          </div>

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #0369a1; font-size: 14px; margin: 0; text-align: center;">
              <strong>💡 Información:</strong> Los precios están convertidos a pesos argentinos usando la tasa de cambio actual (1 USD = $${exchangeRates.ARS.toLocaleString('es-AR')} ARS)
            </p>
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
