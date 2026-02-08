// Auto-fill current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form handling
const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (form && formMessage) {
  form.addEventListener('submit', (e) => {
    // Basic client-side validation and nicer UX for FormSubmit
    if (!form.checkValidity()) return;
    formMessage.textContent = 'Sending...';
    
    // Let the browser handle submission; form will submit to FormSubmit.co
    setTimeout(() => {
      formMessage.textContent = 'Message sent — thank you! I will reply within 24 hours.';
      form.reset();
    }, 800);
  });
}

