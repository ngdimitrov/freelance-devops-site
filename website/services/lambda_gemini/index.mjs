export const handler = async (event) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Missing API Key' })
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing body' })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt' })
      };
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
      throw new Error(data.error?.message || 'Google API Error');
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: 'Failed to generate content', details: error.message })
    };
  }
};
