import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { getUserByEmail, getUserByPhone } from "@/lib/models";
import { mockUsers } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { login, password } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const isEmail = login.includes("@");
    const user = isEmail
      ? await getUserByEmail(login)
      : await getUserByPhone(login);

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        {
          error: "Email не подтверждён. Пожалуйста, подтвердите email.",
          userId: user.id,
        },
        { status: 403 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Вход выполнен успешно",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
    });
  }

  const mockUser = mockUsers.find(
    (u) => u.email === login || u.phone === login
  );

  if (!mockUser) {
    return NextResponse.json(
      { error: "Пользователь не найден" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Вход выполнен успешно (демо-режим)",
    user: {
      id: mockUser.id,
      email: mockUser.email,
      phone: mockUser.phone,
    },
  });
}
