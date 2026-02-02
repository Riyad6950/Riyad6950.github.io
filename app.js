// ================= DARK MODE TOGGLE =================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.checked = true;
}

themeToggle.addEventListener('change', function () {
    if (this.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
});

// ================= SMOOTH SCROLLING =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');

        if (href === '#top' || href === '#') {
            globalThis.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ================= PERFORMANCE UTILITIES =================
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(null, args), delay);
    };
};

const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn.apply(null, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ================= NAVIGATION HIGHLIGHT =================
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.main-nav a');
let sectionOffsets = [];

function updateSectionOffsets() {
    sectionOffsets = Array.from(sections).map(section => ({
        id: section.getAttribute('id'),
        top: section.offsetTop - 200
    }));
}

function highlightNavLink() {
    const scrollPos = globalThis.pageYOffset;
    let current = '';

    for (const section of sectionOffsets) {
        if (scrollPos >= section.top) {
            current = section.id;
        } else {
            break;
        }
    }

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

// ================= HEADER SCROLL =================
const headerEl = document.querySelector('header');
function updateHeader() {
    if (globalThis.pageYOffset > 50) {
        headerEl.classList.add('scrolled');
    } else {
        headerEl.classList.remove('scrolled');
    }
}

// Optimized Scroll Manager
let isTicking = false;
globalThis.addEventListener('scroll', () => {
    if (!isTicking) {
        globalThis.requestAnimationFrame(() => {
            highlightNavLink();
            updateHeader();
            isTicking = false;
        });
        isTicking = true;
    }
}, { passive: true });

// Initial calculations
updateSectionOffsets();
globalThis.addEventListener('resize', debounce(updateSectionOffsets, 200), { passive: true });

// ================= MOBILE MENU TOGGLE =================
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const navLinksItems = document.querySelectorAll('.main-nav a');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        body.classList.toggle('no-scroll');
    });

    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.classList.remove('no-scroll');
        });
    });

    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target) && mainNav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.classList.remove('no-scroll');
        }
    });
}

// ================= CONTACT FORM =================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !message) {
            showNotification('Please fill in all fields!', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email!', 'error');
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        const formAction = 'https://formspree.io/f/xpwzqzqz';

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        showNotification('Sending message...', 'success');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        formData.append('_subject', `Portfolio Message from ${name}`);

        fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
            .then(response => {
                if (response.ok) {
                    showNotification('Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    showNotification('Oops! Problem sending message.', 'error');
                }
            })
            .catch(() => showNotification('Network error.', 'error'))
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
    });
}

// ================= NOTIFICATION SYSTEM =================
function showNotification(message, type = 'success') {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-main);
        padding: 1.25rem 2.5rem;
        border-radius: var(--radius-md);
        border: 4px solid ${type === 'success' ? 'var(--accent)' : 'var(--accent-highlight)'};
        font-family: var(--font-body);
        font-weight: 700;
        z-index: 10000;
        box-shadow: var(--shadow-hover);
        animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out forwards';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// ================= BACK TO TOP =================
const backTopButton = document.querySelector('.back-top');
if (backTopButton) {
    backTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ================= CONSOLE SIGNATURE =================
console.log(`
%c
╔═══════════════════════════════════════╗
║                10VIR                  ║
║      STRICT UI SYSTEM ENFORCED        ║
╚═══════════════════════════════════════╝
`, 'color: var(--accent-highlight); font-family: monospace; font-size: 12px;');

console.log('✅ Portfolio optimized and initialized.');

