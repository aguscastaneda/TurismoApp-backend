const nodemailer = require("nodemailer");

// Configuracion del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
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
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Compra exitosa!",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb; text-align: center;">Gracias por tu compra!</h2>
        <p style="text-align: center;">Tu orden ha sido procesada exitosamente.</p>
        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937;">Detalles de la orden:</h3>
          <p>Número de orden: ${orderDetails.id}</p>
          <p>Total: $${orderDetails.total}</p>
          <p>Fecha: ${new Date(orderDetails.date).toLocaleDateString()}</p>
        </div>
        <p style="text-align: center;">Puedes ver el estado de tu orden en tu perfil.</p>
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

module.exports = {
  sendVerificationEmail,
  sendPurchaseEmail,
};
