import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 110,
          fontWeight: 800,
          color: "#ffffff",
          background:
            "linear-gradient(120deg, #6366f1 0%, #8b5cf6 60%, #d946ef 100%)",
        }}
      >
        D
      </div>
    ),
    { ...size },
  );
}
