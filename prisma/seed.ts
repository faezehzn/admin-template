import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const settings = [
    {
      key: "smtpHost",
      value: "smtp.gmail.com",
    },
    {
      key: "smtpPort",
      value: "465",
    },
    {
      key: "smtpUser",
      value: process.env.YOUR_GOOGLE_EMAIL!,
    },
    {
      key: "smtpPass",
      value: process.env.YOUR_GOOGLE_EMAIL_PASS!,
    },
    {
      key: "emailEnabled",
      value: "false",
    },
  ];
  const roles = [
    {
      name: "admin",
      level: 100,
      isSystem: true,
    },

    {
      name: "editor",
      level: 50,
      isSystem: true,
    },

    {
      name: "viewer",
      level: 10,
      isSystem: true,
    },
  ];
  const permissions = [
    "users.create",
    "users.read",
    "users.update",
    "users.delete",

    "roles.create",
    "roles.read",
    "roles.update",
    "roles.delete",

    "settings.read",
    "settings.update",
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p },
    });
  }

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },

      update: {
        level: role.level,
      },

      create: role,
    });
  }
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole!.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole!.id,
        permissionId: p.id,
      },
    });
  }

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: {
        key: setting.key,
      },

      update: {
        value: setting.value,
      },

      create: setting,
    });
  }

  const password = await bcrypt.hash(process.env.YOUR_ADMIN_PASS!, 10);

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin",
      password,
      roleId: adminRole!.id,
    },
  });
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
