import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import dotenv from 'dotenv';

//  .env environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;

// Middleware
app.use(cors()); // allow FE to communicate with BE
app.use(express.json());

// Init Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// API endpoint
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


app.use(express.static(path.join(__dirname, '../dist')));


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


// Gemini API endpoint
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    const systemPrompt = `Act as Nikolay Dimitrov, a Senior AWS DevOps Engineer. 
    Provide a concise, high-level technical solution (max 100 words).
    Focus on AWS services (ECS, Lambda, RDS, S3) and Terraform. 
    Use bolding for service names.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Google API Error');
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});
