# 🔧 EmailJS Setup - Step by Step Troubleshooting

## The error "Failed to send verification email" means EmailJS is not configured yet.

---

## ✅ COMPLETE SETUP CHECKLIST

Follow these steps **IN ORDER**:

### Step 1: Create EmailJS Account (5 minutes)

1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up"** (top right corner)
3. Create a **FREE** account (no credit card needed)
4. **Verify your email** - check your inbox and click the verification link

---

### Step 2: Add Email Service (3 minutes)

1. After logging into EmailJS, click **"Email Services"** in the left sidebar
2. Click the **"Add New Service"** button
3. Select **"Gmail"** (easiest option)
4. Click **"Connect Account"**
5. Sign in with your Google account
6. Allow EmailJS the required permissions
7. Give your service a name (e.g., "My Website Emails")
8. Click **"Create Service"**
9. **IMPORTANT:** Copy your **Service ID** - it looks like: `service_abc1234`
   - You'll see it on the service page after creation

---

### Step 3: Create Email Template (5 minutes)

1. Click **"Email Templates"** in the left sidebar
2. Click **"Create New Template"**
3. **DELETE ALL** the default content in the template editor
4. **COPY THIS EXACTLY** and paste it in the content area:

```
Subject: Verify Your Email - {{to_name}}

Hi {{to_name}},

Welcome! Your verification code is:

{{verification_code}}

This code will expire in {{expires_in}}.

If you didn't request this code, please ignore this email.

Best regards,
Miykael Barner
```

5. In the **"To Email"** field (at the top of the template), enter: `{{to_email}}`
6. In the **"From Name"** field, enter: `Miykael Barner` (or your name)
7. Click **"Save"**
8. **IMPORTANT:** Copy your **Template ID** - it looks like: `template_xyz5678`
   - You'll see it at the top of the template page

---

### Step 4: Get Your Public Key (1 minute)

1. Click **"Account"** in the left sidebar
2. Scroll down to the **"API Keys"** section
3. Find your **"Public Key"** (it's automatically generated)
4. **IMPORTANT:** Copy your **Public Key** - it looks like: `xYz123AbC456DeF789`

---

### Step 5: Update auth.js File (2 minutes)

1. Open the **auth.js** file in a text editor (Notepad, VS Code, etc.)
2. Find **lines 6-10** at the very top of the file
3. You'll see this:

```javascript
const EMAILJS_CONFIG = {
  serviceID: 'YOUR_SERVICE_ID',      // Replace with your EmailJS Service ID
  templateID: 'YOUR_TEMPLATE_ID',    // Replace with your EmailJS Template ID
  publicKey: 'YOUR_PUBLIC_KEY'       // Replace with your EmailJS Public Key
};
```

4. **Replace** the placeholder values with your actual IDs:

```javascript
const EMAILJS_CONFIG = {
  serviceID: 'service_abc1234',      // ← Paste your Service ID here
  templateID: 'template_xyz5678',    // ← Paste your Template ID here
  publicKey: 'xYz123AbC456DeF789'    // ← Paste your Public Key here
};
```

5. **SAVE** the file

---

### Step 6: Verify EmailJS Script is Loaded

The EmailJS library script should already be added to your HTML files. Open each file and verify you see this line **BEFORE** `<script src="auth.js"></script>`:

**In login.html, signup.html, and verify.html:**
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script src="auth.js"></script>
```

If it's missing, add it!

---

## 🧪 TEST YOUR SETUP

1. Open **login.html** in your browser
2. Click **"Create an account"**
3. Fill in the form with:
   - Your real name
   - **YOUR REAL EMAIL ADDRESS** (one you can check)
   - A password (at least 6 characters)
   - Confirm the password
4. Click **"Create Account"**
5. **Open your browser console** (Press F12, then click "Console" tab)
   - Look for any error messages
6. **Check your email inbox** (and spam folder!)
7. You should receive an email with a 6-digit code
8. Enter the code on the verification page
9. Login with your credentials

---

## 🐛 TROUBLESHOOTING

### Error: "EmailJS not configured"
**Solution:** You haven't updated the auth.js file yet. Follow Step 5 above.

### Error: "EmailJS library not loaded"
**Solution:** The EmailJS script tag is missing. Follow Step 6 above.

### Error: "Invalid public key" or "Service not found"
**Solution:** 
- Double-check you copied the IDs correctly (no extra spaces)
- Make sure you're using the Public Key, NOT the Private Key
- Verify your Service ID matches the one in your EmailJS dashboard

### Email not arriving
**Solution:**
1. Check your spam/junk folder
2. Wait 2-3 minutes (sometimes emails are delayed)
3. Go to EmailJS dashboard → Click your service → Check "Logs" for delivery status
4. Make sure the email template's "To Email" field is set to `{{to_email}}`

### Still not working?
1. Press **F12** in your browser to open Developer Tools
2. Go to the **Console** tab
3. Try creating an account again
4. Copy any error messages you see
5. The error messages will tell you exactly what's wrong

---

## 📊 Checking EmailJS Dashboard

After attempting to send an email:
1. Go to your EmailJS dashboard
2. Click on your Email Service
3. Click **"Logs"** or **"Usage"**
4. You should see your email send attempts here
5. If you see errors, they'll tell you what went wrong

---

## ✅ Success Indicators

You know it's working when:
- ✅ No errors in the browser console
- ✅ "Sending verification code..." appears briefly
- ✅ You're redirected to the verification page
- ✅ You receive an email with a 6-digit code
- ✅ EmailJS dashboard shows successful send in logs

---

## 💡 Common Mistakes

1. ❌ Forgetting to save auth.js after editing
2. ❌ Using Private Key instead of Public Key
3. ❌ Missing the EmailJS script tag in HTML files
4. ❌ Template "To Email" field not set to `{{to_email}}`
5. ❌ Typing the IDs wrong (extra spaces, quotes, etc.)

---

## 🎯 Quick Reference

**What you need from EmailJS:**
- Service ID (looks like: `service_abc1234`)
- Template ID (looks like: `template_xyz5678`)
- Public Key (looks like: `xYz123AbC456DeF789`)

**Where to put them:**
- In the `auth.js` file, lines 6-10

**Free tier limit:**
- 200 emails per month

---

## 🆘 Need More Help?

1. Check the browser console for error messages (F12)
2. Check EmailJS dashboard logs
3. Verify all three IDs are copied correctly
4. Make sure the EmailJS script is loaded in your HTML files
5. Try with a different email address

**The most common issue is simply not updating the auth.js file with your actual EmailJS credentials!**
