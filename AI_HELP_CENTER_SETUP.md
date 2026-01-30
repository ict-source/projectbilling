# AI Help Center Features - Setup Guide

## ✅ Features Implemented

### 1. **Chatbot Widget** (Floating Chat Bubble)
- Real-time conversational AI assistant
- Shows on all authenticated pages
- Maintains chat history per user
- Accessible via floating button (bottom-right)

### 2. **AI FAQ Search** (`/faq-search`)
- Search through 7+ sample FAQs
- Categorized by topic (Billing, Account, Notifications, Technical)
- Click to expand/collapse answers
- AI-powered search

### 3. **Help Center** (`/help-center`)
- Comprehensive documentation hub
- Quick access buttons (FAQs, Support, Chat)
- Expandable help sections
- Additional resources section

### 4. **Context-Aware Assistant**
- Inline AI helper component for dashboards
- Context-specific tips (bills, payments, account, notifications)
- Integrated into Patient & Billing dashboards
- "Get Another Tip" button for additional suggestions

### 5. **Email/Contact Form** (`/contact`)
- Support ticket submission
- AI-powered categorization (billing, account, technical, general)
- Ticket ID generation
- Success confirmation screen

### 6. **Help Navigation Menu**
- Added to Patient & Billing dashboards header
- Quick links to all help resources
- Help Center, FAQs, Contact Support buttons

### 7. **OpenAI Integration** (Optional)
- Automatically detects OpenAI API key
- Falls back to mock responses if key not available
- Uses GPT-3.5-turbo for intelligent responses
- Graceful error handling

---

## 🚀 Quick Start

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd PartialBill
npm install
```

### Step 2: Configure OpenAI (Optional)

To enable real AI responses:

1. Get your OpenAI API key from: https://platform.openai.com/api-keys
2. Create or edit `backend/.env`:
```bash
OPENAI_API_KEY=sk-your-api-key-here
PORT=4000
JWT_SECRET=your_jwt_secret_here
```

3. Without the API key, the app uses mock responses (perfect for development)

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
# Output: Backend running on http://0.0.0.0:4000
```

**Terminal 2 - Frontend:**
```bash
cd PartialBill
npm run dev
# Output: Vite dev server running on http://0.0.0.0:8000
```

### Step 4: Access the Application

- **Frontend**: http://192.168.2.50:8000 (or your server IP)
- **Backend API**: http://192.168.2.50:4000/api/health

### Step 5: Test AI Features

1. **Login** with test credentials:
   - Patient: `patient@projectbill.com` / `password123`
   - Staff: `staff@projectbill.com` / `password123`

2. **In Dashboard**: See "AI Assistant Tip" section

3. **Chatbot Widget**: Click blue chat bubble (bottom-right corner)

4. **Help Center**: 
   - Click "Help" button in header → `/help-center`
   - Click "FAQs" button → `/faq-search`
   - Click "Support" button → `/contact`

---

## 📋 Backend AI Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/chat` | POST | Chatbot conversation |
| `/api/ai/faq` | GET | Search FAQs |
| `/api/ai/help-center` | GET | Help documentation |
| `/api/ai/assistant` | POST | Context-aware tips |
| `/api/ai/contact` | POST | Contact form with AI routing |

### Example: Chat Endpoint

**Request:**
```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I pay my bill?",
    "userId": "user123"
  }'
```

**Response (with OpenAI):**
```json
{
  "success": true,
  "message": "To pay your bill, navigate to the 'My Bills' section...",
  "history": [...]
}
```

---

## 🔧 Configuration Files

### Backend Environment (`.env`)
```bash
OPENAI_API_KEY=sk-xxx          # Optional: Enable real AI
PORT=4000                       # Backend port
JWT_SECRET=your_secret         # JWT signing key
```

### Frontend Vite Config
- Proxy: `/api` → `localhost:4000`
- Host: `0.0.0.0` (accessible from any network interface)
- Port: `8000`

---

## 🧠 AI Behavior

