const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');

// Load .env from site/ or site/auth-backend/ so the API key is found
const envPaths = [
  path.join(__dirname, 'auth-backend', '.env'),
  path.join(__dirname, '.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Use body-parser to parse JSON bodies
app.use(bodyParser.json());

// Serve the site folder at root so the site is at / and /login.html etc.
app.use(express.static(__dirname));

// Load your user data (for demo, we’ll use a JSON file or in-memory object)
let users = [
  // Example user object
  // { email: 'user@example.com', loginApproved: false }
];

// You need to load your actual user database here
// For demo, let's assume you saved users in a JSON file or connect to your database

// Site domain for emails and branding
const SITE_DOMAIN = 'clientassociation.com';

// API route to send verification email (uses Resend)
app.post('/api/send-verification', async (req, res) => {
  const { name, email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, error: 'Missing name, email, or code' });
  }
  if (!resend) {
    return res.status(503).json({
      success: false,
      error: 'Email not configured. Add RESEND_API_KEY to site/auth-backend/.env'
    });
  }
  try {
    const { data, error } = await resend.emails.send({
      from: `Client Association <onboarding@resend.dev>`,
      to: [email],
      subject: `Your verification code — ${SITE_DOMAIN}`,
      html: `
        <p>Hi ${name || 'there'},</p>
        <p>Your verification code for <strong>${SITE_DOMAIN}</strong> is: <strong>${code}</strong></p>
        <p>It expires in 10 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p style="color:#666;font-size:12px;">— ${SITE_DOMAIN}</p>
      `
    });
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to send email' });
  }
});

// API route to approve login
app.post('/api/approve', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    user.loginApproved = true;
    res.json({ success: true, message: 'Login approved' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// API route to disapprove login
app.post('/api/disapprove', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    user.loginApproved = false;
    res.json({ success: true, message: 'Login disapproved' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (resend) {
    console.log('Verification emails: enabled (Resend API key loaded)');
  } else {
    console.log('Verification emails: disabled (add RESEND_API_KEY to site/auth-backend/.env or site/.env)');
  }
});