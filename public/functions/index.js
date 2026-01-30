require('dotenv').config();
const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { google } = require('googleapis');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Google API setup
let auth = null;
let drive = null;
let sheets = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
  });
  drive = google.drive({ version: 'v3', auth });
  sheets = google.sheets({ version: 'v4', auth });
}

// Backup functions
async function backupToDrive() {
  if (!auth) {
    return { success: false, error: 'Google Cloud credentials not configured. Please set up Google Cloud service account and update GOOGLE_APPLICATION_CREDENTIALS in .env file.' };
  }
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolderName = `BillingBackup-${timestamp}`;

    // Create a folder in Drive
    const folderMetadata = {
      name: backupFolderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });
    const folderId = folder.data.id;

    // Backup database
    const dbPath = './database.db';
    if (fs.existsSync(dbPath)) {
      const dbFile = await drive.files.create({
        resource: {
          name: 'database.db',
          parents: [folderId],
        },
        media: {
          mimeType: 'application/octet-stream',
          body: fs.createReadStream(dbPath),
        },
      });
      console.log('Database backed up:', dbFile.data.id);
    }

    // Backup uploads folder
    const uploadsPath = './uploads';
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      for (const file of files) {
        const filePath = path.join(uploadsPath, file);
        if (fs.statSync(filePath).isFile()) {
          await drive.files.create({
            resource: {
              name: file,
              parents: [folderId],
            },
            media: {
              mimeType: 'application/octet-stream',
              body: fs.createReadStream(filePath),
            },
          });
        }
      }
      console.log('Uploads backed up');
    }

    // Share the folder with billing staff (you can set specific emails)
    // For now, make it public or share with a domain
    await drive.permissions.create({
      fileId: folderId,
      resource: {
        type: 'anyone',
        role: 'reader',
      },
    });

    return { success: true, folderId, folderName: backupFolderName };
  } catch (error) {
    console.error('Backup to Drive failed:', error);
    return { success: false, error: error.message };
  }
}

async function exportToSheets() {
  if (!auth) {
    return { success: false, error: 'Google Cloud credentials not configured. Please set up Google Cloud service account and update GOOGLE_APPLICATION_CREDENTIALS in .env file.' };
  }
  try {
    let spreadsheetId = process.env.GOOGLE_SHEET_ID;
    let title = 'Connected Spreadsheet';

    if (!spreadsheetId || spreadsheetId === 'your-spreadsheet-id') {
      // Create a new spreadsheet if no ID provided
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const spreadsheet = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: `BillingData-${timestamp}`,
          },
        },
      });
      spreadsheetId = spreadsheet.data.spreadsheetId;
      title = `BillingData-${timestamp}`;
    } else {
      // Use existing spreadsheet
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      });
      title = spreadsheet.data.properties.title;
    }

    // Export patients data
    const patients = await new Promise((resolve, reject) => {
      db.all("SELECT id, patient_id, name, email, phone, status, admission_date, room, total_billed, pending_balance FROM patients WHERE role = 'patient'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const patientsData = [['ID', 'Patient ID', 'Name', 'Email', 'Phone', 'Status', 'Admission Date', 'Room', 'Total Billed', 'Pending Balance']];
    patients.forEach(patient => {
      patientsData.push([
        patient.id,
        patient.patient_id,
        patient.name,
        patient.email,
        patient.phone,
        patient.status,
        patient.admission_date,
        patient.room,
        patient.total_billed,
        patient.pending_balance
      ]);
    });

    // Export bills data
    const bills = await new Promise((resolve, reject) => {
      db.all("SELECT id, patient_id, patient_name, amount, description, date, status, uploaded_by FROM bills ORDER BY date DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const billsData = [['Bill ID', 'Patient ID', 'Patient Name', 'Amount', 'Description', 'Date', 'Status', 'Uploaded By']];
    bills.forEach(bill => {
      billsData.push([
        bill.id,
        bill.patient_id,
        bill.patient_name,
        bill.amount,
        bill.description,
        bill.date,
        bill.status,
        bill.uploaded_by
      ]);
    });

    // Clear existing data in Patients and Bills sheets
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Patients',
    });
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Bills',
    });

    // Update Patients sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Patients!A1',
      valueInputOption: 'RAW',
      resource: { values: patientsData },
    });

    // Update Bills sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Bills!A1',
      valueInputOption: 'RAW',
      resource: { values: billsData },
    });

    // Share the spreadsheet
    await drive.permissions.create({
      fileId: spreadsheetId,
      resource: {
        type: 'anyone',
        role: 'reader',
      },
    });

    console.log('Data exported to Sheets:', spreadsheetId);
    return { success: true, spreadsheetId, title };
  } catch (error) {
    console.error('Export to Sheets failed:', error);
    return { success: false, error: error.message };
  }
}

// Email transporter (configure with your Gmail credentials)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-gmail@gmail.com', // Replace with your Gmail
    pass: process.env.GMAIL_PASS || 'your-app-password' // Use app password
  }
});

