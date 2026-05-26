import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  usersListQuerySchema,
  createUserSchema,
  updateUserSchema,
} from "@/lib/validations/users";
import bcrypt from "bcryptjs";
import { canManageUser } from "@/lib/permissions";
import { requirePermission } from "@/lib/server/requirePermission";

// ******************* GET All ********************************
export async function GET(req: Request) {
  const permission = await requirePermission("users.read");

  if (permission.error) {
    return permission.error;
  }

  const { searchParams } = new URL(req.url);

  const parsed = usersListQuerySchema.safeParse(
    Object.fromEntries(searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid query", issues: parsed.error.issues?.[0].message },
      { status: 400 },
    );
  }

  const { page, pageSize, search, sortBy, sortDir } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where =
    search.length > 0
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { role: { name: { contains: search } } },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

  const orderBy =
    sortBy === "role" ? { role: { name: sortDir } } : { [sortBy]: sortDir };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    items,
    meta: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  });
}

// ******************* POST ********************************
export async function POST(req: Request) {
  const permission = await requirePermission("users.create");

  if (permission.error) {
    return permission.error;
  }

  const json = await req.json();

  const parsed = createUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid data",
        fieldErrors: parsed.error.issues?.[0].message,
      },
      { status: 400 },
    );
  }

  const data = {
    ...parsed.data,
    email: parsed.data.email.trim().toLowerCase(),
    name: parsed.data.name?.trim() ? parsed.data.name.trim() : null,
  };

  // duplicate email
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        message: "Email already in use",
        fieldErrors: { email: ["This email is already in use"] },
      },
      { status: 400 },
    );
  }

  const tempPassword = "Temp#123456";
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      roleId: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}

// ******************* PATCH ********************************
export async function PATCH(req: Request) {
  const permission = await requirePermission("users.update");

  if (permission.error) {
    return permission.error;
  }

  const session = permission.session;

  const json = await req.json();

  const parsed = updateUserSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid data",
        fieldErrors: parsed.error.issues?.[0].message,
      },
      { status: 400 },
    );
  }

  const { id, roleId, ...rest } = parsed.data;

  /**
   * Prevent self update
   */
  if (session.user.id === id) {
    return NextResponse.json(
      {
        message: "Please update your own profile from profile settings.",
      },
      { status: 403 },
    );
  }

  /**
   * Get target user
   */
  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const currentUserLevel = session.user.roleLevel;

  const targetUserLevel = targetUser.role.level;

  /**
   * Can manage target user?
   */
  if (
    !canManageUser({
      currentUserRoleLevel: currentUserLevel,
      targetUserRoleLevel: targetUserLevel,
    })
  ) {
    return NextResponse.json(
      {
        message: "You are not allowed to manage this user.",
      },
      { status: 403 },
    );
  }

  const user = await prisma.user.update({
    where: { id },

    data: {
      ...rest,
      ...(roleId ? { roleId } : {}),
    },

    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      roleId: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}

// ******************* DELETE ********************************
export async function DELETE(req: Request) {
  const permission = await requirePermission("users.delete");

  if (permission.error) {
    return permission.error;
  }

  const session = permission.session;

  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  /**
   * Prevent self delete
   */
  if (session.user.id === id) {
    return NextResponse.json(
      {
        message: "You cannot delete your own account.",
      },
      { status: 403 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const currentUserLevel = session.user.roleLevel;

  const targetUserLevel = targetUser.role.level;

  /**
   * Can manage target user?
   */
  if (
    !canManageUser({
      currentUserRoleLevel: currentUserLevel,
      targetUserRoleLevel: targetUserLevel,
    })
  ) {
    return NextResponse.json(
      {
        message: "You are not allowed to delete this user.",
      },
      { status: 403 },
    );
  }

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: session.user.id,
    },
  });

  // hard delete - force delete
  // await prisma.user.delete({
  //   where: { id },
  // });

  // restore
  //   await prisma.user.update({
  //   where: { id },
  //   data: {
  //     deletedAt: null,
  //     deletedBy: null
  //   },
  // });

  return NextResponse.json({
    ok: true,
  });
}
