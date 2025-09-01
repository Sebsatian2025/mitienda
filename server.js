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

// Recibe un array de items con quantity y unit_price numéricos
app.post('/crear-pago', async (req, res) => {
  try {
    const { items, email, reference } = req.body;
    console.log("📥 /crear-pago payload:", { items, email, reference });

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: 'Debes enviar un array de items con quantity y unit_price' });
    }

    // Mapear cada línea al formato de Mercado Pago
    const preferenceItems = items.map(item => {
      const qty  = Number(item.quantity);
      const up   = Number(item.unit_price);
      console.log(`▶️ Procesando item "${item.title}": qty=${qty}, unit_price=${up}`);

      return {
        id:          item.id,
        title:       item.title,
        description: item.description || '',
        picture_url: item.picture_url || '',
        quantity:    qty,
        unit_price:  up,
        currency_id: 'ARS'
      };
    });

    const preference = {
      items: preferenceItems,
      payer: { email },
      external_reference: reference,
      back_urls: {
        success: 'https://tu-dominio.com/success',
        failure: 'https://tu-dominio.com/failure',
        pending: 'https://tu-dominio.com/pending'
      },
      auto_return: 'approved'
    };

    console.log("🔧 Creando preferencia MP:", preference);
    const response = await mercadopago.preferences.create(preference);
    console.log("✅ MP preference creada:", response.body);

    res.json({ link: response.body.init_point });
  } catch (error) {
    console.error("❌ Error en /crear-pago:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoints de prueba
app.get("/ping", (req, res) => res.send("pong"));
app.get("/", (req, res) => res.send("🚀 API activa y lista para recibir pagos"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
