import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load .env environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://nikolaydimitrov.dev';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

const LIMITS = { name: 100, email: 254, message: 5000, prompt: 1000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Middleware
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '16kb' }));

// Baseline security headers (zero-dependency; mirrors helmet defaults we need)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    next();
});

// Resend SDK v4+ throws at construction if the key is missing, so create the
// client lazily — a missing key fails only the contact request, not boot.
let resendClient;
const getResend = () => {
    if (!process.env.RESEND_API_KEY) return null;
    resendClient ??= new Resend(process.env.RESEND_API_KEY);
    return resendClient;
};

const escHtml = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Contact endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message, website } = req.body;

    const resend = getResend();
    if (!CONTACT_TO_EMAIL || !resend) {
        console.error('Missing CONTACT_TO_EMAIL or RESEND_API_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Server-side honeypot
    if (website) {
        return res.status(200).json({ success: true });
    }

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof message !== 'string'
    ) {
        return res.status(400).json({ error: 'Invalid field types' });
    }

    if (
        name.length > LIMITS.name ||
        email.length > LIMITS.email ||
        message.length > LIMITS.message
    ) {
        return res.status(400).json({ error: 'Field too long' });
    }

    if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    const safeName = name.replace(/[\r\n]/g, '');

    try {
        const { error } = await resend.emails.send({
            from: 'Portfolio Contact <info@nikolaydimitrov.dev>',
            to: [CONTACT_TO_EMAIL],
            replyTo: email,
            subject: `New Contact from ${safeName}`,
            html: `
                <h3>New message from DevOps Portfolio</h3>
                <p><strong>Name:</strong> ${escHtml(name)}</p>
                <p><strong>Email:</strong> ${escHtml(email)}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
                    ${escHtml(message)}
                </blockquote>
            `
        });

        // resend v4+ returns { data, error } instead of throwing on API errors
        if (error) {
            console.error('Resend API error:', error);
            return res.status(502).json({ error: 'Failed to send message' });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Gemini endpoint
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('Missing GEMINI_API_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    if (prompt.length > LIMITS.prompt) {
        return res.status(400).json({ error: 'Prompt too long' });
    }

    const systemPrompt = `You are the AI assistant on Nikolay Dimitrov's DevOps portfolio site. Nikolay is a Senior AWS & DevOps Engineer specializing in cloud infrastructure, CI/CD, and Infrastructure as Code.

ROLE: Provide high-level infrastructure strategies based on the user's description. You are an architect advisor — suggest solutions, not full implementations.

RESPONSE RULES:
- Keep responses between 80-200 words. Be concise but thorough enough to be useful.
- Structure every answer with these sections (use **bold** for section headers and AWS service names):
  1. **Architecture Overview** — 1-2 sentences summarizing the approach.
  2. **Core Services** — list the key AWS services and why each is chosen.
  3. **Infrastructure as Code** — briefly mention Terraform/CloudFormation approach.
  4. **Key Consideration** — one important tip (security, cost, scaling, etc.).
- Use bullet points for readability.
- Wrap all AWS service names and tools in **bold** (e.g. **ECS Fargate**, **Terraform**, **CloudWatch**).

SCOPE:
- AWS services: EC2, ECS, EKS, Lambda, RDS, Aurora, DynamoDB, S3, CloudFront, ALB, API Gateway, Route 53, VPC, IAM, KMS, Secrets Manager, CloudWatch, SNS, SQS, CodePipeline, ECR, and others as relevant.
- Tools: Terraform, Docker, GitHub Actions, Ansible, Prometheus, Grafana.
- Topics: high availability, auto-scaling, security best practices, cost optimization, CI/CD pipelines, monitoring & observability.

BOUNDARIES:
- If the input is unrelated to DevOps/cloud/infrastructure, respond: "I'm designed to help with cloud infrastructure and DevOps architecture. Please describe your infrastructure needs and I'll suggest a strategy."
- If the input is too vague, ask one clarifying question before providing a solution.
- Never generate code snippets — only architectural guidance.
- Never impersonate Nikolay directly. You are his AI assistant.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Google API error:', response.status, data?.error?.message);
            return res.status(502).json({ error: 'Failed to generate content' });
        }

        res.json(data);
    } catch (error) {
        console.error('Gemini Error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Static assets + SPA fallback (registered after API routes).
// Final middleware instead of app.get('*') — Express 5 / path-to-regexp 8
// no longer accepts a bare '*' string path.
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
