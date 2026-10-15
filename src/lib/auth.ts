import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true, email: true, name: true, imageUrl: true, passwordHash: true, role: true, businessId: true,
            business: { select: { isActive: true } },
          },
        });
        if (!user || (user.business && !user.business.isActive)) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.imageUrl, role: user.role, businessId: user.businessId };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.businessId = ((user as any).businessId ?? null) as string | null;
        token.picture = (user as any).image ?? null;
      } else if (token.id) {
        // En cada lectura de la sesión se revalida contra la base: un usuario desactivado
        // (passwordHash vacío) o de un negocio inactivo pierde el acceso de inmediato,
        // y un cambio de rol se aplica sin volver a iniciar sesión.
        const current = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { passwordHash: true, role: true, businessId: true, business: { select: { isActive: true } } },
        });
        if (!current || current.passwordHash === "" || (current.business && !current.business.isActive)) {
          return null;
        }
        token.role = current.role;
        token.businessId = current.businessId;
      }
      if (trigger === "update" && session?.image !== undefined) {
        token.picture = session.image;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as any);
        session.user.businessId = token.businessId as string | null;
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
});
