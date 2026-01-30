import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OpenAI } from "openai";

dotenv.config();

const app = express();

// Initialize OpenAI (mock mode if API key not set)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const USE_OPENAI = !!OPENAI_API_KEY;

let openai;
if (USE_OPENAI) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log("✓ OpenAI integration enabled");
} else {
  console.log("⚠ OpenAI API key not found. Using mock AI responses.");
}

/* ===================== MOCK DATA WITH HASHED PASSWORDS ===================== */
// Password for all accounts: "password123"
const hashedPassword = "$2b$10$xiHLMK6.Y6mT5L4L5L5L5OxiHLMK6.Y6mT5L4L5L5L5L5L5L5L5L5L5";

const mockUsers = [
  { id: 1, email: "admin@projectbill.com", password_hash: hashedPassword, first_name: "Admin", last_name: "User", role_id: 1, role_name: "Admin" },
  { id: 2, email: "staff@projectbill.com", password_hash: hashedPassword, first_name: "Billing", last_name: "Officer", role_id: 2, role_name: "Billing Officer" },
  { id: 3, email: "patient@projectbill.com", password_hash: hashedPassword, first_name: "John", last_name: "Doe", role_id: 3, role_name: "Patient", patient_id: "PAT-001" },
];

const mockPatients = [
  { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@email.com", phone: "1234567890", patient_id: "PAT-001", status: "active", created_at: new Date() },
  { id: 2, first_name: "Jane", last_name: "Smith", email: "jane.smith@email.com", phone: "0987654321", patient_id: "PAT-002", status: "active", created_at: new Date() },
];

const mockBills = [
  { id: 1, user_id: 1, billing_reference_id: "BILL-001", amount: 1500, description: "Emergency Room Visit", due_date: new Date(), status: "pending", patient_name: "John Doe", patient_id: "PAT-001" },
  { id: 2, user_id: 2, billing_reference_id: "BILL-002", amount: 2500, description: "Lab Work", due_date: new Date(), status: "paid", patient_name: "Jane Smith", patient_id: "PAT-002" },
];

/* ===================== MIDDLEWARE ===================== */
app.use(cors({
  origin: [
    "http://192.168.2.50:8000",
    "http://localhost:8000",
    "http://192.168.2.50:4000",
    "http://localhost:4000",
    "http://192.168.10.172:8000",
    "http://192.168.10.172:4000",
    "https://projectbill.com",
    "https://www.projectbill.com",
  ],
  credentials: true
}));
app.use(express.json());

/* ===================== TEST ROUTE ===================== */
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running (PostgreSQL disconnected)" });
});

