import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@adearn.ru";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "Вход выполнен",
    admin: { email: ADMIN_EMAIL },
  });
}
