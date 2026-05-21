const ALLOWED_ORIGIN = "https://nikolaydimitrov.dev";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
  "Content-Type": "application/json"
};

const MAX_PROMPT_LENGTH = 1000;

const reply = (statusCode, payload) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(payload)
});

export const handler = async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
    return reply(500, { error: 'Server configuration error' });
  }

  if (!event.body) {
    return reply(400, { error: 'Missing body' });
  }

  let prompt;
  try {
    ({ prompt } = JSON.parse(event.body));
  } catch {
    return reply(400, { error: 'Invalid JSON' });
  }

  if (!prompt || typeof prompt !== 'string') {
    return reply(400, { error: 'Missing prompt' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return reply(400, { error: 'Prompt too long' });
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
      console.error("Google API error:", response.status, data?.error?.message);
      return reply(502, { error: 'Failed to generate content' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Empty Gemini response", JSON.stringify(data).slice(0, 500));
      return reply(502, { error: 'Empty response' });
    }

    return reply(200, { text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return reply(500, { error: 'Failed to generate content' });
  }
};
