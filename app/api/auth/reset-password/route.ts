import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema, confirmResetSchema } from "@/lib/validation/auth";
import { hashPassword, generateVerificationCode } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getUserByEmail,
  getUserByPhone,
  updateUser,
  createVerificationCode,
  getVerificationCodeByTarget,
  deleteVerificationCode,
} from "@/lib/models";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const parsed = resetPasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { target } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const isEmail = target.includes("@");
    const user = isEmail
      ? await getUserByEmail(target)
      : await getUserByPhone(target);

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const code = generateVerificationCode();
    await createVerificationCode({
      target: `password_reset:${target}`,
      code,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (isEmail) {
      await sendPasswordResetEmail(target, code);
    }

    return NextResponse.json({
      message: "Код для сброса пароля отправлен",
      code,
    });
  }

    return NextResponse.json({
      message: "Код для сброса пароля отправлен",
    });

}

export async function PUT(request: NextRequest) {
  const parsed = confirmResetSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { target, code, password } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const stored = await getVerificationCodeByTarget(
      `password_reset:${target}`,
      "password_reset"
    );

    if (!stored) {
      return NextResponse.json(
        { error: "Код не найден. Запросите новый код." },
        { status: 404 }
      );
    }

    if (new Date(stored.expiresAt) < new Date()) {
      await deleteVerificationCode(stored.id);
      return NextResponse.json(
        { error: "Код истёк. Запросите новый код." },
        { status: 410 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json({ error: "Неверный код" }, { status: 400 });
    }

    const isEmail = target.includes("@");
    const user = isEmail
      ? await getUserByEmail(target)
      : await getUserByPhone(target);

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const passwordHash = hashPassword(password);
    await updateUser(user.id, { passwordHash });
    await deleteVerificationCode(stored.id);

    return NextResponse.json({
      message: "Пароль успешно изменён",
    });
  }

  return NextResponse.json({
    message: "Пароль успешно изменён (демо-режим)",
  });
}
