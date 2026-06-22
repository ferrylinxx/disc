"use client";

import type { Dimension } from "@/lib/engine/types";
import type { TeamInsights } from "@/lib/analytics/team";
import { styleShort } from "@/lib/narratives/disc-gesem.catalog";

interface Props {
  insights: TeamInsights;
  dimensions: Dimension[];
  teamName: string;
}

/**
 * Acciones de exportación del mapa de equipo: descarga CSV (abre en Excel) y
 * PDF mediante la impresión nativa del navegador. Los textos exportados
 * mantienen la clave de tendencia/hipótesis (no diagnóstico).
 */
export function TeamExport({ insights, dimensions, teamName }: Props) {
  function downloadCsv() {
    const csv = buildCsv(insights, dimensions, teamName);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa-equipo-${slug(teamName)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Imprime en modo "ejecutivo" (lectura breve para dirección/RRHH: oculta las
   * pantallas ampliadas) o "facilitador" (versión completa). El modo se marca en
   * el contenedor .print-area y lo aplica el CSS de impresión.
   */
  function printAs(mode: "ejecutivo" | "facilitador") {
    const area = document.querySelector(".print-area");
    area?.setAttribute("data-export", mode);
    const cleanup = () => {
      area?.removeAttribute("data-export");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return (
    <div className="no-print flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={downloadCsv}
        className="rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
      >
        ↓ Exportar CSV
      </button>
      <button
        type="button"
        onClick={() => printAs("ejecutivo")}
        className="rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
      >
        ↓ PDF ejecutivo
      </button>
      <button
        type="button"
        onClick={() => printAs("facilitador")}
        className="bg-brand rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
      >
        ↓ PDF facilitador
      </button>
    </div>
  );
}

/** Normaliza el nombre del equipo para el nombre de archivo. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Escapa un valor para CSV (comillas, comas y saltos de línea). */
function cell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Construye el CSV multisección del mapa de equipo. */
function buildCsv(
  insights: TeamInsights,
  dimensions: Dimension[],
  teamName: string,
): string {
  const dims = [...dimensions].sort((a, b) => a.order - b.order);
  const dimName = new Map(dims.map((d) => [d.code, d.name]));
  const rows: (string | number)[][] = [];
  const add = (...r: (string | number)[]) => rows.push(r);

  add("Mapa de equipo", teamName);
  add("Sección", "Detalle", "Valor");
  add("Visión general", "Participantes", insights.overview.total);
  add("Visión general", "Completados", insights.overview.completed);
  add("Visión general", "Participación (%)", insights.overview.participation);
  add("Visión general", "EQ medio", insights.overview.eqAverage);
  add(
    "Visión general",
    "Combinación predominante",
    insights.overview.predominantProfile?.name ?? "—",
  );
  add(
    "Visión general",
    "Diversidad del equipo",
    insights.overview.diversity
      ? `${insights.overview.diversity.level} (${insights.overview.diversity.distinct} perfiles)`
      : "—",
  );

  for (const d of insights.distribution) {
    add(
      "Distribución DISC",
      `${styleShort(d.dimensionCode)} · ${dimName.get(d.dimensionCode) ?? d.dimensionCode}`,
      `${d.share}%`,
    );
  }
  for (const c of insights.combinations) {
    add("Combinaciones", `${c.code} · ${c.name}`, c.count);
  }
  for (const ctx of insights.contexts) {
    for (const s of ctx.scores) {
      add(
        "Mapa de contextos",
        `${ctx.name} · ${styleShort(s.dimensionCode)}`,
        `${s.percent}%`,
      );
    }
  }
  for (const t of insights.strengths) add("Fortalezas", "", t);
  for (const t of insights.risks) add("Riesgos", "", t);
  for (const c of insights.complementarity) {
    add("Complementariedad", `${styleShort(c.dimensionCode)} ${c.share}%`, c.text);
  }
  for (const g of insights.gaps) {
    add("Vacíos", `${styleShort(g.dimensionCode)} ${g.share}%`, g.observation);
  }
  for (const t of insights.conversations) add("Conversaciones", "", t);
  insights.actionPlan.forEach((t, i) => add("Plan de equipo", `${i + 1}`, t));
  for (const t of insights.insights) add("Insights", "", t);

  return rows.map((r) => r.map(cell).join(",")).join("\r\n");
}
