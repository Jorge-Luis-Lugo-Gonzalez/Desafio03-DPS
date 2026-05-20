const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const store = require('../db/store');
const router = express.Router();
router.use(auth);

const calcBalance = (accountId) =>
  store.transactions
    .filter(t => t.accountId === accountId)
    .reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

router.get('/', (req, res) => {
  const accounts = store.accounts
    .filter(a => a.userId === req.user.id)
    .map(a => ({ ...a, balance: calcBalance(a.id) }));
  res.json(accounts);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
  const account = { id: uuidv4(), userId: req.user.id, name };
  store.accounts.push(account);
  res.status(201).json({ ...account, balance: 0 });
});

router.put('/:id', (req, res) => {
  const account = store.accounts.find(a => a.id === req.params.id && a.userId === req.user.id);
  if (!account) return res.status(404).json({ error: 'Cuenta no encontrada' });
  if (req.body.name) account.name = req.body.name;
  res.json({ ...account, balance: calcBalance(account.id) });
});

router.delete('/:id', (req, res) => {
  const idx = store.accounts.findIndex(a => a.id === req.params.id && a.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Cuenta no encontrada' });
  store.accounts.splice(idx, 1);
  res.json({ message: 'Cuenta eliminada' });
});

module.exports = router;