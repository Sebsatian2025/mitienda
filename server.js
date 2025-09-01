const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configurar Mercado Pago con el token de entorno
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN
});

// Ruta para crear el pago
app.post('/crear-pago', async (req, res) => {
  try {
    // 🚨 Ahora esperamos que nos mandes el precio final desde el frontend
    const finalPrice = req.body.total; // ejemplo: { total: 50000, email: "...", reference: "..." }

    if (!finalPrice) {
      return res.status(400).json({ error: "El precio final es obligatorio" });
    }

    // Creamos UN SOLO ITEM con el precio total
    const preference = {
      items: [
        {
          title: "Compra en mi tienda",   // Texto genérico para el pago
          description: "Carrito completo",
          quantity: 1,
          unit_price: Number(finalPrice)  // Usamos el total directamente
        }
      ],
      payer: { email: req.body.email },
      external_reference: req.body.reference,
      back_urls: {
        success: "https://tuweb.com/success",
        failure: "https://tuweb.com/failure",
        pending: "https://tuweb.com/pending"
      },
      auto_return: "approved"
    };

    // Crear preferencia en Mercado Pago
    const response = await mercadopago.preferences.create(preference);

    res.json({ link: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de prueba
app.get("/ping", (req, res) => res.send("pong"));

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

// Página raíz
app.get("/", (req, res) => 
  res.send("🚀 API activa y lista para recibir pagos")
);
