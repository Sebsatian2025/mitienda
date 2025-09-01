const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

// 1. Configuración inicial de Express
const app = express();
app.use(express.json());
app.use(cors());

// 2. Configuración de Mercado Pago
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN
});

// 3. Rutas de la API (Endpoints)
// Endpoint de prueba para verificar si la API está activa
app.get("/", (req, res) => {
  res.send("🚀 API activa y lista para recibir pagos");
});

// Otro endpoint de prueba simple
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Endpoint principal para crear una preferencia de pago
app.post('/crear-pago', async (req, res) => {
  try {
    const preference = {
      items: req.body.items,
      payer: {
        email: req.body.email
      },
      external_reference: req.body.reference
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ link: response.body.init_point });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
