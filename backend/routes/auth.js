const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const store = require('../db/store');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    if (!/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ error: 'Formato de email inválido' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    if (store.users.find(u => u.email === email))
      return res.status(409).json({ error: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), email, name, password: hashed };
    store.users.push(user);
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email, name } });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    const user = store.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email, name: user.name } });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;