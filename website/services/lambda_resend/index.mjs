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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <info@nikolaydimitrov.dev>',
        to: ['contact@example.com'],
        subject: `New Message from ${name}`,
        html: `
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong> ${message}</p>
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