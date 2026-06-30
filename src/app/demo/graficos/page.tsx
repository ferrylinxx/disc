import { discGrad, discGradStops } from "@/lib/disc-gradient";

/**
 * PÁGINA DE DEMOS (TEMPORAL) — comparativa de formatos para mostrar las tres
 * lecturas DISC (yo público / yo privado / yo percibido). Sirve para elegir el
 * diseño preferido; no forma parte del producto. Eliminar cuando se decida.
 */
export const metadata = { title: "Demos · Gráficos DISC" };

type Sh = Record<string, number>;
const DATA: { publico: Sh; privado: Sh; percibido: Sh } = {
  publico: { D: 42, I: 30, S: 11, C: 17 },
  privado: { D: 20, I: 16, S: 38, C: 26 },
  percibido: { D: 33, I: 23, S: 22, C: 22 },
};

const STYLE_NAME: Record<string, string> = {
  D: "Impulsar",
  I: "Conectar",
  S: "Sostener",
  C: "Estructurar",
};

/** Color de cada lectura (independiente de la paleta DISC para no confundir). */
const READ = {
  publico: { color: "#0ea5e9", label: "Yo público", desc: "Cómo te muestras y adaptas", kind: "hollow" as const },
  privado: { color: "#f59e0b", label: "Yo privado", desc: "Tu estilo bajo presión", kind: "ring" as const },
  percibido: { color: "#0f172a", label: "Yo percibido", desc: "Resultado del test (integración)", kind: "fill" as const },
};
type ReadKey = keyof typeof READ;
const READ_ORDER: ReadKey[] = ["publico", "privado", "percibido"];

const clamp = (v: number) => Math.max(24, Math.min(176, v));
function pos(sh: Sh) {
  const d = sh.D ?? 0, i = sh.I ?? 0, s = sh.S ?? 0, c = sh.C ?? 0;
  const x = (i + s - (d + c)) / 100;
  const y = (d + i - (s + c)) / 100;
  return { cx: clamp(100 + x * 76), cy: clamp(100 - y * 76) };
}
const dominant = (sh: Sh) =>
  Object.entries(sh).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

