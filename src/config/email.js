require("dotenv").config(); // Carga las variables del archivo .env
const nodemailer = require("nodemailer");

// Validar variables críticas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("❌ ERROR: Faltan EMAIL_USER o EMAIL_PASSWORD en el archivo .env");
  process.exit(1);
}

// Configurar transporter con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Permitir certificados autofirmados
  },
  secure: false,
  port: 587,
  requireTLS: true,
  debug: true,
  logger: true
});

// === FUNCIÓN: Correo de verificación ===
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verifica tu correo electrónico",
    html: `
      <div style="padding: 20px; font-family: sans-serif;">
        <h2 style="color: #2563eb;">Verificación de Email</h2>
        <p>Gracias por registrarte. Tu código de verificación es:</p>
        <div style="font-size: 28px; font-weight: bold; color: #2563eb;">${code}</div>
        <p>Este código expirará en 10 minutos.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar correo de verificación:", error);
    return false;
  }
};

// === FUNCIÓN: Correo de compra exitosa ===
const sendPurchaseEmail = async (email, orderDetails) => {
  const exchangeRates = {
    EUR: 1.0000,
    USD: 1.0870,
    ARS: 1358.7086
  };

  const convertCurrency = (amount, from, to, rates) => {
    if (from === to) return amount;
    const amountInEUR = amount / rates[from];
    return amountInEUR * rates[to];
  };

  const subtotalUSD = orderDetails.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const taxesUSD = subtotalUSD * 0.21;
  const totalUSD = subtotalUSD + taxesUSD;

  const subtotalARS = convertCurrency(subtotalUSD, 'USD', 'ARS', exchangeRates);
  const taxesARS = convertCurrency(taxesUSD, 'USD', 'ARS', exchangeRates);
  const totalARS = convertCurrency(totalUSD, 'USD', 'ARS', exchangeRates);

  const itemsTable = orderDetails.items.map(item => {
    const priceUSD = parseFloat(item.price);
    const priceARS = convertCurrency(priceUSD, 'USD', 'ARS', exchangeRates);
    const totalItemARS = priceARS * item.quantity;
    // Agregar info personalizada si existe
    let configHtml = '';
    if (item.fechaIda || item.horaIda || item.fechaVuelta || item.horaVuelta) {
      configHtml = `<ul style='margin:4px 0 0 0;padding-left:16px;font-size:13px;'>`;
      if (item.fechaIda) configHtml += `<li><b>Fecha de ida:</b> ${item.fechaIda}</li>`;
      if (item.horaIda) configHtml += `<li><b>Horario de ida:</b> ${item.horaIda}</li>`;
      if (item.fechaVuelta) configHtml += `<li><b>Fecha de regreso:</b> ${item.fechaVuelta}</li>`;
      if (item.horaVuelta) configHtml += `<li><b>Horario de regreso:</b> ${item.horaVuelta}</li>`;
      configHtml += `</ul>`;
    }
    return `
      <tr>
        <td>${item.product ? item.product.name : item.name}${configHtml}</td>
        <td>${item.quantity}</td>
        <td>$${priceARS.toFixed(2)}</td>
        <td>$${totalItemARS.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "¡Compra exitosa! - TurismoApp",
    html: `
      <h2 style="color:#2563eb;">Compra Confirmada</h2>
      <p>Gracias por tu compra. Aquí están los detalles:</p>
      <p><strong>Número de orden:</strong> #${orderDetails.id}</p>
      <p><strong>Fecha:</strong> ${new Date(orderDetails.createdAt || orderDetails.date).toLocaleString('es-AR')}</p>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          ${itemsTable}
        </tbody>
      </table>
      <p><strong>Subtotal:</strong> $${subtotalARS.toFixed(2)}</p>
      <p><strong>Impuestos:</strong> $${taxesARS.toFixed(2)}</p>
      <p><strong>Total:</strong> $${totalARS.toFixed(2)}</p>
      <p><em>Tasa de cambio utilizada: 1 USD = $${exchangeRates.ARS.toFixed(4)} ARS</em></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de compra enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar correo de compra:", error);
    return false;
  }
};

// === FUNCIÓN: Correo de orden creada ===
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

  // Crear tabla HTML con los items (productos)
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

  // Crear tabla de configuración del viaje (2 columnas: campo y valor)
  const configTable = orderDetails.items.map(item => {
    if (!(item.fechaIda || item.horaIda || item.fechaVuelta || item.horaVuelta || item.quantity)) return '';
    return `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 500; vertical-align: top; width: 40%; background: #f3f4f6; border-radius: 8px 0 0 8px;">
          <div style="margin-bottom: 6px;"><b>Producto:</b></div>
          <div style="margin-bottom: 6px;">Fecha de ida:</div>
          <div style="margin-bottom: 6px;">Fecha de regreso:</div>
          <div style="margin-bottom: 6px;">Horario de ida:</div>
          <div style="margin-bottom: 6px;">Horario de regreso:</div>
          <div style="margin-bottom: 6px;">Personas:</div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #374151; vertical-align: top; width: 60%; background: #fff; border-radius: 0 8px 8px 0;">
          <div style="margin-bottom: 6px; font-weight: 600;">${item.product ? item.product.name : item.name}</div>
          <div style="margin-bottom: 6px;">${item.fechaIda || '-'}</div>
          <div style="margin-bottom: 6px;">${item.fechaVuelta || '-'}</div>
          <div style="margin-bottom: 6px;">${item.horaIda || '-'}</div>
          <div style="margin-bottom: 6px;">${item.horaVuelta || '-'}</div>
          <div style="margin-bottom: 6px;">${item.quantity || '-'}</div>
        </td>
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
          <h3 style="color: #374151; margin: 30px 0 10px 0; font-size: 18px;">Configuración del Viaje</h3>
          <div style="background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 14px; text-align: left; color: #374151; font-weight: 600; font-size: 14px;">Producto</th>
                  <th style="padding: 14px; text-align: left; color: #374151; font-weight: 600; font-size: 14px;">Detalles</th>
                </tr>
              </thead>
              <tbody>
                ${configTable}
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
    console.log(`✅ Email de orden creada enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar correo de orden creada:", error);
    return false;
  }
};

// === FUNCIÓN: Correo de actualización de estado ===
const sendOrderStatusUpdateEmail = async (email, orderDetails, newStatus) => {
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
    const amountInEUR = amount / fromRate;
    return amountInEUR * toRate;
  };

  const statusTexts = {
    0: 'PENDIENTE',
    1: 'EN PROCESO',
    2: 'COMPLETADA',
    3: 'CANCELADA'
  };

  const status = newStatus ?? orderDetails.status;
  const statusText = statusTexts[status] || 'DESCONOCIDO';

  // Configuración de colores y iconos según el estado
  const statusConfig = {
    0: {
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#f59e0b',
      icon: '⏳',
      title: 'Pendiente de Pago',
      description: 'Tu orden está esperando la confirmación del pago'
    },
    1: {
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#3b82f6',
      icon: '🔄',
      title: 'En Proceso',
      description: 'Tu orden está siendo procesada'
    },
    2: {
      color: '#10b981',
      bgColor: '#d1fae5',
      borderColor: '#10b981',
      icon: '✅',
      title: 'Completada',
      description: '¡Tu orden ha sido completada exitosamente!'
    },
    3: {
      color: '#ef4444',
      bgColor: '#fee2e2',
      borderColor: '#ef4444',
      icon: '❌',
      title: 'Cancelada',
      description: 'Tu orden ha sido cancelada'
    }
  };

  const config = statusConfig[status] || statusConfig[0];

  // Calcular totales en USD y ARS
  const subtotalUSD = orderDetails.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const taxesUSD = subtotalUSD * 0.21;
  const totalUSD = subtotalUSD + taxesUSD;

  // Convertir a pesos argentinos
  const subtotalARS = convertCurrency(subtotalUSD, 'USD', 'ARS', exchangeRates);
  const taxesARS = convertCurrency(taxesUSD, 'USD', 'ARS', exchangeRates);
  const totalARS = convertCurrency(totalUSD, 'USD', 'ARS', exchangeRates);

  // Crear tabla HTML con los items (productos)
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
    subject: `Actualización de Orden #${orderDetails.id} - TurismoApp`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px; font-size: 28px; font-weight: 300;">Actualización de Orden</h2>
          <p style="text-align: center; color: #6b7280; margin-bottom: 40px; font-size: 16px;">Tu orden ha sido actualizada</p>
          
          <div style="background-color: ${config.bgColor}; border: 2px solid ${config.borderColor}; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 15px;">${config.icon}</div>
            <h3 style="color: ${config.color}; margin: 0; font-size: 20px; font-weight: 600;">${config.title}</h3>
            <p style="color: ${config.color}; margin: 10px 0 0 0; font-size: 16px;">
              ${config.description}
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
                <span style="color: #2563eb; font-size: 18px; font-weight: 600;">Total:</span>
                <span style="color: #2563eb; font-size: 20px; font-weight: bold;">$${totalARS.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          <div style="background-color: ${config.bgColor}; border: 1px solid ${config.borderColor}; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: ${config.color}; font-size: 14px; margin: 0; text-align: center;">
              <strong>Nuevo Estado: ${statusText}</strong><br>
              ${status === 3 ? 'Tu orden ha sido cancelada' : 'Tu orden ha sido actualizada'}
            </p>
          </div>

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #0369a1; font-size: 14px; margin: 0; text-align: center;">
              <strong>💡 Información:</strong> Los precios están convertidos a pesos argentinos usando la tasa de cambio actual (1 USD = $${exchangeRates.ARS.toLocaleString('es-AR')} ARS)
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
    console.log(`✅ Email de actualización enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar correo de estado:", error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPurchaseEmail,
  sendOrderCreatedEmail,
  sendOrderStatusUpdateEmail,
};
