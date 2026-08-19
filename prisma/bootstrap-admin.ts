import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Argon2PasswordHasher } from "../src/infrastructure/security/Argon2PasswordHasher.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const adminName = process.env.BOOTSTRAP_ADMIN_NAME ?? "System Administrator";

if (!adminEmail) {
  throw new Error("BOOTSTRAP_ADMIN_EMAIL is not configured.");
}

if (!adminPassword) {
  throw new Error("BOOTSTRAP_ADMIN_PASSWORD is not configured.");
}

if (adminPassword.length < 12) {
  throw new Error(
    "BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const passwordHasher = new Argon2PasswordHasher();

async function main(): Promise<void> {
  console.log("🔐 Starting admin bootstrap...");

  const superAdminRole = await prisma.role.findUnique({
    where: {
      name: "SUPER_ADMIN",
    },
  });

  if (!superAdminRole) {
    throw new Error(
      "SUPER_ADMIN role does not exist. Run `pnpm prisma db seed` first.",
    );
  }

  const passwordHash = await passwordHasher.hash(adminPassword);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingUser) {
    const existingSuperAdminRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: existingUser.id,
          roleId: superAdminRole.id,
        },
      },
    });

    if (existingSuperAdminRole) {
      console.log("ℹ️ Bootstrap admin already exists.");
      return;
    }

    await prisma.userRole.create({
      data: {
        userId: existingUser.id,
        roleId: superAdminRole.id,
      },
    });

    console.log(
      `✅ SUPER_ADMIN role assigned to existing user: ${adminEmail}`,
    );

    return;
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash,
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    });

    console.log(`✅ Bootstrap admin created: ${adminEmail}`);
    console.log(`✅ SUPER_ADMIN role assigned`);
  });
}

main()
  .catch((error) => {
    console.error("❌ Admin bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });