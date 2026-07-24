import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { getAllUsers, updateUser, updateUserBlock } from "@/lib/models";
import { mockUsers } from "@/lib/mock-data";

const blockSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["block", "unblock"]),
});

const verifySchema = z.object({
  userId: z.string().min(1),
  action: z.literal("verify"),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let users = mockUsers;
  if (dbAvailable) {
    const dbUsers = await getAllUsers();
    if (dbUsers.length > 0) {
      users = dbUsers;
    }
  }
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const dbAvailable = await isDatabaseAvailable();

  const blockParsed = blockSchema.safeParse(body);
  if (blockParsed.success) {
    const { userId, action } = blockParsed.data;
    const blocked = action === "block";
    if (dbAvailable) {
      await updateUserBlock(userId, blocked);
    }
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      user.blocked = blocked;
    }
    return NextResponse.json({
      message: blocked
        ? "Пользователь заблокирован"
        : "Пользователь разблокирован",
    });
  }

  const verifyParsed = verifySchema.safeParse(body);
  if (verifyParsed.success) {
    const { userId } = verifyParsed.data;
    if (dbAvailable) {
      await updateUser(userId, { verified: true });
    }
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      user.verified = true;
    }
    return NextResponse.json({ message: "Пользователь верифицирован" });
  }

  return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
}
