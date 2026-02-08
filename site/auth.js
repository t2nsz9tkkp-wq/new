// ==========================================
// SITE CONFIG
// ==========================================
const SITE_DOMAIN = 'clientassociation.com';

// ==========================================
// USER DATABASE (LocalStorage)
// ==========================================
class UserDatabase {
  static getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  static saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  static findUser(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }

  static updateUser(email, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
      return true;
    }
    return false;
  }
}

// ==========================================
// VERIFICATION CODE MANAGEMENT
// ==========================================
class VerificationManager {
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static saveVerification(email, code) {
    const verification = {
      email,
      code,
      timestamp: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000)
    };
    localStorage.setItem('currentVerification', JSON.stringify(verification));
  }

  static getVerification() {
    const data = localStorage.getItem('currentVerification');
    return data ? JSON.parse(data) : null;
  }

  static clearVerification() {
    localStorage.removeItem('currentVerification');
  }

  static isCodeValid(inputCode) {
    const verification = this.getVerification();
    if (!verification) return { valid: false, message: 'No verification found' };
    
    if (Date.now() > verification.expiresAt) {
      return { valid: false, message: 'Code has expired' };
    }
    
    if (verification.code !== inputCode) {
      return { valid: false, message: 'The code is incorrect' };
    }
    
    return { valid: true, message: 'The code is correct' };
  }
}

// ==========================================
// EMAIL SENDING (backend API or fallback)
// ==========================================
async function sendVerificationEmail(name, email, code) {
  // Prefer backend API (Resend) when the app is served from the auth server
  try {
    const res = await fetch('/api/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, code })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Email service unavailable' };
  } catch (err) {
    // Network error or not running from backend – fallback: show code on verify page
    return { success: false, error: err.message || 'Could not reach email server' };
  }
}

// ==========================================
// MESSAGE DISPLAY
// ==========================================
function showMessage(elementId, message, type) {
  const messageEl = document.getElementById(elementId);
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
  }
}

function hideMessage(elementId) {
  const messageEl = document.getElementById(elementId);
  if (messageEl) {
    messageEl.style.display = 'none';
  }
}

// ==========================================
// SESSION MANAGEMENT
// ==========================================
function createSession(email) {
  localStorage.setItem('userSession', JSON.stringify({ email, loginTime: Date.now() }));
}

function getSession() {
  const data = localStorage.getItem('userSession');
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem('userSession');
}

function isLoggedIn() {
  return getSession() !== null;
}

// ==========================================
// PAGE: LOGIN
// ==========================================
if (window.location.pathname.endsWith('login.html') || window.location.pathname === '/') {
  if (isLoggedIn()) {
    window.location.href = 'index.html';
  }

  // SIGNUP BUTTON - SIMPLE NAVIGATION
  const showSignupBtn = document.getElementById('showSignup');
  if (showSignupBtn) {
    showSignupBtn.addEventListener('click', () => {
      window.location.href = 'signup.html';
    });
  }

  // LOGIN FORM
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideMessage('loginMessage');

      const name = document.getElementById('loginName').value.trim();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      const user = UserDatabase.findUser(email);

      if (!user || user.name !== name || user.password !== password) {
        showMessage('loginMessage', 'Login not found', 'error');
        return;
      }

      if (!user.verified) {
        showMessage('loginMessage', 'Please verify your email first', 'error');
        return;
      }

      createSession(email);
      showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    });
  }
}

// ==========================================
// PAGE: SIGNUP
// ==========================================
if (window.location.pathname.endsWith('signup.html')) {
  // LOGIN LINK - SIMPLE NAVIGATION
  const gotoLogin = document.getElementById('gotoLogin');
  if (gotoLogin) {
    gotoLogin.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }

  // SIGNUP FORM
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage('signupMessage');

      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        showMessage('signupMessage', 'Passwords do not match', 'error');
        return;
      }

      if (UserDatabase.findUser(email)) {
        showMessage('signupMessage', 'An account with this email already exists', 'error');
        return;
      }

      const code = VerificationManager.generateCode();
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const emailResult = await sendVerificationEmail(name, email, code);

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // If email couldn't be sent (e.g. EmailJS not configured), still allow signup
      // and show the code on the verify page so the user can complete verification
      if (!emailResult.success) {
        sessionStorage.setItem('verificationEmailSkipped', '1');
      }

      UserDatabase.addUser({
        name,
        email,
        password,
        verified: false,
        createdAt: Date.now()
      });

      VerificationManager.saveVerification(email, code);
      sessionStorage.setItem('pendingVerification', email);

      window.location.href = 'verify.html';
    });
  }
}

