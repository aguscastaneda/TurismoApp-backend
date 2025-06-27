const { MercadoPagoConfig } = require("mercadopago");

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

module.exports = mp;
