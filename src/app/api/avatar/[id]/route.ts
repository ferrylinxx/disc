import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/**
 * Foto de perfil de un usuario. Solo con sesión (son fotos de personas). La URL
 * lleva ?v=… y cambia con cada subida, así que se puede cachear para siempre.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const { id } = await ctx.params;
  const avatar = await prisma.userAvatar.findUnique({
    where: { userId: id },
    select: { data: true, mimeType: true },
  });
  if (!avatar) return new Response("Sin foto", { status: 404 });

  return new Response(new Blob([new Uint8Array(avatar.data)], { type: avatar.mimeType }), {
    headers: {
      "Content-Type": avatar.mimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
      // Solo se sirven PNG/JPEG/WebP validados por sus bytes; aun así, que el
      // navegador no adivine el tipo ni ejecute nada.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
