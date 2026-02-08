# ⚡ QUICK START – Send verification emails

## 1. Get a Resend API key

1. Go to [resend.com](https://resend.com) and sign up (free tier: 100 emails/day).
2. Open [API Keys](https://resend.com/api-keys) and create a key.
3. Copy the key (it starts with `re_`).

## 2. Configure the auth backend

1. In the `site/auth-backend` folder, copy the example env file:
   - Copy `.env.example` to `.env`
2. Edit `.env` and set your key:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

## 3. Run the server and open the site

From the **project root** (the folder that contains `site/` and `package.json`):

```bash
node site/auth-backend/server.js
```

Then in your browser open:

**http://localhost:3000/signup.html**

Sign up with your real email. The verification code will be sent to that address.

## 4. Test the flow

1. Open http://localhost:3000/signup.html  
2. Enter name, email, and password  
3. Check your email for the 6-digit code  
4. Enter the code on the verify page and finish signup  

---

**Note:** Emails are sent from `onboarding@resend.dev` (Resend’s test domain). For production you can add and verify your own domain in the Resend dashboard.

**Important:** This is a demo. For production, use a proper backend, database, and password hashing.
