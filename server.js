const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de Mercado Pago
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN,
});

// Ruta para crear pago
app.post('/crear-pago', async (req, res) => {
  try {
    const { total, email, reference, title } = req.body;

    // Creamos UNA SOLA línea de item con el precio final
    const preference = {
      items: [
        {
          title: title || "Compra en mi tienda",
          quantity: 1,         // siempre 1
          unit_price: Number(total), // el total final
          currency_id: "ARS",  // ajusta según corresponda
        },
      ],
      payer: {
        email,
      },
      external_reference: reference,
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ link: response.body.init_point });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de prueba
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/", (req, res) => {
  res.send("🚀 API activa y lista para recibir pagos");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
