const ALLOWED_ORIGIN = "https://nikolaydimitrov.dev";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

// Field limits (server-side enforced; frontend maxlength is bypassable)
const LIMITS = { name: 100, email: 254, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escHtml = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const reply = (statusCode, payload) => ({
  statusCode,
  headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

export const handler = async (event) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    console.error("Missing RESEND_API_KEY or CONTACT_TO_EMAIL");
    return reply(500, { error: "Server configuration error" });
  }

  if (!event.body) {
    return reply(400, { error: "No body provided" });
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }

  const { name, email, message, website } = body;

  // Server-side honeypot: bots fill hidden fields, humans never see them.
  if (website) {
    return reply(200, { success: true });
  }

  if (!name || !email || !message) {
    return reply(400, { error: "Missing fields" });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return reply(400, { error: "Invalid field types" });
  }

  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message
  ) {
    return reply(400, { error: "Field too long" });
  }

  if (!EMAIL_RE.test(email)) {
    return reply(400, { error: "Invalid email" });
  }

  const safeName = name.replace(/[\r\n]/g, '');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <info@nikolaydimitrov.dev>',
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `New Message from ${safeName}`,
        html: `
                    <p><strong>Name:</strong> ${escHtml(name)}</p>
                    <p><strong>Email:</strong> ${escHtml(email)}</p>
                    <p><strong>Message:</strong> ${escHtml(message)}</p>
                `,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Resend API error:", response.status, errData);
      return reply(502, { error: "Failed to send message" });
    }

    return reply(200, { success: true });
  } catch (error) {
    console.error("Resend Error:", error);
    return reply(500, { error: "Internal Server Error" });
  }
};
