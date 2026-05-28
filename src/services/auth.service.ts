import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(params.password, 12);
  return prisma.user.create({
    data: {
      email: params.email,
      passwordHash,
      name: `${params.firstName} ${params.lastName ?? ""}`.trim(),
      person: { create: { firstName: params.firstName, lastName: params.lastName } },
    },
  });
}