// Check if email credentials are configured (not placeholders)
const isEmailConfigured = process.env.GMAIL_USER &&
                          process.env.GMAIL_PASS &&
                          process.env.GMAIL_USER !== 'your-gmail@gmail.com' &&
                          process.env.GMAIL_PASS !== 'your-app-password';

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
      db.run("INSERT INTO patients (email, password, name, phone, patient_id, role, email_verified) VALUES (?, ?, ?, ?, ?)", ['staff@medicare.com', 'staff123', 'Billing Admin', 'staff', 1]);
      db.run("INSERT INTO bills (patient_id, patient_name, amount, description, status) VALUES (?, ?, ?, ?, ?)", [1, 'John Doe', 1245.00, 'Emergency Room Visit', 'pending']);
      db.run("INSERT INTO bills (patient_id, patient_name, amount, description, status) VALUES (?, ?, ?, ?, ?)", [2, 'Jane Smith', 850.00, 'ICU Stay - Day 1', 'pending']);
      db.run("INSERT INTO bills (patient_id, patient_name, amount, description, status) VALUES (?, ?, ?, ?, ?)", [3, 'Robert Johnson', 4500.00, 'Surgery + Recovery', 'paid']);
    }
  });
}

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
      console.log('User details:', { id: row.id, name: row.name, email: row.email, role: row.role, email_verified: row.email_verified });
      if (row.role === 'patient' && !row.email_verified) {
        return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
      }
      res.json({ success: true, user: { id: row.id, name: row.name, email: row.email, role: row.role, patient_id: row.patient_id } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { firstName, lastName, email, phone, patientId, password } = req.body;
  const name = `${firstName} ${lastName}`;
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // For development, auto-verify email
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const emailVerified = isDevelopment ? 1 : 0;

  db.run("INSERT INTO patients (email, password, first_name, last_name, name, phone, patient_id, role, email_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [email, password, firstName, lastName, name, phone, patientId, 'patient', emailVerified, verificationToken], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }

    // Send verification email
    const mailOptions = {
      from: process.env.GMAIL_USER || 'your-gmail@gmail.com',
      to: email,
      subject: 'Verify Your Email - Medicare Patient Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Medicare Patient Portal</h2>
          <p>Thank you for registering, ${name}!</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="http://localhost:8080/verify-email?token=${verificationToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>http://localhost:8080/verify-email?token=${verificationToken}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    // For development/testing, log the email content instead of sending
    if (isEmailConfigured) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          // Don't fail registration if email fails, but log it
        } else {
          console.log('Verification email sent:', info.response);
        }
      });
    } else {
      console.log('Development mode: Email not sent. Verification link:', `http://localhost:8080/verify-email?token=${verificationToken}`);
      console.log('Email content:', mailOptions.html);
    }

    const message = isDevelopment
      ? 'Registration successful. Your email has been auto-verified for development.'
      : 'Registration successful. Please check your email to verify your account.';

    res.json({ success: true, message });
  });
});

app.post('/api/verify', (req, res) => {
  const { token } = req.body;
  db.run("UPDATE patients SET email_verified = 1, verification_token = NULL WHERE verification_token = ?", [token], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    res.json({ success: true, message: 'Email verified successfully' });
  });
});

app.post('/api/resend-verification', (req, res) => {
  const { email } = req.body;
  db.get("SELECT * FROM patients WHERE email = ? AND email_verified = 0", [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(400).json({ success: false, message: 'Email not found or already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    db.run("UPDATE patients SET verification_token = ? WHERE email = ?", [verificationToken, email], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }

      // Send verification email
      const mailOptions = {
        from: process.env.GMAIL_USER || 'your-gmail@gmail.com',
        to: email,
        subject: 'Verify Your Email - Medicare Patient Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="http://localhost:8080/verify-email?token=${verificationToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>http://localhost:8080/verify-email?token=${verificationToken}</p>
          </div>
        `
      };

      // For development/testing, log the email content instead of sending
      if (isEmailConfigured) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Failed to send email' });
          }
          res.json({ success: true, message: 'Verification email sent' });
        });
      } else {
        console.log('Development mode: Resend email not sent. Verification link:', `http://localhost:8080/verify-email?token=${verificationToken}`);
        console.log('Email content:', mailOptions.html);
        res.json({ success: true, message: 'Verification email logged (development mode)' });
      }
    });
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

// Update patient
app.put('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, patientId, admissionDate, room, status } = req.body;
  const name = `${firstName} ${lastName}`;
  db.run("UPDATE patients SET first_name = ?, last_name = ?, name = ?, email = ?, phone = ?, patient_id = ?, admission_date = ?, room = ?, status = ? WHERE id = ?",
    [firstName, lastName, name, email, phone, patientId, admissionDate, room, status, id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'Email or Patient ID already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, message: 'Patient updated successfully' });
  });
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM patients WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, message: 'Patient deleted successfully' });
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

// Backup to Google Drive
app.post('/api/backup/drive', async (req, res) => {
  try {
    const result = await backupToDrive();
    if (result.success) {
      res.json({ success: true, message: 'Backup completed successfully', folderId: result.folderId, folderName: result.folderName });
    } else {
      res.status(500).json({ success: false, message: 'Backup failed', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Backup failed', error: error.message });
  }
});

// Export to Google Sheets
app.post('/api/backup/sheets', async (req, res) => {
  try {
    const result = await exportToSheets();
    if (result.success) {
      res.json({ success: true, message: 'Data exported successfully', spreadsheetId: result.spreadsheetId, title: result.title });
    } else {
      res.status(500).json({ success: false, message: 'Export failed', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed', error: error.error });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);