import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const permissions = [
    "users.create",
    "users.read",
    "users.update",
    "users.delete",
    "roles.create",
    "roles.read",
    "roles.update",
    "roles.delete",
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id,
      },
    });
  }

  const password = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin",
      password,
      roleId: adminRole.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

