import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt =
  "DISC GESEM · Autoconocimiento conductual y desarrollo de equipos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Símbolo "g" de GESEM (transparente) embebido como data URI para el render.
const logoData = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/brand/gesem-simbol.png"),
).toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Resplandor azul de marca */}
        <div
          style={{
            position: "absolute",
            top: "-180px",
            right: "-120px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #00a1e0, #93e4ed)",
            opacity: 0.18,
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px",
          }}
        >
          {/* Logo + marca */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoData} width={72} height={72} alt="GESEM" />
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: "#0f172a",
              }}
            >
              DISC GESEM
            </div>
          </div>

          {/* Titular */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                fontSize: "76px",
                fontWeight: 800,
                lineHeight: 1.04,
                color: "#0f172a",
              }}
            >
              Autoconocimiento conductual
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "34px",
                fontWeight: 400,
                color: "#475569",
                maxWidth: "920px",
              }}
            >
              Cuestionario de estilos conductuales para el desarrollo de personas
              y equipos.
            </div>
          </div>

          {/* Pie */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              disc.fgarola.es
            </div>
            <div style={{ display: "flex", fontSize: "22px", color: "#64748b" }}>
              Tendencias, no diagnóstico
            </div>
          </div>
        </div>

        {/* Franja de degradado corporativo GESEM (45º) */}
        <div
          style={{
            display: "flex",
            height: "16px",
            background: "linear-gradient(45deg, #00a1e0, #5ac3dd, #93e4ed)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