/* ===================== HEALTH CHECK ===================== */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ===================== STAFF REGISTER ===================== */
app.post("/staff/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    // In mock mode, just return success
    res.json({ success: true, message: "Staff registered successfully (mock mode)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

/* ===================== STAFF LOGIN ===================== */
app.post("/staff/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In mock mode, accept any email/password combination for demo
    // Create a mock user based on the email provided
    const mockUser = {
      id: 1,
      email: email,
      first_name: email.split('@')[0] || "Staff",
      last_name: "",
      role_name: "Billing Officer"
    };
    
    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ 
      success: true, 
      token, 
      user: { 
        id: mockUser.id, 
        name: `${mockUser.first_name} ${mockUser.last_name}`,
        email: mockUser.email, 
        role: mockUser.role_name.toLowerCase() 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

/* ===================== PATIENT REGISTER (API route) ===================== */
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, patientId, password } = req.body;
    res.json({ success: true, message: "Registration successful (mock mode)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

/* ===================== PATIENT LOGIN (API route) ===================== */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In mock mode, accept any email/password combination for demo
    // Create a mock user based on the email provided
    const mockPatient = {
      id: 3,
      email: email,
      first_name: email.split('@')[0] || "Patient",
      last_name: "",
      role_name: "Patient",
      patient_id: "PAT-" + (Math.floor(Math.random() * 900) + 100)
    };
    
    res.json({ 
      success: true, 
      user: {
        id: mockPatient.id,
        name: `${mockPatient.first_name} ${mockPatient.last_name}`,
        email: mockPatient.email,
        role: 'patient',
        patient_id: mockPatient.patient_id
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

/* ===================== PATIENTS API ===================== */
app.get("/api/patients", async (req, res) => {
  res.json(mockPatients);
});

app.post("/api/patients", async (req, res) => {
  const { firstName, lastName, email, phone, patientId } = req.body;
  const newPatient = {
    id: mockPatients.length + 1,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    patient_id: patientId,
    status: "active",
    created_at: new Date()
  };
  mockPatients.push(newPatient);
  res.json({ success: true, message: "Patient added successfully (mock mode)" });
});

app.put("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, patientId, status } = req.body;
  res.json({ success: true, message: "Patient updated successfully (mock mode)" });
});

app.delete("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: "Patient deleted successfully (mock mode)" });
});

/* ===================== BILLS API ===================== */
app.get("/api/bills", async (req, res) => {
  res.json(mockBills);
});

app.post("/api/bills", async (req, res) => {
  const { patientId, description, amount } = req.body;
  const newBill = {
    id: mockBills.length + 1,
    user_id: 1,
    billing_reference_id: `BILL-${Date.now()}`,
    amount,
    description,
    due_date: new Date(),
    status: "pending",
    patient_name: "New Patient",
    patient_id: patientId
  };
  mockBills.push(newBill);
  res.json({ success: true, message: "Bill uploaded successfully (mock mode)" });
});

app.put("/api/bills/:id", async (req, res) => {
  const { id } = req.params;
  const { description, amount, status } = req.body;
  res.json({ success: true, message: "Bill updated successfully (mock mode)" });
});

app.delete("/api/bills/:id", async (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: "Bill deleted successfully (mock mode)" });
});

/* ===================== BACKUP API (Mock) ===================== */
app.post("/api/backup/drive", async (req, res) => {
  res.json({ success: true, folderName: `projectbill_backup_${new Date().toISOString().split('T')[0]}` });
});

app.post("/api/backup/sheets", async (req, res) => {
  res.json({ success: true, title: `Billing_Export_${new Date().toISOString().split('T')[0]}.xlsx` });
});

/* ===================== AI HELP CENTER ENDPOINTS ===================== */

// FAQ data (mock)
const faqData = [
  { id: 1, category: "Billing", question: "How do I view my bills?", answer: "Log into your dashboard, navigate to 'My Bills', and click on any bill to see details." },
  { id: 2, category: "Billing", question: "How do I pay a bill?", answer: "Go to 'My Bills', select the bill, and click 'Pay Now'. You can pay via credit card or bank transfer." },
  { id: 3, category: "Billing", question: "What payment methods are accepted?", answer: "We accept credit cards, debit cards, and bank transfers." },
  { id: 4, category: "Account", question: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page and follow the email verification steps." },
  { id: 5, category: "Account", question: "How do I update my profile?", answer: "Go to Settings > Profile and update your information. Click Save to apply changes." },
  { id: 6, category: "Notifications", question: "How do I manage notifications?", answer: "Visit Settings > Notifications to enable/disable alerts for bills, payments, and updates." },
  { id: 7, category: "Technical", question: "Why am I getting a login error?", answer: "Try clearing your browser cache, or contact support if the issue persists." },
];

// Chat history storage (in-memory, resets on server restart)
const chatHistories = {};

// AI Chatbot endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message || !userId) {
      return res.status(400).json({ success: false, message: "Message and userId required" });
    }

    // Initialize user chat history
    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }

    // Store user message
    chatHistories[userId].push({ role: "user", content: message, timestamp: new Date() });

    let aiResponse;

    if (USE_OPENAI) {
      // Use OpenAI API
      try {
        const chatMessages = chatHistories[userId].map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful healthcare billing assistant for ProjectBill. You help patients and billing staff with questions about bills, payments, accounts, and general support. Be concise and helpful."
            },
            ...chatMessages
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        aiResponse = completion.choices[0].message.content;
      } catch (openaiErr) {
        console.error("OpenAI API error:", openaiErr);
        aiResponse = "I apologize, but I'm unable to process your request at the moment. Please try again later or contact support.";
      }
    } else {
      // Mock response for development
      const mockResponses = [
        "I can help you with billing questions, account management, and general inquiries. What would you like to know?",
        "To pay your bill, go to 'My Bills' and select the bill you want to pay. Click 'Pay Now' to proceed.",
        "You can reset your password by clicking 'Forgot Password' on the login page.",
        "Need help with something else? I'm here to assist!",
        "Based on your message, here are some suggestions: 1) Check your account settings, 2) Review your recent bills, 3) Contact our support team."
      ];
      aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    }

    chatHistories[userId].push({ role: "assistant", content: aiResponse, timestamp: new Date() });

    res.json({
      success: true,
      message: aiResponse,
      history: chatHistories[userId].slice(-10), // Return last 10 messages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Chat failed" });
  }
});

// FAQ Search endpoint
app.get("/api/ai/faq", async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.json(faqData);
    }

    const results = faqData.filter(
      (faq) =>
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase()) ||
        faq.category.toLowerCase().includes(search.toLowerCase())
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "FAQ search failed" });
  }
});

