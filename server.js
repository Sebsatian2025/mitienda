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

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
