import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo DISC GESEM trata tus datos personales: finalidad, base jurídica, conservación y tus derechos.",
};

const UPDATED = "junio de 2026";
const CONTACT = "info@gesem.cat";

/** Bloque de sección con título y contenido. */
function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-slate-900">
        <span className="bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

const INDEX = [
  ["01", "Responsable del tratamiento", "responsable"],
  ["02", "Qué datos tratamos", "datos"],
  ["03", "Con qué finalidad y base jurídica", "finalidad"],
  ["04", "Conservación de los datos", "conservacion"],
  ["05", "Destinatarios y encargados", "destinatarios"],
  ["06", "Tus derechos", "derechos"],
  ["07", "Seguridad", "seguridad"],
  ["08", "Naturaleza de los resultados", "resultados"],
  ["09", "Cookies", "cookies"],
  ["10", "Cambios y contacto", "contacto"],
];

export default function PrivacidadPage() {
  return (
    <main className="relative w-full overflow-x-clip">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 -z-20 h-[420px]" aria-hidden />
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-500">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
          Política de privacidad
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Última actualización: {UPDATED}. Esta política explica cómo tratamos
          los datos personales de quienes utilizan DISC GESEM.
        </p>

        {/* Índice */}
        <nav className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Contenido
          </p>
          <ol className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {INDEX.map(([n, label, href]) => (
              <li key={href}>
                <a
                  href={`#${href}`}
                  className="group flex items-baseline gap-2 py-0.5 text-sm text-slate-600 transition hover:text-sky-600"
                >
                  <span className="text-[11px] font-bold tabular-nums text-slate-300 group-hover:text-sky-400">
                    {n}
                  </span>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          <Section id="responsable" n="01" title="Responsable del tratamiento">
            <p>
              El responsable del tratamiento de los datos recogidos a través de
              esta plataforma es <strong>GESEM</strong>. Para cualquier cuestión
              relacionada con tus datos personales o con esta política, puedes
              escribir a{" "}
              <a className="font-semibold text-sky-700 underline" href={`mailto:${CONTACT}`}>
                {CONTACT}
              </a>
              .
            </p>
          </Section>

          <Section id="datos" n="02" title="Qué datos tratamos">
            <p>Tratamos únicamente los datos necesarios para prestar el servicio:</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <strong>Datos identificativos y de contacto:</strong> nombre y
                dirección de correo electrónico que facilitas al iniciar la
                evaluación o que registra tu organización.
              </li>
              <li>
                <strong>Respuestas y resultados del cuestionario:</strong> tus
                elecciones en el cuestionario y los resultados derivados
                (puntuaciones, tendencia predominante, intensidad, contextos).
              </li>
              <li>
                <strong>Datos de uso técnicos:</strong> información mínima
                necesaria para el funcionamiento y la seguridad (por ejemplo,
                marca temporal de actividad de la sesión).
              </li>
            </ul>
            <p>
              No solicitamos ni tratamos categorías especiales de datos (salud,
              ideología, etc.). Los resultados describen tendencias conductuales,
              no datos clínicos.
            </p>
          </Section>

          <Section id="finalidad" n="03" title="Con qué finalidad y base jurídica">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <strong>Generar tu informe individual y los mapas de equipo</strong>{" "}
                de autoconocimiento, comunicación y desarrollo. Base jurídica: tu{" "}
                <strong>consentimiento</strong> al iniciar la evaluación y/o la{" "}
                <strong>ejecución del servicio</strong> contratado por tu
                organización.
              </li>
              <li>
                <strong>Enviar tu informe por email</strong>, cuando tú o el
                administrador de tu organización lo solicitéis.
              </li>
              <li>
                <strong>Mantener la seguridad y el correcto funcionamiento</strong>{" "}
                de la plataforma. Base jurídica: nuestro{" "}
                <strong>interés legítimo</strong>.
              </li>
            </ul>
            <p>
              Tus datos no se utilizan para elaborar perfiles con efectos
              jurídicos, ni para procesos de selección, ni se ceden a terceros con
              fines comerciales.
            </p>
          </Section>

          <Section id="conservacion" n="04" title="Conservación de los datos">
            <p>
              Conservamos los datos mientras exista la relación con tu
              organización o mientras sean necesarios para las finalidades
              descritas. Cuando dejan de ser necesarios, se suprimen o se
              anonimizan. Puedes solicitar su supresión en cualquier momento (ver{" "}
              <a className="font-semibold text-sky-700 underline" href="#derechos">
                Tus derechos
              </a>
              ).
            </p>
          </Section>

          <Section id="destinatarios" n="05" title="Destinatarios y encargados">
            <p>
              No vendemos ni cedemos tus datos. Para prestar el servicio nos
              apoyamos en proveedores que actúan como{" "}
              <strong>encargados del tratamiento</strong> y solo tratan los datos
              según nuestras instrucciones:
            </p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>Proveedor de alojamiento e infraestructura de la aplicación.</li>
              <li>Proveedor de base de datos gestionada.</li>
              <li>Proveedor de envío de correo electrónico (notificaciones e informes).</li>
            </ul>
            <p>
              Seleccionamos proveedores que ofrecen garantías adecuadas de
              protección de datos. Cuando algún tratamiento implique transferencias
              fuera del Espacio Económico Europeo, se aplican las garantías
              previstas en la normativa vigente.
            </p>
          </Section>

          <Section id="derechos" n="06" title="Tus derechos">
            <p>
              Puedes ejercer en cualquier momento tus derechos de{" "}
              <strong>acceso, rectificación, supresión, oposición, limitación del
              tratamiento y portabilidad</strong>, así como retirar el
              consentimiento prestado. Para ello, escribe a{" "}
              <a className="font-semibold text-sky-700 underline" href={`mailto:${CONTACT}`}>
                {CONTACT}
              </a>{" "}
              indicando el derecho que deseas ejercer.
            </p>
            <p>
              Si consideras que el tratamiento no se ajusta a la normativa, tienes
              derecho a presentar una reclamación ante la{" "}
              <strong>Agencia Española de Protección de Datos</strong> (
              <a
                className="font-semibold text-sky-700 underline"
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.aepd.es
              </a>
              ).
            </p>
          </Section>

          <Section id="seguridad" n="07" title="Seguridad">
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger
              tus datos: cifrado en tránsito (HTTPS), control de acceso por roles,
              autenticación mediante sesiones firmadas y separación de la
              información por organización. Ninguna medida es infalible, pero
              trabajamos para minimizar los riesgos.
            </p>
          </Section>

          <Section id="resultados" n="08" title="Naturaleza de los resultados">
            <p>
              DISC GESEM es un cuestionario de estilos conductuales basado en el
              modelo DISC. Los resultados describen{" "}
              <strong>tendencias y preferencias</strong>, no constituyen un
              diagnóstico clínico ni una medida de capacidades, y pueden variar
              según el contexto y el momento. Su finalidad es el autoconocimiento,
              la comunicación y el desarrollo de equipos.
            </p>
          </Section>

          <Section id="cookies" n="09" title="Cookies">
            <p>
              Utilizamos exclusivamente una cookie técnica necesaria para mantener
              la sesión de las personas usuarias autenticadas. No empleamos cookies
              de publicidad ni de seguimiento de terceros.
            </p>
          </Section>

          <Section id="contacto" n="10" title="Cambios y contacto">
            <p>
              Podemos actualizar esta política para reflejar cambios legales o del
              servicio. Publicaremos siempre la versión vigente en esta página con
              su fecha de actualización. Para cualquier consulta sobre privacidad,
              escríbenos a{" "}
              <a className="font-semibold text-sky-700 underline" href={`mailto:${CONTACT}`}>
                {CONTACT}
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
