// Инициализиране на иконите (Lucide)
lucide.createIcons();

// Автоматична година във футъра
document.getElementById('year').textContent = new Date().getFullYear();

// --- 1. МОБИЛНО МЕНЮ ---
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let isMenuOpen = false;

if (menuBtn && mobileMenu) {
    // Отваряне/Затваряне
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Спира клика да не затвори менюто веднага
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
        } else {
            mobileMenu.classList.add('hidden');
        }
    });

    // Затваряне при клик извън менюто
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            isMenuOpen = false;
            mobileMenu.classList.add('hidden');
        }
    });

    // Затваряне при клик на линк в менюто
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            mobileMenu.classList.add('hidden');
        });
    });
}

// --- 2. GEMINI AI ARCHITECT ---
async function generateArchitecture() {
    console.log("🚀 AI Function triggered");
    
    const inputField = document.getElementById('ai-input');
    const resultDiv = document.getElementById('ai-result');
    const resultText = document.getElementById('ai-text');
    const loadingDiv = document.getElementById('ai-loading');
    const errorDiv = document.getElementById('ai-error');
    const btn = document.getElementById('ai-btn');

    // Взимане на ключа от .env файла чрез Vite
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Проверка за ключа
    if (!apiKey) {
        console.error("Missing API Key");
        alert("ГРЕШКА: Липсва API ключ в .env файла!");
        return;
    }

    const userInput = inputField.value.trim();
    if (!userInput) {
        alert("Please describe your infrastructure needs.");
        return;
    }

    // UI: Показване на зареждане
    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = `<span>Thinking...</span>`;

    const systemPrompt = `Act as Nikolay Dimitrov, a Senior AWS DevOps Engineer. 
    Provide a concise, high-level technical solution (max 100 words).
    Focus on AWS services (ECS, Lambda, RDS, S3) and Terraform. 
    Use bolding for service names.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userInput }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        if (!response.ok) throw new Error('Google API Error');

        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        
        // Форматиране на удебеления текст (**text** -> <b>text</b>)
        const formattedText = rawText.replace(/\*\*(.*?)\*\*/g, '<span class="text-indigo-400 font-bold">$1</span>');

        resultText.innerHTML = formattedText;
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        errorDiv.textContent = "Error: " + error.message;
        errorDiv.classList.remove('hidden');
    } finally {
        loadingDiv.classList.add('hidden');
        btn.disabled = false;
        btn.innerHTML = `<span>Generate Strategy ✨</span>`;
    }
}

// --- 3. EXPOSE TO WINDOW ---
// Тъй като това е модул, трябва ръчно да кажем, че тази функция е глобална,
// за да може бутонът onclick="generateArchitecture()" в HTML да я вижда.
window.generateArchitecture = generateArchitecture;


// --- 3. CONTACT FORM (RESEND INTEGRATION) ---
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const statusDiv = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Honeypot
        const honeypot = document.getElementById('website-field');
        if (honeypot && honeypot.value) return; 

        // UI Loading
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span> <i data-lucide="loader-2" class="ml-2 w-4 h-4 animate-spin"></i>`;
        lucide.createIcons();

        // Данни от формата
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            // Изпращане към локалния Express сървър
            // В продукция (Vercel/Netlify), това ще бъде просто '/api/contact'
            const response = await fetch('api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                statusDiv.textContent = "Email sent successfully!";
                statusDiv.className = "text-sm font-medium text-center h-5 text-green-400 opacity-100";
                contactForm.reset();
            } else {
                throw new Error(result.error || 'Failed to send');
            }
        } catch (error) {
            console.error('Email error:', error);
            statusDiv.textContent = "Error sending email. Please try LinkedIn.";
            statusDiv.className = "text-sm font-medium text-center h-5 text-red-400 opacity-100";
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            lucide.createIcons();
        }
    });
}

// --- 4. LEGAL MODAL LOGIC (PRIVACY & TERMS) ---
const legalModal = document.getElementById('legal-modal');

// Отваряне на модала
window.openLegalModal = (sectionId) => {
    if (!legalModal) return;
    
    // Показване
    legalModal.classList.remove('hidden');
    
    // Скролване до 'privacy' или 'terms' вътре в модала
    if (sectionId) {
        // Търсим елемент с ID "legal-privacy" или "legal-terms"
        const targetSection = document.getElementById(`legal-${sectionId}`);
        if (targetSection) {
            // Малко закъснение, за да се рендира модалът
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    
    // Забрана на скролването на основния сайт
    document.body.style.overflow = 'hidden';
};

// Затваряне на модала
window.closeLegalModal = () => {
    if (!legalModal) return;
    legalModal.classList.add('hidden');
    document.body.style.overflow = ''; // Връщане на скрола
};

// Затваряне с ESC бутон
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !legalModal.classList.contains('hidden')) {
        window.closeLegalModal();
    }
});