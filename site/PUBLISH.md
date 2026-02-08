# How to publish this website (detailed guide)

This guide walks you through putting your site online and connecting your domain **clientassociation.com** to it.

---

## What you’re publishing

- **Front-end:** HTML, CSS, and JavaScript (login, signup, verify, main page).
- **Back-end:** A Node.js server (`site/server.js`) that:
  - Serves those pages.
  - Sends verification emails via Resend when someone signs up.

To publish, you need to:

1. Put your code on GitHub so a host can pull it.
2. Deploy the app to a host that runs Node.js (e.g. Render).
3. Add your Resend API key so emails work.
4. Point clientassociation.com to that host using DNS.

---

## Step 1: Put your code on GitHub

GitHub will hold your code. The hosting service (Render) will connect to GitHub and deploy from there.

### 1.1 Open Terminal and go to your project

- On Mac: **Terminal** (or the terminal inside Cursor/VS Code).
- Run (use your real project path if it’s different):

```bash
cd "/Users/miykaelbarner/Kept quiet"
```

### 1.2 Turn the folder into a Git repo (if it isn’t already)

```bash
git init
```

If you see “Reinitialized existing Git repository”, that’s fine.

### 1.3 Add all files and make a first commit

```bash
git add .
git status
```

You should see a list of files. Then:

```bash
git commit -m "Initial commit - site and server"
```

### 1.4 Create a new repository on GitHub

