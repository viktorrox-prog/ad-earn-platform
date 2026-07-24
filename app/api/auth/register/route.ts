import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword, generateVerificationCode } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createUser,
  getUserByEmail,
  getUserByPhone,
  createVerificationCode,
} from "@/lib/models";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, phone, password } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже зарегистрирован" },
        { status: 409 }
      );
    }

    const existingPhone = await getUserByPhone(phone);
    if (existingPhone) {
      return NextResponse.json(
        { error: "Пользователь с таким номером телефона уже зарегистрирован" },
        { status: 409 }
      );
    }

    const { randomUUID } = await import("crypto");
    const passwordHash = hashPassword(password);
    const user = await createUser({
      id: randomUUID(),
      email,
      phone,
      passwordHash,
      verified: false,
      blocked: false,
    });

    const code = generateVerificationCode();
    await createVerificationCode({
      target: `email_verification:${email}`,
      code,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    await sendVerificationEmail(email, code);

    return NextResponse.json({
      message: "Пользователь зарегистрирован. Введите код подтверждения.",
      userId: user.id,
      code,
    });
  }

  return NextResponse.json(
    {
      error: "База данных недоступна. Регистрация временно невозможна.",
    },
    { status: 503 }
  );
}
