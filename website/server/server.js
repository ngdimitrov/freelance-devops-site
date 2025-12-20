import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import dotenv from 'dotenv';

// Зареждане на .env променливите
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;

// Middleware
app.use(cors()); // Позволява фронтенд да говори със сървъра
app.use(express.json());

// Инициализация на Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// API endpoint за контакт
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const data = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: ['contact@example.com'],
            subject: `New Contact from ${name}`,
            html: `
                <h3>New message from DevOps Portfolio</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
                    ${message}
                </blockquote>
            `
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve static files от Vite build
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback - за React/Vue/Svelte routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Стартираме сървъра
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
