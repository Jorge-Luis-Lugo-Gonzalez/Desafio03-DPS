const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const store = require('../db/store');
const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const budgets = store.budgets
    .filter(b => b.userId === req.user.id)
    .map(b => {
      const spent = store.transactions
        .filter(t => t.userId === req.user.id && t.category === b.category && t.type === 'expense'
          && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === month)
        .reduce((s, t) => s + t.amount, 0);
      const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      const alert = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'ok';
      return { ...b, spent, percentage, alert };
    });
  res.json(budgets);
});

router.post('/', (req, res) => {
  const { category, limit } = req.body;
  if (!category || !limit) return res.status(400).json({ error: 'Categoría y límite requeridos' });
  if (isNaN(limit) || Number(limit) <= 0) return res.status(400).json({ error: 'Límite debe ser positivo' });
  if (store.budgets.find(b => b.userId === req.user.id && b.category === category))
    return res.status(409).json({ error: 'Ya existe un presupuesto para esta categoría' });
  const budget = { id: uuidv4(), userId: req.user.id, category, limit: Number(limit) };
  store.budgets.push(budget);
  res.status(201).json(budget);
});

router.put('/:id', (req, res) => {
  const budget = store.budgets.find(b => b.id === req.params.id && b.userId === req.user.id);
  if (!budget) return res.status(404).json({ error: 'Presupuesto no encontrado' });
  if (req.body.limit) budget.limit = Number(req.body.limit);
  res.json(budget);
});

router.delete('/:id', (req, res) => {
  const idx = store.budgets.findIndex(b => b.id === req.params.id && b.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Presupuesto no encontrado' });
  store.budgets.splice(idx, 1);
  res.json({ message: 'Eliminado' });
});

module.exports = router;