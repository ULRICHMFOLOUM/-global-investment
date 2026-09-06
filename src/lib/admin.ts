import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) return null;

  const isAdmin =
    user.role === "ADMIN" ||
    user.email === "ulrichmfoloum@gmail.com" ||
    (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL);

  if (!isAdmin) return null;

  return { session, user };
}
