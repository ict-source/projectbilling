const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from PartialBill/public
app.use(express.static('PartialBill/public'));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    phone TEXT,
    patient_id TEXT,
    role TEXT DEFAULT 'patient',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    amount REAL,
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (patient_id) REFERENCES patients (id)
  )`);

  // Insert sample data
  db.get("SELECT COUNT(*) as count FROM patients", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO patients (email, password, name, role) VALUES (?, ?, ?, ?)", ['patient@example.com', 'password123', 'John Doe', 'patient']);
      db.run("INSERT INTO patients (email, password, name, role) VALUES (?, ?, ?, ?)", ['staff@medicare.com', 'staff123', 'Billing Admin', 'staff']);
      db.run("INSERT INTO bills (patient_id, amount, description) VALUES (?, ?, ?)", [1, 150.00, 'Consultation fee']);
    }
  });
}

// Routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM patients WHERE email = ? AND password = ?", [email, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ success: true, user: { id: row.id, name: row.name, email: row.email, role: row.role } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { firstName, lastName, email, phone, patientId, password } = req.body;
  const name = `${firstName} ${lastName}`;
  db.run("INSERT INTO patients (email, password, first_name, last_name, name, phone, patient_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [email, password, firstName, lastName, name, phone, patientId, 'patient'], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, user: { id: this.lastID, name, email } });
  });
});

app.get('/api/bills/:patientId', (req, res) => {
  const { patientId } = req.params;
  db.all("SELECT * FROM bills WHERE patient_id = ?", [patientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});