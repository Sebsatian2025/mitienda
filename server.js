const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN
});

app.post('/crear-pago', async (req, res) => {
  try {
    // 1. Mapear y enriquecer cada ítem
    const preferenceItems = (req.body.items || []).map(item => ({
      id: item.id || '',                          // opcional, tu SKU o ID interno
      title: item.title,                           // nombre del producto
      description: item.description || '',         // detalle extra
      picture_url: item.picture_url || item.image || '', // URL de la imagen
      quantity: item.quantity,                     // cantidad
      unit_price: item.unit_price                  // precio unitario
    }));

    // 2. Armar la preferencia con back_urls y retorno automático
    const preference = {
      items: preferenceItems,
      payer: { email: req.body.email },
      external_reference: req.body.reference,
      back_urls: {
        success: "https://tuweb.com/success",
        failure: "https://tuweb.com/failure",
        pending: "https://tuweb.com/pending"
      },
      auto_return: "approved"
    };

    // 3. Crear la preferencia en Mercado Pago
    const response = await mercadopago.preferences.create(preference);

    res.json({ link: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/ping", (req, res) => res.send("pong"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

app.get("/", (req, res) => 
  res.send("🚀 API activa y lista para recibir pagos")
);