### With OpenAI API Key ✓
- Intelligent, context-aware responses
- Chat history maintained per user
- Smart categorization of support tickets
- Personalized dashboard tips

### Without API Key (Mock Mode) ✓
- Predefined helpful responses
- Random selection from response bank
- Still fully functional for testing
- Perfect for development/demo

**To enable OpenAI**: Set `OPENAI_API_KEY` in `backend/.env`

---

## 📝 Testing Mock Responses

All features work in **mock mode** (no API key needed):

```bash
# Start without .env file
cd backend
node server.js

# Start frontend
cd PartialBill
npm run dev

# Login and test:
# - Chatbot responses are randomized but helpful
# - FAQs display static content
# - Contact form auto-categorizes based on keywords
# - Dashboard tips rotate through suggestions
```

---

## 🛠️ Customization

### Add More FAQs
Edit `backend/server.js`, line ~245:
```javascript
const faqData = [
  { id: 8, category: "Billing", question: "Your new question?", answer: "Your answer here." },
  // ... add more
];
```

### Update Help Center Content
Edit `backend/server.js`, line ~320 in `/api/ai/help-center` endpoint.

### Customize System Prompts
Update the `role: "system"` messages in:
- `/api/ai/chat` (line ~268)
- `/api/ai/contact` (line ~393)
- `/api/ai/assistant` (line ~450)

### Change Dashboard Tips
Edit `PartialBill/src/pages/patient/PatientDashboard.tsx`:
```tsx
<ContextAssistant context="bills" title="How do I pay my bill?" />
```

Available contexts: `"bills"`, `"payments"`, `"account"`, `"notifications"`

---

## 🐛 Troubleshooting

### Chatbot not responding
1. Check backend is running: `curl http://localhost:4000/api/health`
2. Check browser console (F12) for errors
3. Verify CORS configuration includes your frontend URL

### OpenAI API errors
1. Check API key is valid: https://platform.openai.com/account/api-keys
2. Verify account has available credits
3. Check rate limits haven't been exceeded
4. Remove `OPENAI_API_KEY` to fall back to mock mode

### Help navigation not showing
1. Ensure you're logged in
2. Check `HelpNavigation.tsx` is imported in dashboard
3. Verify routes exist in `App.tsx`

### Port already in use
```bash
# Change in .env
PORT=4001

# Or kill process using port 4000
npx kill-port 4000
```

---

## 📚 Files Created/Modified

### New Components
- `PartialBill/src/components/ChatbotWidget.tsx`
- `PartialBill/src/components/ContextAssistant.tsx`
- `PartialBill/src/components/HelpNavigation.tsx`

### New Pages
- `PartialBill/src/pages/AIFAQSearch.tsx`
- `PartialBill/src/pages/HelpCenter.tsx`
- `PartialBill/src/pages/ContactForm.tsx`

### Modified Files
- `PartialBill/src/App.tsx` (added routes & chatbot)
- `PartialBill/src/pages/patient/PatientDashboard.tsx` (added navigation & tips)
- `PartialBill/src/pages/billing/BillingDashboard.tsx` (added navigation & tips)
- `backend/server.js` (added AI endpoints)
- `backend/package.json` (added openai dependency)

### Config Files
- `backend/.env.example` (environment template)

---

## 🎯 Next Steps

1. **Deploy Backend**: Host on Firebase Cloud Functions or similar
2. **Add Real FAQs**: Update FAQ database with actual content
3. **Enhance OpenAI System Prompts**: Customize for your healthcare domain
4. **Analytics**: Track which AI features are most used
5. **Admin Dashboard**: Manage FAQs, monitor support tickets, view analytics
6. **User Feedback**: Add rating system for chatbot responses

---

## 📞 Support

For issues or questions about the AI features:
1. Check the `.github/copilot-instructions.md` for architecture details
2. Review backend error logs: `backend/server.js` output
3. Check browser console: F12 → Console tab
4. Verify environment variables: `backend/.env`

Happy chatting! 🤖
