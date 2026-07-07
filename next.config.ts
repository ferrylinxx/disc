import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // La extracción de participantes desde una foto envía la imagen (data URL)
    // por un server action; ampliamos el límite del cuerpo por defecto (1 MB).
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