// ==========================================
// PAGE: VERIFY
// ==========================================
if (window.location.pathname.endsWith('verify.html')) {
  const pendingEmail = sessionStorage.getItem('pendingVerification');
  if (!pendingEmail) {
    window.location.href = 'login.html';
  }

  const verifyEmailEl = document.getElementById('verifyEmail');
  if (verifyEmailEl) {
    verifyEmailEl.textContent = pendingEmail;
  }

  // When email wasn't sent (e.g. EmailJS not configured), show the code on the page
  const emailSkipped = sessionStorage.getItem('verificationEmailSkipped');
  if (emailSkipped) {
    sessionStorage.removeItem('verificationEmailSkipped');
    const verification = VerificationManager.getVerification();
    if (verification) {
      const codeHint = document.getElementById('verificationCodeHint');
      if (codeHint) {
        codeHint.textContent = `Your verification code: ${verification.code}`;
        codeHint.style.display = 'block';
      }
    }
  }

  let expirationTimer;
  let resendCooldownTimer;

  function startExpirationTimer() {
    const verification = VerificationManager.getVerification();
    if (!verification) return;

    clearInterval(expirationTimer);
    expirationTimer = setInterval(() => {
      const timeLeft = verification.expiresAt - Date.now();
      if (timeLeft <= 0) {
        clearInterval(expirationTimer);
        document.getElementById('timer').textContent = '0:00';
        showMessage('verifyMessage', 'Code has expired. Please resend.', 'error');
        document.querySelector('#verifyForm button').disabled = true;
        return;
      }

      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  function startResendCooldown() {
    let cooldown = 30;
    const resendBtn = document.getElementById('resendCode');
    const timerEl = document.getElementById('resendTimer');
    
    resendBtn.disabled = true;
    
    clearInterval(resendCooldownTimer);
    resendCooldownTimer = setInterval(() => {
      cooldown--;
      timerEl.textContent = cooldown;
      
      if (cooldown <= 0) {
        clearInterval(resendCooldownTimer);
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Code';
      }
    }, 1000);
  }

  startExpirationTimer();
  startResendCooldown();

  // VERIFY FORM
  const verifyForm = document.getElementById('verifyForm');
  if (verifyForm) {
    verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideMessage('verifyMessage');

      const code = document.getElementById('verificationCode').value;
      const result = VerificationManager.isCodeValid(code);

      if (!result.valid) {
        showMessage('verifyMessage', result.message, 'error');
        return;
      }

      UserDatabase.updateUser(pendingEmail, { verified: true });
      VerificationManager.clearVerification();
      sessionStorage.removeItem('pendingVerification');

      showMessage('verifyMessage', 'Account verified! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }

  // RESEND BUTTON
  const resendBtn = document.getElementById('resendCode');
  if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
      hideMessage('verifyMessage');
      
      const user = UserDatabase.findUser(pendingEmail);
      if (!user) {
        showMessage('verifyMessage', 'User not found', 'error');
        return;
      }

      const code = VerificationManager.generateCode();
      resendBtn.disabled = true;
      resendBtn.textContent = 'Sending...';

      const emailResult = await sendVerificationEmail(user.name, user.email, code);

      resendBtn.disabled = false;
      
      if (!emailResult.success) {
        resendBtn.textContent = 'Resend Code';
        showMessage('verifyMessage', 'Failed to resend code', 'error');
        return;
      }

      VerificationManager.saveVerification(user.email, code);
      startExpirationTimer();
      startResendCooldown();

      showMessage('verifyMessage', 'New code sent!', 'success');
      setTimeout(() => hideMessage('verifyMessage'), 2000);
    });
  }
}

// ==========================================
// PAGE: INDEX (Main Site)
// ==========================================
if (window.location.pathname.endsWith('index.html')) {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  } else {
    // GET USER NAME FOR PERSONALIZATION
    const session = getSession();
    if (!session) {
      window.location.href = 'login.html';
    } else {
      const user = UserDatabase.findUser(session.email);
      const displayName = user?.name || 'User';

      // REPLACE "Miykael Barner" WITH USER'S NAME
      function replaceText(searchText, replaceText) {
        document.title = document.title.replace(new RegExp(searchText, 'g'), replaceText);

        document.body.innerHTML = document.body.innerHTML.replace(
          new RegExp(searchText, 'g'),
          replaceText
        );
      }

      replaceText('Miykael Barner', displayName);
      replaceText('MIYKAEL BARNER', displayName.toUpperCase());
      replaceText('miykael barner', displayName.toLowerCase());

      // YEAR IN FOOTER
      const yearEl = document.getElementById('year');
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }

      // LOGOUT BUTTON
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          clearSession();
          window.location.href = 'login.html';
        });
      }

      // SMOOTH SCROLL FOR NAV LINKS
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;

          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
  }
}