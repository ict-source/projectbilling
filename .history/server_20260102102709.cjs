const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from PartialBill/public
app.use(express.static('PartialBill/public'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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
    status TEXT DEFAULT 'admitted',
    admission_date TEXT,
    room TEXT,
    total_billed REAL DEFAULT 0,
    pending_balance REAL DEFAULT 0,
    email_verified BOOLEAN DEFAULT 0,
    verification_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add columns if they don't exist (for existing databases)
  db.run(`ALTER TABLE patients ADD COLUMN email_verified BOOLEAN DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding email_verified column:', err);
    }
  });
  db.run(`ALTER TABLE patients ADD COLUMN verification_token TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding verification_token column:', err);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    patient_name TEXT,
    amount REAL,
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    uploaded_by TEXT DEFAULT 'Admin',
    file_path TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients (id)
  )`);

  // Insert sample data
  db.get("SELECT COUNT(*) as count FROM patients", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO patients (email, password, name, phone, patient_id, status, admission_date, room, total_billed, pending_balance, role, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ['john.doe@email.com', 'password123', 'John Doe', '(555) 123-4567', 'PAT-001', 'admitted', '2024-12-15', '203A', 2500.00, 1245.00, 'patient', 1]);
      db.run("INSERT INTO patients (email, password, name, phone, patient_id, status, admission_date, room, total_billed, pending_balance, role, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ['jane.smith@email.com', 'password123', 'Jane Smith', '(555) 987-6543', 'PAT-002', 'admitted', '2024-12-18', '105B', 1200.00, 850.00, 'patient', 1]);
      db.run("INSERT INTO patients (email, password, name, phone, patient_id, status, admission_date, room, total_billed, pending_balance, role, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ['robert.j@email.com', 'password123', 'Robert Johnson', '(555) 456-7890', 'PAT-003', 'discharged', '2024-12-10', '-', 4500.00, 0, 'patient', 1]);
      db.run("INSERT INTO patients (email, password, name, role, email_verified) VALUES (?, ?, ?, ?, ?)", ['staff@medicare.com', 'staff123', 'Billing Admin', 'staff', 1]);
      db.run("INSERT INTO bills (patient_id, patient_name, amount, description, status) VALUES (?, ?, ?, ?, ?)", [1, 'John Doe', 1245.00, 'Emergency Room Visit', 'pending']);
      db.run("INSERT INTO bills (patient_id, patient_name, amount, description, status) VALUES (?, ?, ?, ?, ?)", [2, 'Jane Smith', 850.00, 'ICU Stay - Day 1', 'pending']);
      db.run("INSERT INTO bills (patient_id, patient_name, amount, description, status) VALUES (?, ?, ?, ?, ?)", [3, 'Robert Johnson', 4500.00, 'Surgery + Recovery', 'paid']);
    }
  });
}

// Debug route to check users
app.get('/api/debug/users', (req, res) => {
  db.all("SELECT id, email, password, role FROM patients", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
  db.get("SELECT * FROM patients WHERE email = ? AND password = ?", [email, password], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Query result:', row ? 'User found' : 'User not found');
    if (row) {
      console.log('User details:', { id: row.id, name: row.name, email: row.email, role: row.role });
      res.json({ success: true, user: { id: row.id, name: row.name, email: row.email, role: row.role, patient_id: row.patient_id } });
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

// Get all patients
app.get('/api/patients', (req, res) => {
  db.all("SELECT id, name, email, phone, patient_id, status, admission_date, room, total_billed, pending_balance FROM patients WHERE role = 'patient'", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add new patient
app.post('/api/patients', (req, res) => {
  const { firstName, lastName, email, phone, patientId, admissionDate, room } = req.body;
  const name = `${firstName} ${lastName}`;
  db.run("INSERT INTO patients (email, password, first_name, last_name, name, phone, patient_id, role, status, admission_date, room, total_billed, pending_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [email, 'password123', firstName, lastName, name, phone, patientId, 'patient', 'admitted', admissionDate, room, 0, 0], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'Email or Patient ID already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, patientId: this.lastID });
  });
});

// Get all bills
app.get('/api/bills', (req, res) => {
  db.all("SELECT * FROM bills ORDER BY date DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Upload new bill
app.post('/api/bills', upload.single('file'), (req, res) => {
  const { patientId, description, amount } = req.body;
  const filePath = req.file ? req.file.path : null;

  // Get patient name
  db.get("SELECT name FROM patients WHERE id = ?", [patientId], (err, patient) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    db.run("INSERT INTO bills (patient_id, patient_name, amount, description, file_path) VALUES (?, ?, ?, ?, ?)",
      [patientId, patient.name, parseFloat(amount), description, filePath], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update patient's total_billed and pending_balance
      db.run("UPDATE patients SET total_billed = total_billed + ?, pending_balance = pending_balance + ? WHERE id = ?",
        [parseFloat(amount), parseFloat(amount), patientId], (updateErr) => {
        if (updateErr) {
          console.error('Error updating patient balance:', updateErr);
          // Don't fail the request, just log the error
        }
        res.json({ success: true, billId: this.lastID });
      });
    });
  });
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});