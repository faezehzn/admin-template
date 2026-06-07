import { execSync } from "node:child_process";
import { restoreFile } from "./schema-writer";

export function runPrismaValidate() {
  execSync("npx prisma validate", { stdio: "inherit" });
}

export function runPrismaFormat() {
  execSync("npx prisma format", { stdio: "inherit" });
}

export function runPrismaMigrate(name: string) {
  try {
    console.log("Running Prisma migrate dev...");
    execSync(`npx prisma migrate dev --name ${name}`, { stdio: "inherit" });
    console.log("Prisma migrate dev completed successfully.");
  } catch (error) {
    console.error("Failed to run Prisma migrate dev. Please run it manually.");
  }
}

export async function withRollback({
  schemaPath,
  backupPath,
  fn,
}: {
  schemaPath: string;
  backupPath: string;
  fn: () => Promise<void>;
}) {
  try {
    return await fn();
  } catch (e) {
    if (backupPath) {
      console.error("\n❌ Operation failed. Restoring schema from backup...");
      restoreFile(backupPath, schemaPath);
      console.error("✅ schema.prisma restored.");
    }
    throw e;
  }
}
