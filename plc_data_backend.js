// backend/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database
const db = new sqlite3.Database('./datos.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dato TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API endpoint to receive data
app.post('/recibir', (req, res) => {
  const { dato } = req.body;
  if (dato === undefined) return res.status(400).send('Dato requerido');

  db.run('INSERT INTO registros(dato) VALUES (?)', [dato], (err) => {
    if (err) return res.status(500).send('Error al guardar');
    res.send('Dato recibido correctamente');
  });
});

// API endpoint to get latest 10 records
app.get('/ultimos', (req, res) => {
  db.all('SELECT * FROM registros ORDER BY fecha DESC LIMIT 10', [], (err, rows) => {
    if (err) return res.status(500).send('Error al consultar');
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
