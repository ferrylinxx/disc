import { ImageResponse } from "next/og";

export const alt =
  "DISC GESEM · Autoconocimiento conductual y desarrollo de equipos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          background:
            "linear-gradient(120deg, #6366f1 0%, #8b5cf6 60%, #d946ef 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "92px",
              height: "92px",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.16)",
              border: "2px solid rgba(255,255,255,0.45)",
              fontSize: "54px",
              fontWeight: 800,
            }}
          >
            D
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              opacity: 0.92,
            }}
          >
            DISC GESEM
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "74px",
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Autoconocimiento conductual
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              fontWeight: 400,
              opacity: 0.9,
              maxWidth: "900px",
            }}
          >
            Cuestionario de estilos conductuales para el desarrollo de personas
            y equipos.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 600 }}>
            disc.fgarola.es
          </div>
          <div style={{ display: "flex", fontSize: "22px", opacity: 0.8 }}>
            Tendencias, no diagnóstico
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
