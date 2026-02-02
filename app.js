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

// ================= NAVIGATION HIGHLIGHT =================
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.main-nav a');

function highlightNavLink() {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (globalThis.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

globalThis.addEventListener('scroll', highlightNavLink);

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

        showNotification('Message sent successfully!', 'success');
        contactForm.reset();
    });
}

// ================= NOTIFICATION SYSTEM - STRICT HIGH CONTRAST =================
function showNotification(message, type = 'success') {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;


    // Strict Rule: No RGB/HEX. Use Variables and Border/Scale only.
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
        font-size: 0.95rem;
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

// ================= HEADER SCROLL =================
const headerEl = document.querySelector('header');
globalThis.addEventListener('scroll', () => {
    if (globalThis.pageYOffset > 50) {
        headerEl.classList.add('scrolled');
    } else {
        headerEl.classList.remove('scrolled');
    }
});

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

console.log('✅ Portfolio initialized with high-contrast system.');
