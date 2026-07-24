import nodemailer from "nodemailer";
@ts-ignore
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ?? "587",
    user: process.env.SMTP_USER,
    secure: parseInt(process.env.SMTP_PORT ?? "587", 10) === 465,
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

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[email] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars."
    );
    return false;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"AdEarn" <${from}>`,
      to: email,
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
    return true;
  } catch (error) {
    console.error(
      "[email] Failed to send verification email:",
      JSON.stringify(
        { smtp: getSmtpConfig(), error: formatError(error) },
        null,
        2
      )
    );
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  code: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[email] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars."
    );
    return false;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"AdEarn" <${from}>`,
      to: email,
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
    return true;
  } catch (error) {
    console.error(
      "[email] Failed to send password reset email:",
      JSON.stringify(
        { smtp: getSmtpConfig(), error: formatError(error) },
        null,
        2
      )
    );
    return false;
  }
}
