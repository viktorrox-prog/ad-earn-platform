import { NextRequest, NextResponse } from "next/server";
import { verifySchema } from "@/lib/validation/auth";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getVerificationCodeByTarget,
  deleteVerificationCode,
  getUserByEmail,
  updateUser,
} from "@/lib/models";
import { mockUsers } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const parsed = verifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { target, code } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const stored = await getVerificationCodeByTarget(
      `email_verification:${target}`,
      "email_verification"
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
      return NextResponse.json(
        { error: "Неверный код подтверждения" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(target);
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    await updateUser(user.id, { verified: true });

    await deleteVerificationCode(stored.id);

    return NextResponse.json({
      message: "Email успешно подтверждён",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
    });
  }

  const mockUser = mockUsers.find((u) => u.email === target);
  if (!mockUser) {
    return NextResponse.json(
      { error: "Код не найден. Запросите новый код." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Email успешно подтверждён (демо-режим)",
    user: {
      id: mockUser.id,
      email: mockUser.email,
      phone: mockUser.phone,
    },
  });
}
