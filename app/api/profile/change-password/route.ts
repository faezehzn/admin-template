import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations/profile";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const validated =
      changePasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: validated.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const data = validated.data;

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    const match = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );

    if (!match) {
      return NextResponse.json(
        {
          message: "Current password incorrect",
        },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(
      data.newPassword,
      10,
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashed,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}