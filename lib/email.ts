// Используется вместо SMTP/nodemailer, так как SMTP-подключение
// к smtp.yandex.ru заблокировано в Timeweb App Platform.

const UNISENDER_API_URL = "https://api.unisender.com/ru/api/sendEmail";

function getUnisenderConfig() {
  return {
    apiKey: process.env.UNISENDER_API_KEY?.trim(),
    senderEmail: process.env.UNISENDER_SENDER_EMAIL?.trim(),
    senderName: (process.env.UNISENDER_SENDER_NAME ?? "AdEarn").trim(),
    listId: process.env.UNISENDER_LIST_ID?.trim(),
  };
}

function formatError(error: unknown): object {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: (error as NodeJS.ErrnoException).code,
    };
  }
  return { message: String(error) };
}

interface SendEmailOptions {
  email: string;
  subject: string;
  text: string;
  html: string;
}

async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { apiKey, senderEmail, senderName, listId } = getUnisenderConfig();
  if (!apiKey || !senderEmail) {
    console.warn(
      "[email] Unisender not configured. Set UNISENDER_API_KEY and UNISENDER_SENDER_EMAIL env vars."
    );
    return false;
  }

  if (!listId) {
    console.error(
      "[email] Unisender list_id not set. Set UNISENDER_LIST_ID env var. Email NOT sent.",
      { recipient: options.email, senderEmail }
    );
    return false;
  }

  try {
    const body = new URLSearchParams({
      api_key: apiKey,
      format: "json",
      email: options.email,
      sender_name: senderName,
      sender_email: senderEmail,
      subject: options.subject,
      body: options.html,
      list_id: listId,
    });

    const res = await fetch(UNISENDER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data: unknown = await res.json();

    if (
      res.ok &&
      typeof data === "object" &&
      data !== null &&
      "result" in data &&
      typeof (data as { result?: { email_id?: unknown } }).result?.email_id ===
        "string"
    ) {
      return true;
    }

    console.error(
      "[email] Unisender send failed:",
      JSON.stringify(
        {
          status: res.status,
          recipient: options.email,
          senderEmail,
          response: data,
        },
        null,
        2
      )
    );
    return false;
  } catch (error) {
    console.error(
      "[email] Failed to send email via Unisender:",
      JSON.stringify(formatError(error), null, 2)
    );
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  return sendEmail({
    email,
    subject: "Код подтверждения — AdEarn",
    text: `Ваш код подтверждения: ${code}\n\nКод действителен в течение 10 минут.`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; padding: 32px; border: 1px solid #2a2a4a;">
    <h1 style="color: #fff; font-size: 24px; margin: 0 0 16px;">Код подтверждения</h1>
    <p style="color: #a0a0b0; margin: 0 0 24px;">Используйте код ниже для подтверждения регистрации в AdEarn:</p>
    <div style="text-align: center; background: #0f0f23; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">${code}</span>
    </div>
    <p style="color: #606080; font-size: 13px; margin: 0;">Код действителен в течение 10 минут. Никому не сообщайте этот код.</p>
  </div>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  code: string
): Promise<boolean> {
  return sendEmail({
    email,
    subject: "Сброс пароля — AdEarn",
    text: `Ваш код для сброса пароля: ${code}\n\nКод действителен в течение 10 минут.`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; padding: 32px; border: 1px solid #2a2a4a;">
    <h1 style="color: #fff; font-size: 24px; margin: 0 0 16px;">Сброс пароля</h1>
    <p style="color: #a0a0b0; margin: 0 0 24px;">Используйте код ниже для сброса пароля в AdEarn:</p>
    <div style="text-align: center; background: #0f0f23; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">${code}</span>
    </div>
    <p style="color: #606080; font-size: 13px; margin: 0;">Код действителен в течение 10 минут. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
  </div>
</body>
</html>`,
  });
}