// Help Center page content endpoint
app.get("/api/ai/help-center", async (req, res) => {
  res.json({
    success: true,
    content: [
      {
        section: "Getting Started",
        articles: [
          { title: "Create Your Account", content: "Sign up for free at projectbill.com..." },
          { title: "First Login", content: "Use your email and password to log in..." },
        ],
      },
      {
        section: "Billing Management",
        articles: [
          { title: "View Your Bills", content: "All bills are displayed in the 'My Bills' section..." },
          { title: "Payment Methods", content: "ProjectBill accepts multiple payment options..." },
        ],
      },
      {
        section: "Account & Security",
        articles: [
          { title: "Update Profile", content: "Access your profile in Settings..." },
          { title: "Password Security", content: "Keep your password strong and unique..." },
        ],
      },
    ],
  });
});

// Contact Form with AI routing endpoint
app.post("/api/ai/contact", async (req, res) => {
  try {
    const { email, subject, message, userId } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    let detectedCategory = "general";

    if (USE_OPENAI) {
      // Use OpenAI to categorize the message
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a support ticket categorization assistant. Categorize the user's message into one of these categories: 'billing', 'account', 'technical', or 'general'. Respond with only the category name."
            },
            {
              role: "user",
              content: `Subject: ${subject}\n\nMessage: ${message}`
            }
          ],
          max_tokens: 10,
          temperature: 0.3,
        });

        const categorization = completion.choices[0].message.content.toLowerCase().trim();
        const validCategories = ["billing", "account", "technical", "general"];
        detectedCategory = validCategories.find(cat => categorization.includes(cat)) || "general";
      } catch (openaiErr) {
        console.error("OpenAI categorization error:", openaiErr);
        // Fall back to keyword matching
        if (subject.toLowerCase().includes("bill") || message.toLowerCase().includes("bill")) {
          detectedCategory = "billing";
        } else if (subject.toLowerCase().includes("account") || message.toLowerCase().includes("password")) {
          detectedCategory = "account";
        } else if (subject.toLowerCase().includes("error") || message.toLowerCase().includes("bug")) {
          detectedCategory = "technical";
        }
      }
    } else {
      // Mock categorization for development
      const categories = ["billing", "account", "technical", "general"];
      detectedCategory = categories[Math.floor(Math.random() * categories.length)];
    }

    res.json({
      success: true,
      message: "Your inquiry has been submitted and will be routed to the appropriate department.",
      ticketId: `TKT-${Date.now()}`,
      category: detectedCategory,
      estimatedResponse: "24 hours",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Contact submission failed" });
  }
});

// Context-Aware Assistant endpoint (dashboard helper)
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { context, question } = req.body;
    if (!context || !question) {
      return res.status(400).json({ success: false, message: "Context and question required" });
    }

    let response;

    if (USE_OPENAI) {
      // Use OpenAI for contextual help
      try {
        const contextDescriptions = {
          bills: "The user is asking about viewing, managing, or paying their bills in the ProjectBill healthcare billing system.",
          payments: "The user is asking about making payments or payment status in the ProjectBill system.",
          account: "The user is asking about their account settings, profile, or account management.",
          notifications: "The user is asking about notifications and notification preferences."
        };

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant for ProjectBill, a healthcare billing platform. Provide concise, actionable help tips. 
              Context: ${contextDescriptions[context] || "General help"}
              Keep responses to 1-2 sentences max.`
            },
            {
              role: "user",
              content: question
            }
          ],
          max_tokens: 100,
          temperature: 0.6,
        });

        response = completion.choices[0].message.content;
      } catch (openaiErr) {
        console.error("OpenAI assistant error:", openaiErr);
        // Fall back to mock response
        const contextResponses = {
          bills: "To pay this bill, click the 'Pay Now' button and select your payment method.",
          payments: "Your payment has been received and will be processed within 24-48 hours.",
          account: "You can update your account information in Settings > Profile.",
          notifications: "Manage your notification preferences in Settings > Notifications.",
        };
        response = contextResponses[context] || "How can I assist you today?";
      }
    } else {
      // Mock response for development
      const contextResponses = {
        bills: "To pay this bill, click the 'Pay Now' button and select your payment method.",
        payments: "Your payment has been received and will be processed within 24-48 hours.",
        account: "You can update your account information in Settings > Profile.",
        notifications: "Manage your notification preferences in Settings > Notifications.",
      };
      response = contextResponses[context] || "How can I assist you today?";
    }

    res.json({
      success: true,
      response,
      suggestion: "Is there anything else I can help you with?",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Assistant request failed" });
  }
});

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT} (PostgreSQL disconnected, Mock mode)`);
});

// In your dashboard:
// <ContextAssistant context="bills" title="How do I pay my bill?" />
