import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/server/requirePermission";
import {
  CreateRoleInput,
  createRoleSchema,
  deleteRoleSchema,
  updateRoleSchema,
} from "@/lib/validations/roles";
import { findDuplicateRoleByPermissions } from "@/lib/permissions";

// ***************** GET All ***************************
export async function GET() {
  const permission = await requirePermission("roles.read");

  if ("error" in permission) {
    return permission.error;
  }

  const roles = await prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
    where: { deletedAt: null },
    // select: {
    //   id: true,
    //   name: true,
    //   users: true,
    //   permissions: true,
    // },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      permissions: {
        include: {
          permission: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(roles);
}

// ***************** POST ***************************
export async function POST(req: NextRequest) {
  const permission = await requirePermission("roles.create");

  if ("error" in permission) {
    return permission.error;
  }

  try {
    const body = await req.json();

    const validated = createRoleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validated.error.issues?.[0].message,
        },
        { status: 400 },
      );
    }

    const data: CreateRoleInput = validated.data;

    /**
     * check existing role name
     */
    const exists = await prisma.role.findFirst({
      where: {
        name: data.name.toLowerCase(),
        deletedAt: null,
      },
    });

    if (exists) {
      return NextResponse.json(
        {
          message: "Role already exists",
        },
        { status: 409 },
      );
    }

    /**
     * check existing role level
     */
    const currentUser = await prisma.user.findUnique({
      where: {
        id: permission.session.user.id,
      },

      include: {
        role: true,
      },
    });
    if (data.level >= currentUser!.role.level) {
      return NextResponse.json(
        {
          message: `You cannot create a role with equal or higher level than your own(your level: ${currentUser!.role.level}).`,
        },
        { status: 403 },
      );
    }

    /**
     * check existing role permissions
     */
    const duplicatePermissionsRole = await findDuplicateRoleByPermissions({
      permissionIds: data.permissions.map((p) => p.permissionId),
    });

    if (duplicatePermissionsRole) {
      return NextResponse.json(
        {
          message: `A role with the same permissions already exists (${duplicatePermissionsRole.name})`,
        },
        { status: 409 },
      );
    }

    /**
     * create role with permissions
     */
    const role = await prisma.role.create({
      data: {
        name: data.name.toLowerCase(),

        level: data.level,

        permissions: {
          create: data.permissions.map((p) => ({
            permissionId: p.permissionId,
          })),
        },
      },

      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // const role = await prisma.role.create({
    //   data: {
    //     name: String(body.name).toLowerCase(),
    //   },

    //   select: {
    //     id: true,
    //     name: true,
    //   },
    // });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// ***************** PATCH ***************************
export async function PATCH(req: NextRequest) {
  const permission = await requirePermission("roles.update");

  if ("error" in permission) {
    return permission.error;
  }

  try {
    const body = await req.json();

    /**
     * zod validation
     */
    const validated = updateRoleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validated.error.issues?.[0].message,
        },
        { status: 400 },
      );
    }

    const data = validated.data;

    /**
     * check role exists
     */
    const role = await prisma.role.findFirst({
      where: {
        id: data.id,
        deletedAt: null,
      },
    });

    if (!role) {
      return NextResponse.json(
        {
          message: "Role not found",
        },
        { status: 404 },
      );
    }

    /**
     * immutable system admin role
     */
    // if (role.isSystem && role.name === "admin") {
    //   return NextResponse.json(
    //     {
    //       message: "Admin role cannot be modified",
    //     },
    //     { status: 403 },
    //   );
    // }

    /**
     * check existing role level
     */
    const currentUser = await prisma.user.findUnique({
      where: {
        id: permission.session.user.id,
      },

      include: {
        role: true,
      },
    });
    if (data.level >= currentUser!.role.level) {
      return NextResponse.json(
        {
          message: `You cannot assign a level equal or higher than your own (your level: ${currentUser!.role.level}).`,
        },
        { status: 403 },
      );
    }
    if (role.level >= currentUser!.role.level) {
      return NextResponse.json(
        {
          message:
            `You cannot modify a role with equal or higher level than your own (your level: ${currentUser!.role.level}).`,
        },
        { status: 403 },
      );
    }
    /**
     * check existing role permissions
     */
    const duplicatePermissionsRole = await findDuplicateRoleByPermissions({
      permissionIds: data.permissions.map((p) => p.permissionId),
    });

    if (duplicatePermissionsRole) {
      return NextResponse.json(
        {
          message: `A role with the same permissions already exists (${duplicatePermissionsRole.name})`,
        },
        { status: 409 },
      );
    }

    // const updatedRole = await prisma.role.update({
    //   where: {
    //     id: body.id,
    //   },

    //   data: {
    //     name: body.name,
    //   },

    //   select: {
    //     id: true,
    //     name: true,
    //   },
    // });

    /**
     * transactional update
     */
    const updatedRole = await prisma.$transaction(async (tx) => {
      /**
       * remove old permissions
       */
      await tx.rolePermission.deleteMany({
        where: {
          roleId: data.id,
        },
      });

      /**
       * update role + recreate permissions
       */
      return tx.role.update({
        where: {
          id: data.id,
        },

        data: {
          name: data.name.toLowerCase(),
          level: data.level,
          permissions: {
            create: data.permissions.map((p) => ({
              permissionId: p.permissionId,
            })),
          },
        },

        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      role: updatedRole,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// ***************** DELETE ***************************
export async function DELETE(req: NextRequest) {
  const permission = await requirePermission("roles.delete");

  if ("error" in permission) {
    return permission.error;
  }
  const session = permission.session;

  try {
    const { searchParams } = new URL(req.url);

    /**
     * zod validation
     */
    const validated = deleteRoleSchema.safeParse({
      id: searchParams.get("id"),
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validated.error.issues?.[0].message,
        },
        { status: 400 },
      );
    }

    const { id } = validated.data;

    /**
     * check role exists
     */
    const role = await prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!role) {
      return NextResponse.json(
        {
          message: "Role not found",
        },
        { status: 404 },
      );
    }

    /**
     * protected system roles
     */
    if (role.isSystem) {
      return NextResponse.json(
        {
          message: "System roles cannot be deleted",
        },
        { status: 403 },
      );
    }

    /**
     * prevent deleting assigned roles
     */
    const usersCount = await prisma.user.count({
      where: {
        roleId: id,
        deletedAt: null,
      },
    });

    if (usersCount > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete role assigned to users",
        },
        { status: 400 },
      );
    }

    /**
     * check existing role level
     */
    const currentUser = await prisma.user.findUnique({
      where: {
        id: permission.session.user.id,
      },

      include: {
        role: true,
      },
    });

    if (role.level >= currentUser!.role.level) {
      return NextResponse.json(
        {
          message:
            "You cannot modify a role with equal or higher level than your own (your level: ${currentUser!.role.level}).",
        },
        { status: 403 },
      );
    }

    // soft delete
    // await prisma.role.update({
    //   where: { id },
    //   data: {
    //     deletedAt: new Date(),
    //     deletedBy: session.user.id,
    //   },
    // });

    // restore
    //   await prisma.user.update({
    //   where: { id },
    //   data: {
    //     deletedAt: null,
    //     deletedBy: null
    //   },
    // });

    // hard delete - force delete
    // await prisma.role.delete({
    //   where: {
    //     id,
    //   },
    // });

    /**
     * transactional soft delete
     */
    await prisma.$transaction(async (tx) => {
      /**
       * remove role permissions
       */
      await tx.rolePermission.deleteMany({
        where: {
          roleId: id,
        },
      });

      /**
       * soft delete role
       */
      await tx.role.update({
        where: {
          id,
        },

        data: {
          deletedAt: new Date(),
          deletedBy: session.user.id,
        },
      });
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
