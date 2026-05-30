import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      status: true,

      role: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: validated.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const data = validated.data;

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: data.email,

        NOT: {
          id: session.user.id,
        },
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          message: "Email already exists",
        },
        { status: 409 },
      );
    }

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },

      data,

      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
