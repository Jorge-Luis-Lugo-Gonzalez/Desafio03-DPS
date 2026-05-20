require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', require('./routes/auth'));
app.use('/accounts', require('./routes/accounts'));
app.use('/transactions', require('./routes/transactions'));
app.use('/budgets', require('./routes/budgets'));
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3000, () =>
  console.log(`Backend corriendo en puerto ${process.env.PORT || 3000}`)
);