export const handler = async (event) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!event.body) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "No body provided" })
    };
  }

  try {

    const body = JSON.parse(event.body);
    const { name, email, message } = body;

    const escHtml = s => String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const safeName = String(name).replace(/[\r\n]/g, '');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <info@nikolaydimitrov.dev>',
        to: ['contact@example.com'],
        subject: `New Message from ${safeName}`,
        html: `
                    <p><strong>Name:</strong> ${escHtml(name)}</p>
                    <p><strong>Email:</strong> ${escHtml(email)}</p>
                    <p><strong>Message:</strong> ${escHtml(message)}</p>
                `,
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Грешка:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
    };
  }
};