1. Go to [https://github.com/new](https://github.com/new).
2. **Repository name:** e.g. `clientassociation` or `kept-quiet`.
3. Leave it **Public**.
4. Do **not** check “Add a README” (you already have code).
5. Click **Create repository**.

### 1.5 Connect your local folder to GitHub and push

GitHub will show commands; use these (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

You may be asked to sign in to GitHub (in the browser or via a token). After this, your code is on GitHub.

---

## Step 2: Deploy with Render (free tier)

Render will run your Node server and serve your site. The free tier is enough for this project.

### 2.1 Create a Render account and start a new Web Service

1. Go to [https://render.com](https://render.com).
2. Sign up (e.g. “Sign up with GitHub” so Render can see your repos).
3. In the dashboard, click **New +** → **Web Service**.

### 2.2 Connect your GitHub repository

1. If asked, connect or authorize GitHub so Render can read your repos.
2. Find the repo you just pushed (e.g. `clientassociation` or `kept-quiet`) and click **Connect**.

### 2.3 Fill in the Web Service settings

Use these exactly unless you have a reason to change them:

| Field | What to enter |
|--------|----------------|
| **Name** | `clientassociation` (or any name you like; this becomes part of the default URL) |
| **Region** | Choose the one closest to you or your users |
| **Root Directory** | Leave **blank** (Render uses the whole repo) |
| **Runtime** | **Node** |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

- **Build Command** tells Render how to install dependencies.
- **Start Command** tells Render how to run your server (`npm start` runs `node site/server.js`).

### 2.4 Add your Resend API key (so emails work)

1. Before clicking **Create Web Service**, find the **Environment** section (often an “Advanced” or “Environment” toggle).
2. Click **Add Environment Variable**.
3. **Key:** `RESEND_API_KEY`
4. **Value:** paste your Resend API key (the one that starts with `re_` from `site/auth-backend/.env` or from [resend.com](https://resend.com) → API Keys).

Without this, the site will run but verification emails won’t send.

### 2.5 Create the Web Service

Click **Create Web Service**. Render will:

- Clone your repo
- Run `npm install`
- Run `npm start`
- Expose your app on the internet

The first deploy can take a few minutes. You’ll see a log; wait until it says the service is “Live” and shows a URL like:

**https://clientassociation.onrender.com**

Open that URL in your browser. You should see your main page. Try:

- **https://clientassociation.onrender.com/login.html**
- **https://clientassociation.onrender.com/signup.html**

Sign up with your real email and check that you receive the verification email.

---

## Step 3: Connect your domain (clientassociation.com)

Right now the site is at `something.onrender.com`. To use **clientassociation.com**, you point that domain to Render using DNS.

### 3.1 Add the custom domain in Render

1. In the Render dashboard, open your **Web Service** (the one you just created).
2. Go to **Settings** (left sidebar).
3. Scroll to **Custom Domains**.
4. Click **Add Custom Domain**.
5. Enter: **clientassociation.com**
6. (Optional) Also add **www.clientassociation.com** if you want “www” to work.

Render will show you which DNS records to add. You’ll see something like:

- For **clientassociation.com** (root): an **A record** or **CNAME** with a value Render gives you.
- For **www.clientassociation.com**: a **CNAME** pointing to something like `your-app.onrender.com`.

Write these down or keep the Render tab open; you’ll need them at your domain registrar.

### 3.2 Log in to where you bought the domain

Go to the place you bought **clientassociation.com** (e.g. Namecheap, GoDaddy, Google Domains, Cloudflare, etc.) and sign in.

### 3.3 Open DNS settings

Find the DNS or “Manage DNS” / “DNS Records” section for clientassociation.com. You’ll see a list of records (A, CNAME, MX, etc.).

### 3.4 Add the records Render gave you

- **For the root domain (clientassociation.com):**  
  Render may give you:
  - An **A record**: **Name/Host** = `@` (or leave blank), **Value** = the IP Render shows, **TTL** = 3600 (or default).
  - Or a **CNAME**: **Name** = `@` (if your registrar allows CNAME on root), **Value** = the hostname Render gives (e.g. `your-app.onrender.com`).
- **For www (optional):**  
  Add a **CNAME**: **Name** = `www`, **Value** = the Render hostname (e.g. `your-app.onrender.com`).

Save the changes. DNS can take from a few minutes to 24–48 hours to update; often it’s 5–30 minutes.

### 3.5 Wait for Render to verify

Back in Render → **Settings** → **Custom Domains**, the domain may show “Pending” until DNS propagates. When it turns to a green check or “Verified”, you’re done.

### 3.6 Use HTTPS

In Render, under the same Custom Domains or SSL section, make sure **Redirect HTTP to HTTPS** (or equivalent) is on so visitors always get **https://clientassociation.com**.

---

## Step 4: Test the live site

1. Open **https://clientassociation.com** (and **https://www.clientassociation.com** if you set it up).
2. Click through to Login / Sign up.
3. Create an account with your real email and confirm you get the verification email.
4. Complete verification and log in.

If anything doesn’t work, see the troubleshooting section below.

---

## Running the site locally (optional)

To run the same app on your computer:

```bash
cd "/Users/miykaelbarner/Kept quiet"
npm install
npm start
```

Then open **http://localhost:3000** in your browser. The server will use the `.env` file in `site/auth-backend/` for `RESEND_API_KEY` when running locally.

---

## Troubleshooting

**Site doesn’t load at the Render URL**  
- Check the **Logs** tab for your Render service for errors.
- Ensure **Start Command** is exactly `npm start` and **Build Command** is `npm install`.

**Verification emails don’t arrive**  
- Confirm **RESEND_API_KEY** is set in Render → your service → **Environment** (and that the key is correct and active in Resend).
- Check Resend’s dashboard for send logs or errors.
- Check spam/junk for the verification email.

**clientassociation.com doesn’t open or shows an error**  
- Wait longer for DNS (up to 48 hours in rare cases).
- Double-check the A and CNAME values you entered match what Render shows.
- In Render, confirm the custom domain shows as verified and that SSL/HTTPS is enabled.

**Changes to the site don’t appear**  
- Push your changes to GitHub (`git add .` → `git commit -m "Update..."` → `git push`).
- Render will redeploy automatically if “Auto-Deploy” is on; otherwise trigger a manual deploy from the Render dashboard.

---

## Checklist

- [ ] Code pushed to GitHub
- [ ] New Web Service on Render, repo connected
- [ ] Build: `npm install`, Start: `npm start`
- [ ] `RESEND_API_KEY` added in Render Environment
- [ ] Site works at the `*.onrender.com` URL and signup email works
- [ ] Custom domain **clientassociation.com** added in Render
- [ ] DNS records added at your domain registrar
- [ ] https://clientassociation.com loads and signup/verification work

---

## Other hosting options (short)

- **Railway:** Similar to Render: connect GitHub, set start command `npm start`, add `RESEND_API_KEY`, then add custom domain in project settings.
- **Fly.io:** Uses CLI; you’d run `fly launch`, set `RESEND_API_KEY` with `fly secrets set`, then `fly deploy`, and add the domain in the Fly dashboard.
- **VPS (e.g. DigitalOcean):** You’d install Node, clone the repo, run `node site/server.js` (e.g. with pm2), put Nginx or Caddy in front, and point clientassociation.com to the server IP with SSL (e.g. Let’s Encrypt).

For the least setup, sticking with **Render** and following this guide is the simplest path.
