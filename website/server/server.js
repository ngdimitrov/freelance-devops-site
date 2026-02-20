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
