// Hamburger menu toggle
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburgerBtn');
  const overlay = document.getElementById('menuOverlay');
  
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
  overlay.classList.toggle('active');
  
  document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

// Close menu when a link is clicked
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      const navLinks = document.getElementById('navLinks');
      const hamburger = document.getElementById('hamburgerBtn');
      const overlay = document.getElementById('menuOverlay');
      
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Set active nav link based on current page
  function setActiveNavLink() {
    // Get current page from URL
    const fullPath = window.location.pathname;
    const fileName = fullPath.split('/').pop();
    
    // Handle different URL formats
    let currentPage = 'index.html'; // default
    if (fileName && fileName !== '' && fileName.includes('.html')) {
      currentPage = fileName;
    } else if (fileName === '' || fileName === undefined) {
      currentPage = 'index.html';
    }
    
    console.log('Current page detected:', currentPage); // Debug log
    
    // Remove existing active classes
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current page link
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      console.log('Checking link:', href, 'against page:', currentPage); // Debug log
      if (href === currentPage) {
        link.classList.add('active');
        console.log('Added active to:', href); // Debug log
      }
    });
  }
  
  // Call the function
  setActiveNavLink();
  
  // Also call it after a short delay to ensure DOM is ready
  setTimeout(setActiveNavLink, 100);

  // Set language from localStorage
  const savedLang = localStorage.getItem('leafsense-lang') || 'en';
  if (typeof setLanguage === 'function') setLanguage(savedLang);

  // Set dark mode from localStorage
  const savedDarkMode = localStorage.getItem('leafsense-dark-mode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('#darkToggle i');
    if (icon) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }
  }
});

// Close menu on window resize if screen becomes desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('menuOverlay');
    
    if (navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
});

/* ═══════════════════════════════════════
   SHARED UTILITIES
   ═══════════════════════════════════════ */

function showToast(message, type = 'info') {
  const existing = document.querySelector('.leafsense-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `leafsense-toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#d32f2f' : type === 'success' ? '#388e3c' : '#1976d2'};
    color: white;
    padding: 0.9rem 2rem;
    border-radius: 40px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function apiPost(endpoint, body, isFormData = false) {
  try {
    const options = {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    };
    if (!isFormData) options.headers = { 'Content-Type': 'application/json' };

    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    showToast(error.message || 'Network error. Please try again.', 'error');
    throw error;
  }
}

async function apiGet(endpoint) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    showToast(error.message || 'Network error. Please try again.', 'error');
    throw error;
  }
}

function showLoading(container, text) {
  container.innerHTML = `<div class="loader"></div><p style="margin-top:1rem;color:var(--text-secondary)">${text || 'Loading...'}</p>`;
}

// Translation dictionary
const translations = {
  en: {
    'nav-home': 'Home',
    'nav-predict': 'Predict Disease',
    'nav-chat': 'Chat',
    'nav-recommend': 'Crop Advice',
    'nav-soil': 'Soil Health',
    'nav-weather': 'Irrigation',
    'nav-news': 'News Bulletin',
    'nav-gallery': 'Gallery',
    'nav-about': 'About',
    'nav-contact': 'Contact',
    'footer-attribution': 'leaf photos from <a href="https://unsplash.com" target="_blank">Unsplash</a> (demo use)',
    'footer-about': 'about',
    'footer-contact': 'contact',
    'footer-brand': '🌿 2026 AgroVision'
  },
  kn: {
    'nav-home': 'ಮುಖಪುಟ',
    'nav-predict': 'ರೋಗ ಪತ್ತೆ',
    'nav-chat': 'ಚಾಟ್',
    'nav-recommend': 'ಬೆಳೆ ಸಲಹೆ',
    'nav-soil': 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
    'nav-weather': 'ನೀರಾವರಿ',
    'nav-news': 'ಸುದ್ದಿ ಬುಲೆಟಿನ್',
    'nav-gallery': 'ಗ್ಯಾಲರಿ',
    'nav-about': 'ನಮ್ಮ ಬಗ್ಗೆ',
    'nav-contact': 'ಸಂಪರ್ಕ',
    'footer-attribution': 'ಎಲೆ ಫೋಟೋಗಳು <a href="https://unsplash.com" target="_blank">Unsplash</a> ನಿಂದ (ಡೆಮೊ ಬಳಕೆ)',
    'footer-about': 'ನಮ್ಮ ಬಗ್ಗೆ',
    'footer-contact': 'ಸಂಪರ್ಕ',
    'footer-brand': '🌿 2026 ಲೀಫ್ಸೆನ್ಸ್'
  }
};

// Function to set language
function setLanguage(lang) {
  localStorage.setItem('leafsense-lang', lang);
  
  const enBtn = document.getElementById('lang-en');
  const knBtn = document.getElementById('lang-kn');
  if (enBtn) enBtn.classList.remove('active');
  if (knBtn) knBtn.classList.remove('active');
  const activeBtn = document.getElementById(`lang-${lang}`);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      if (key === 'footer-attribution') {
        el.innerHTML = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });

  if (typeof window.updateChatTranslation === 'function') {
    window.updateChatTranslation(lang);
  }
}

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const icon = document.querySelector('#darkToggle i');
  const isDark = document.body.classList.contains('dark-mode');
  
  localStorage.setItem('leafsense-dark-mode', isDark);
  
  if (icon) {
    if (isDark) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }
}