/** Cuadrícula DISC base (degradados + etiquetas). Children = marcadores. */
function QuadBase({ children, gid }: { children?: React.ReactNode; gid: string }) {
  const Q = [
    { code: "D", x: 10, y: 10, lx: 20, ly: 32, anchor: "start" as const },
    { code: "I", x: 100, y: 10, lx: 190, ly: 32, anchor: "end" as const },
    { code: "C", x: 10, y: 100, lx: 20, ly: 196, anchor: "start" as const },
    { code: "S", x: 100, y: 100, lx: 190, ly: 196, anchor: "end" as const },
  ];
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full">
      <defs>
        {Q.map((q) => {
          const [a, b] = discGradStops(q.code);
          return (
            <linearGradient key={q.code} id={`${gid}-${q.code}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={a} />
              <stop offset="100%" stopColor={b} />
            </linearGradient>
          );
        })}
      </defs>
      <rect x="6" y="6" width="188" height="188" rx="14" fill="#ffffff" stroke="#e2e8f0" />
      {Q.map((q) => (
        <g key={q.code}>
          <rect x={q.x} y={q.y} width={90} height={90} rx={8} fill={`url(#${gid}-${q.code})`} opacity={0.14} />
          <text x={q.lx} y={q.ly} textAnchor={q.anchor} fontSize="26" fontWeight="800" fill={`url(#${gid}-${q.code})`} opacity={0.55}>
            {q.code}
          </text>
        </g>
      ))}
      <line x1="100" y1="12" x2="100" y2="188" stroke="#e2e8f0" strokeWidth="1.2" />
      <line x1="12" y1="100" x2="188" y2="100" stroke="#e2e8f0" strokeWidth="1.2" />
      {children}
    </svg>
  );
}

/** Marcador de una lectura, con su estilo (hueco / anillo / relleno). */
function Marker({ cx, cy, read, r = 7 }: { cx: number; cy: number; read: ReadKey; r?: number }) {
  const { color, kind } = READ[read];
  if (kind === "hollow")
    return <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke={color} strokeWidth="3" />;
  if (kind === "ring")
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={color} stroke="#ffffff" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r={r * 0.42} fill="#ffffff" />
      </g>
    );
  return <circle cx={cx} cy={cy} r={r} fill={color} stroke="#ffffff" strokeWidth="2.5" />;
}

function Legend({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`space-y-2.5 ${compact ? "text-xs" : "text-sm"}`}>
      {READ_ORDER.map((k) => (
        <li key={k} className="flex items-center gap-2.5">
          <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0">
            <Marker cx={10} cy={10} read={k} r={7} />
          </svg>
          <span>
            <b className="font-semibold text-slate-800">{READ[k].label}</b>
            <span className="text-slate-500"> · {READ[k].desc}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Card({ tag, title, children }: { tag: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">{tag}</span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function DemoGraficosPage() {
  const P = { publico: pos(DATA.publico), privado: pos(DATA.privado), percibido: pos(DATA.percibido) };

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <div className="mb-8">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          DEMO TEMPORAL · para elegir
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          ¿Cómo mostramos las 3 lecturas?
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Mismos datos de ejemplo en varios formatos. Dime cuál te gusta más (o la
          combinación) y lo dejo fino en el informe. Datos de ejemplo: público
          tiende a D, privado a S, percibido equilibrado.
        </p>
      </div>

      <div className="space-y-6">
        {/* OPCIÓN A */}
        <Card tag="A" title="Un solo mapa con los 3 marcadores + recorrido">
          <div className="grid items-center gap-6 sm:grid-cols-[260px_1fr]">
            <div className="mx-auto w-full max-w-[260px]">
              <QuadBase gid="a">
                <path
                  d={`M${P.publico.cx} ${P.publico.cy} L${P.privado.cx} ${P.privado.cy} L${P.percibido.cx} ${P.percibido.cy}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                />
                <Marker cx={P.publico.cx} cy={P.publico.cy} read="publico" />
                <Marker cx={P.privado.cx} cy={P.privado.cy} read="privado" />
                <Marker cx={P.percibido.cx} cy={P.percibido.cy} read="percibido" />
              </QuadBase>
            </div>
            <div>
              <Legend />
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                La línea punteada muestra el “recorrido” entre cómo te muestras,
                cómo actúas bajo presión y tu resultado integrado.
              </p>
            </div>
          </div>
        </Card>

        {/* OPCIÓN B */}
        <Card tag="B" title="Tres mapas, pero más legibles (con lectura)">
          <div className="grid gap-5 sm:grid-cols-3">
            {READ_ORDER.map((k) => (
              <div key={k} className="rounded-xl border border-slate-100 p-3 text-center">
                <div className="mx-auto w-full max-w-[170px]">
                  <QuadBase gid={`b-${k}`}>
                    <Marker cx={P[k].cx} cy={P[k].cy} read={k} r={8} />
                  </QuadBase>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-800">{READ[k].label}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Predomina <b className="text-slate-700">{STYLE_NAME[dominant(DATA[k])]}</b>
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* OPCIÓN C */}
        <Card tag="C" title="Comparativa por barras (D · I · S · C)">
          <div className="space-y-4">
            {["D", "I", "S", "C"].map((code) => (
              <div key={code}>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black text-white"
                    style={{ backgroundImage: discGrad(code) }}
                  >
                    {code}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{STYLE_NAME[code]}</span>
                </div>
                <div className="space-y-1.5 pl-8">
                  {READ_ORDER.map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-[11px] text-slate-500">{READ[k].label}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${DATA[k][code]}%`, backgroundColor: READ[k].color }} />
                      </div>
                      <span className="w-8 text-right text-[11px] font-semibold text-slate-500">{DATA[k][code]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-1"><Legend compact /></div>
          </div>
        </Card>

        {/* OPCIÓN D */}
        <Card tag="D" title="Jerarquía: 1 principal grande + 2 de apoyo">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_220px]">
            <div className="flex items-center gap-5">
              <div className="w-full max-w-[220px]">
                <QuadBase gid="d-main">
                  <Marker cx={P.percibido.cx} cy={P.percibido.cy} read="percibido" r={9} />
                </QuadBase>
              </div>
              <div className="flex flex-col gap-3">
                {(["publico", "privado"] as ReadKey[]).map((k) => (
                  <div key={k} className="w-24">
                    <QuadBase gid={`d-${k}`}>
                      <Marker cx={P[k].cx} cy={P[k].cy} read={k} r={10} />
                    </QuadBase>
                    <p className="mt-1 text-center text-[11px] font-semibold text-slate-600">{READ[k].label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Yo percibido</p>
              <p className="mt-1 text-xs text-slate-500">{READ.percibido.desc}. Es la lectura principal; las pequeñas son el contraste público/privado.</p>
            </div>
          </div>
        </Card>

        {/* OPCIÓN E — Radar */}
        <Card tag="E" title="Radar superpuesto (las 3 lecturas a la vez)">
          <div className="grid items-center gap-6 sm:grid-cols-[260px_1fr]">
            <div className="mx-auto w-full max-w-[260px]">
              <Radar data={DATA} />
            </div>
            <Legend />
          </div>
        </Card>

        {/* OPCIÓN F — Espectros por eje */}
        <Card tag="F" title="Dos ejes (espectros) con los 3 marcadores">
          <div className="space-y-7">
            <AxisSpectrum
              left="Orientado a tareas"
              right="Orientado a personas"
              value={(sh) => ((sh.I + sh.S) - (sh.D + sh.C))}
            />
            <AxisSpectrum
              left="Directo · ritmo rápido"
              right="Indirecto · ritmo lento"
              value={(sh) => ((sh.D + sh.I) - (sh.S + sh.C))}
            />
            <Legend compact />
          </div>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Página temporal de demostración. Dime la opción (A–F) y la integro en el informe.
      </p>
    </main>
  );
}

/** Radar de 4 ejes con tres polígonos (una por lectura). */
function Radar({ data }: { data: { publico: Sh; privado: Sh; percibido: Sh } }) {
  const size = 220, cx = size / 2, cy = size / 2, R = 84;
  const axes = ["D", "I", "S", "C"];
  const angle = (i: number) => (Math.PI * 2 * i) / 4 - Math.PI / 2;
  const pt = (i: number, v: number) => {
    const r = (Math.min(100, Math.max(0, v)) / 50) * R; // escala: 50% = borde
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  };
  const poly = (sh: Sh) => axes.map((a, i) => pt(i, sh[a]).map((n) => n.toFixed(1)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={axes.map((_, i) => pt(i, 50 * f).map((n) => n.toFixed(1)).join(",")).join(" ")} fill="none" stroke="#e2e8f0" />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 56);
        return (
          <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="800" fill={discGradStops(a)[0]}>
            {a}
          </text>
        );
      })}
      {READ_ORDER.map((k) => (
        <polygon key={k} points={poly(data[k])} fill={READ[k].color} fillOpacity={k === "percibido" ? 0.12 : 0.08} stroke={READ[k].color} strokeWidth="2" />
      ))}
    </svg>
  );
}

/** Espectro horizontal de un eje DISC con los tres marcadores. */
function AxisSpectrum({ left, right, value }: { left: string; right: string; value: (sh: Sh) => number }) {
  const toPct = (v: number) => Math.max(4, Math.min(96, 50 + (v / 100) * 50));
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-bold uppercase tracking-wide text-slate-400">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200">
        {READ_ORDER.map((k, idx) => (
          <span
            key={k}
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: `${toPct(value(DATA[k]))}%`, backgroundColor: READ[k].color, marginTop: idx === 1 ? -10 : idx === 2 ? 10 : 0 }}
            title={READ[k].label}
          />
        ))}
      </div>
    </div>
  );
}
