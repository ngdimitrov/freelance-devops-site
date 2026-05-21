// Init Lucide icons
lucide.createIcons();

// Auto-update year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let isMenuOpen = false;

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        isMenuOpen ? mobileMenu.classList.remove('hidden') : mobileMenu.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            isMenuOpen = false;
            mobileMenu.classList.add('hidden');
        }
    });
}

// GEMINI AI
async function generateArchitecture() {
    const inputField = document.getElementById('ai-input');
    const resultDiv = document.getElementById('ai-result');
    const resultText = document.getElementById('ai-text');
    const loadingDiv = document.getElementById('ai-loading');
    const errorDiv = document.getElementById('ai-error');
    const btn = document.getElementById('ai-btn');


    const userInput = inputField.value.trim();
    if (!userInput) {
        alert("Please describe your infrastructure needs.");
        return;
    }

    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = `<span>Thinking...</span> <i data-lucide="loader-2" class="ml-2 w-4 h-4 animate-spin"></i>`;
    lucide.createIcons();

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userInput })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        const rawText = data?.text;
        if (!rawText) {
            throw new Error('Empty response');
        }

        const escaped = rawText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        const formattedText = escaped.replace(/\*\*(.*?)\*\*/g, '<span class="text-indigo-400 font-bold">$1</span>');

        resultText.innerHTML = formattedText;
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error("AI Error:", error);
        errorDiv.textContent = "System overload or configuration error. Please try again.";
        errorDiv.classList.remove('hidden');
    } finally {
        loadingDiv.classList.add('hidden');
        btn.disabled = false;
        btn.innerHTML = `<span>Generate Strategy ✨</span>`;
    }
}
window.generateArchitecture = generateArchitecture;

// CHARACTER COUNTERS
document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
    const maxLen = textarea.getAttribute('maxlength');
    const counterId = textarea.id + '-count';
    const counter = document.getElementById(counterId);
    if (!counter) return;
    textarea.addEventListener('input', () => {
        counter.textContent = textarea.value.length;
        counter.parentElement.classList.toggle('text-amber-500', textarea.value.length >= maxLen * 0.9);
        counter.parentElement.classList.toggle('text-red-400', textarea.value.length >= maxLen);
    });
});

// CONTACT FORM
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const statusDiv = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const honeypot = document.getElementById('website-field');
        if (honeypot && honeypot.value) return; 

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span> <i data-lucide="loader-2" class="ml-2 w-4 h-4 animate-spin"></i>`;
        lucide.createIcons();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            website: honeypot ? honeypot.value : ''
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                contactForm.classList.add('hidden');
                const successDiv = document.getElementById('contact-success');
                successDiv.classList.remove('hidden');
                successDiv.classList.add('flex');
                lucide.createIcons();
                launchConfetti();
                return;
            } else {
                throw new Error(result.error || 'Failed to send');
            }
        } catch (error) {
            console.error('Email error:', error);
            statusDiv.textContent = "Error sending email.";
            statusDiv.className = "text-sm font-medium text-center h-5 text-red-400 opacity-100";
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            lucide.createIcons();
        }
    });
}

// CONFETTI
function launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    const colors = ['#818cf8', '#6366f1', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = 50 + (Math.random() - 0.5) * 20 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.6 + 's';
        piece.style.animationDuration = 1.2 + Math.random() * 1 + 's';
        const drift = (Math.random() - 0.5) * 300;
        piece.style.setProperty('--drift', drift + 'px');
        container.appendChild(piece);
    }
    setTimeout(() => {
        container.querySelectorAll('.confetti-piece').forEach(p => p.remove());
    }, 3000);
}

// LEGAL MODAL
const legalModal = document.getElementById('legal-modal');

window.openLegalModal = (sectionId) => {
    if (!legalModal) return;
    legalModal.classList.remove('hidden');
    
    if (sectionId) {
        const targetSection = document.getElementById(`legal-${sectionId}`);
        if (targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    document.body.style.overflow = 'hidden';
};

window.closeLegalModal = () => {
    if (!legalModal) return;
    legalModal.classList.add('hidden');
    document.body.style.overflow = '';
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal && !legalModal.classList.contains('hidden')) {
        window.closeLegalModal();
    }
});