import { describe, expect, it } from "vitest";
import { AVATAR_MAX_BYTES, avatarUrl, parseAvatarDataUrl, sniffImageType } from "./avatar";

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13];
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 16];
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50];

const dataUrl = (mime: string, bytes: number[] | Uint8Array) =>
  `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;

describe("sniffImageType", () => {
  it("reconoce PNG, JPEG y WebP por sus bytes", () => {
    expect(sniffImageType(new Uint8Array(PNG))).toBe("image/png");
    expect(sniffImageType(new Uint8Array(JPEG))).toBe("image/jpeg");
    expect(sniffImageType(new Uint8Array(WEBP))).toBe("image/webp");
  });

  it("rechaza cualquier otra cosa", () => {
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBeNull(); // GIF
    expect(sniffImageType(new Uint8Array())).toBeNull();
  });
});

describe("parseAvatarDataUrl", () => {
  it("acepta una imagen válida y devuelve el tipo real", () => {
    const r = parseAvatarDataUrl(dataUrl("image/webp", WEBP));
    expect(r).toEqual({ ok: true, mimeType: "image/webp", data: new Uint8Array(WEBP) });
  });

  it("usa los bytes, no el tipo declarado", () => {
    const r = parseAvatarDataUrl(dataUrl("image/png", JPEG));
    expect(r.ok && r.mimeType).toBe("image/jpeg");
  });

  it("rechaza SVG, otros tipos y contenido que no es imagen", () => {
    expect(parseAvatarDataUrl(dataUrl("image/svg+xml", [0x3c, 0x73, 0x76, 0x67]))).toEqual({ ok: false, error: "invalid" });
    expect(parseAvatarDataUrl(dataUrl("image/png", [0x3c, 0x68, 0x74, 0x6d, 0x6c]))).toEqual({ ok: false, error: "invalid" });
    expect(parseAvatarDataUrl("https://example.com/foto.png")).toEqual({ ok: false, error: "invalid" });
    expect(parseAvatarDataUrl(undefined)).toEqual({ ok: false, error: "invalid" });
  });

  it("rechaza las imágenes demasiado grandes", () => {
    const big = new Uint8Array(AVATAR_MAX_BYTES + 1);
    big.set(JPEG);
    expect(parseAvatarDataUrl(dataUrl("image/jpeg", big))).toEqual({ ok: false, error: "too-big" });
  });
});

describe("avatarUrl", () => {
  it("versiona la URL para saltarse la caché", () => {
    expect(avatarUrl("cm1abc", 1_700_000_000_000)).toBe("/api/avatar/cm1abc?v=loyw3v28");
  });
});
