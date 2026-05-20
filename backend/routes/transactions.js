const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const store = require('../db/store');
const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const { category, accountId, from, to } = req.query;
  let txs = store.transactions.filter(t => t.userId === req.user.id);
  if (category) txs = txs.filter(t => t.category === category);
  if (accountId) txs = txs.filter(t => t.accountId === accountId);
  if (from) txs = txs.filter(t => new Date(t.date) >= new Date(from));
  if (to) txs = txs.filter(t => new Date(t.date) <= new Date(to));
  txs.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(txs);
});

router.post('/', (req, res) => {
  const { amount, type, category, accountId, date, description } = req.body;
  if (!amount || !type || !category || !accountId || !date)
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  if (!['income', 'expense'].includes(type))
    return res.status(400).json({ error: 'Tipo debe ser income o expense' });
  if (isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ error: 'El monto debe ser un número positivo' });
  const account = store.accounts.find(a => a.id === accountId && a.userId === req.user.id);
  if (!account) return res.status(404).json({ error: 'Cuenta no encontrada' });

  const tx = { id: uuidv4(), userId: req.user.id, amount: Number(amount), type, category, accountId, date, description: description || '' };
  store.transactions.push(tx);
  res.status(201).json(tx);
});

router.put('/:id', (req, res) => {
  const tx = store.transactions.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!tx) return res.status(404).json({ error: 'Transacción no encontrada' });
  const { amount, type, category, accountId, date, description } = req.body;
  if (amount !== undefined) tx.amount = Number(amount);
  if (type && ['income', 'expense'].includes(type)) tx.type = type;
  if (category) tx.category = category;
  if (accountId) tx.accountId = accountId;
  if (date) tx.date = date;
  if (description !== undefined) tx.description = description;
  res.json(tx);
});

router.delete('/:id', (req, res) => {
  const idx = store.transactions.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Transacción no encontrada' });
  store.transactions.splice(idx, 1);
  res.json({ message: 'Eliminada' });
});

module.exports = router;