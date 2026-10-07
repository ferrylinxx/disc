/**
 * Foto de perfil. El navegador la recorta y la reduce antes de subirla
 * (AvatarUploader); aquí solo se valida lo que llega: un data URL de PNG, JPEG
 * o WebP de verdad (se miran los bytes, no el tipo declarado, para no servir
 * nunca otra cosa desde /api/avatar) y de tamaño razonable.
 */

export const AVATAR_MAX_BYTES = 512 * 1024;

export type AvatarMime = "image/png" | "image/jpeg" | "image/webp";

/** Tipo real según la firma de los primeros bytes (null si no es ninguno admitido). */
export function sniffImageType(bytes: Uint8Array): AvatarMime | null {
  const at = (i: number, ...sig: number[]) => sig.every((b, j) => bytes[i + j] === b);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  // RIFF....WEBP
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}

export type ParsedAvatar =
  | { ok: true; mimeType: AvatarMime; data: Uint8Array<ArrayBuffer> }
  | { ok: false; error: "invalid" | "too-big" };

/** Decodifica y valida el data URL que manda el navegador. */
export function parseAvatarDataUrl(url: unknown): ParsedAvatar {
  if (typeof url !== "string") return { ok: false, error: "invalid" };
  const m = /^data:image\/(?:png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(url);
  if (!m) return { ok: false, error: "invalid" };
  // Corte previo por longitud: el base64 ocupa 4/3 de los bytes.
  if (m[1].length > Math.ceil((AVATAR_MAX_BYTES * 4) / 3) + 4) return { ok: false, error: "too-big" };
  const data = new Uint8Array(Buffer.from(m[1], "base64"));
  if (data.length > AVATAR_MAX_BYTES) return { ok: false, error: "too-big" };
  const mimeType = sniffImageType(data);
  if (!mimeType) return { ok: false, error: "invalid" };
  return { ok: true, mimeType, data };
}

/** URL pública de la foto; `v` cambia con cada subida para saltarse la caché. */
export function avatarUrl(userId: string, version: number = Date.now()): string {
  return `/api/avatar/${encodeURIComponent(userId)}?v=${version.toString(36)}`;
}
