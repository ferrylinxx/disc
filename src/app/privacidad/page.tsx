import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLang } from "@/lib/i18n/server";
import type { Lang } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo DISC GESEM trata tus datos personales: finalidad, base jurídica, conservación y tus derechos.",
};

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
  children: ReactNode;
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

const Mail = () => (
  <a className="font-semibold text-sky-700 underline" href={`mailto:${CONTACT}`}>
    {CONTACT}
  </a>
);

const Aepd = () => (
  <a
    className="font-semibold text-sky-700 underline"
    href="https://www.aepd.es"
    target="_blank"
    rel="noopener noreferrer"
  >
    www.aepd.es
  </a>
);

interface Copy {
  kicker: string;
  title: string;
  intro: string;
  contents: string;
  back: string;
  /** [id, título, cuerpo] de cada apartado, en orden. */
  sections: [string, string, ReactNode][];
}

const ES: Copy = {
  kicker: "Legal",
  title: "Política de privacidad",
  intro:
    "Última actualización: junio de 2026. Esta política explica cómo tratamos los datos personales de quienes utilizan DISC GESEM.",
  contents: "Contenido",
  back: "← Volver al inicio",
  sections: [
    [
      "responsable",
      "Responsable del tratamiento",
      <p key="p">
        El responsable del tratamiento de los datos recogidos a través de esta plataforma
        es <strong>GESEM</strong>. Para cualquier cuestión relacionada con tus datos
        personales o con esta política, puedes escribir a <Mail />.
      </p>,
    ],
    [
      "datos",
      "Qué datos tratamos",
      <>
        <p>Tratamos únicamente los datos necesarios para prestar el servicio:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Datos identificativos y de contacto:</strong> nombre y dirección de
            correo electrónico que facilitas al iniciar la evaluación o que registra tu
            organización.
          </li>
          <li>
            <strong>Respuestas y resultados del cuestionario:</strong> tus elecciones en el
            cuestionario y los resultados derivados (puntuaciones, tendencia predominante,
            intensidad, contextos).
          </li>
          <li>
            <strong>Datos de uso técnicos:</strong> información mínima necesaria para el
            funcionamiento y la seguridad (por ejemplo, marca temporal de actividad de la
            sesión).
          </li>
        </ul>
        <p>
          No solicitamos ni tratamos categorías especiales de datos (salud, ideología,
          etc.). Los resultados describen tendencias conductuales, no datos clínicos.
        </p>
      </>,
    ],
    [
      "finalidad",
      "Con qué finalidad y base jurídica",
      <>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Generar tu informe individual y los mapas de equipo</strong> de
            autoconocimiento, comunicación y desarrollo. Base jurídica: tu{" "}
            <strong>consentimiento</strong> al iniciar la evaluación y/o la{" "}
            <strong>ejecución del servicio</strong> contratado por tu organización.
          </li>
          <li>
            <strong>Enviar tu informe por email</strong>, cuando tú o el administrador de
            tu organización lo solicitéis.
          </li>
          <li>
            <strong>Mantener la seguridad y el correcto funcionamiento</strong> de la
            plataforma. Base jurídica: nuestro <strong>interés legítimo</strong>.
          </li>
        </ul>
        <p>
          Tus datos no se utilizan para elaborar perfiles con efectos jurídicos, ni para
          procesos de selección, ni se ceden a terceros con fines comerciales.
        </p>
      </>,
    ],
    [
      "conservacion",
      "Conservación de los datos",
      <p key="p">
        Conservamos los datos mientras exista la relación con tu organización o mientras
        sean necesarios para las finalidades descritas. Cuando dejan de ser necesarios, se
        suprimen o se anonimizan. Puedes solicitar su supresión en cualquier momento (ver{" "}
        <a className="font-semibold text-sky-700 underline" href="#derechos">
          Tus derechos
        </a>
        ).
      </p>,
    ],
    [
      "destinatarios",
      "Destinatarios y encargados",
      <>
        <p>
          No vendemos ni cedemos tus datos. Para prestar el servicio nos apoyamos en
          proveedores que actúan como <strong>encargados del tratamiento</strong> y solo
          tratan los datos según nuestras instrucciones:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Proveedor de alojamiento e infraestructura de la aplicación.</li>
          <li>Proveedor de base de datos gestionada.</li>
          <li>Proveedor de envío de correo electrónico (notificaciones e informes).</li>
        </ul>
        <p>
          Seleccionamos proveedores que ofrecen garantías adecuadas de protección de datos.
          Cuando algún tratamiento implique transferencias fuera del Espacio Económico
          Europeo, se aplican las garantías previstas en la normativa vigente.
        </p>
      </>,
    ],
    [
      "derechos",
      "Tus derechos",
      <>
        <p>
          Puedes ejercer en cualquier momento tus derechos de{" "}
          <strong>
            acceso, rectificación, supresión, oposición, limitación del tratamiento y
            portabilidad
          </strong>
          , así como retirar el consentimiento prestado. Para ello, escribe a <Mail />{" "}
          indicando el derecho que deseas ejercer.
        </p>
        <p>
          Si consideras que el tratamiento no se ajusta a la normativa, tienes derecho a
          presentar una reclamación ante la{" "}
          <strong>Agencia Española de Protección de Datos</strong> (<Aepd />
          ).
        </p>
      </>,
    ],
    [
      "seguridad",
      "Seguridad",
      <p key="p">
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:
        cifrado en tránsito (HTTPS), control de acceso por roles, autenticación mediante
        sesiones firmadas y separación de la información por organización. Ninguna medida
        es infalible, pero trabajamos para minimizar los riesgos.
      </p>,
    ],
    [
      "resultados",
      "Naturaleza de los resultados",
      <p key="p">
        DISC GESEM es un cuestionario de estilos conductuales basado en el modelo DISC. Los
        resultados describen <strong>tendencias y preferencias</strong>, no constituyen un
        diagnóstico clínico ni una medida de capacidades, y pueden variar según el contexto
        y el momento. Su finalidad es el autoconocimiento, la comunicación y el desarrollo
        de equipos.
      </p>,
    ],
    [
      "cookies",
      "Cookies",
      <p key="p">
        Utilizamos únicamente cookies técnicas: una para mantener la sesión de las personas
        usuarias autenticadas y otra para recordar el idioma elegido. No empleamos cookies
        de publicidad ni de seguimiento de terceros.
      </p>,
    ],
    [
      "contacto",
      "Cambios y contacto",
      <p key="p">
        Podemos actualizar esta política para reflejar cambios legales o del servicio.
        Publicaremos siempre la versión vigente en esta página con su fecha de
        actualización. Para cualquier consulta sobre privacidad, escríbenos a <Mail />.
      </p>,
    ],
  ],
};

const CA: Copy = {
  kicker: "Legal",
  title: "Política de privacitat",
  intro:
    "Última actualització: juny de 2026. Aquesta política explica com tractem les dades personals de les persones que utilitzen DISC GESEM.",
  contents: "Contingut",
  back: "← Tornar a l'inici",
  sections: [
    [
      "responsable",
      "Responsable del tractament",
      <p key="p">
        El responsable del tractament de les dades recollides a través d&apos;aquesta
        plataforma és <strong>GESEM</strong>. Per a qualsevol qüestió relacionada amb les
        teves dades personals o amb aquesta política, pots escriure a <Mail />.
      </p>,
    ],
    [
      "datos",
      "Quines dades tractem",
      <>
        <p>Tractem únicament les dades necessàries per prestar el servei:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Dades identificatives i de contacte:</strong> nom i adreça de correu
            electrònic que facilites en iniciar l&apos;avaluació o que registra la teva
            organització.
          </li>
          <li>
            <strong>Respostes i resultats del qüestionari:</strong> les teves eleccions al
            qüestionari i els resultats que se&apos;n deriven (puntuacions, tendència
            predominant, intensitat, contextos).
          </li>
          <li>
            <strong>Dades d&apos;ús tècniques:</strong> informació mínima necessària per al
            funcionament i la seguretat (per exemple, la marca temporal d&apos;activitat de
            la sessió).
          </li>
        </ul>
        <p>
          No sol·licitem ni tractem categories especials de dades (salut, ideologia, etc.).
          Els resultats descriuen tendències conductuals, no dades clíniques.
        </p>
      </>,
    ],
    [
      "finalidad",
      "Amb quina finalitat i base jurídica",
      <>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Generar el teu informe individual i els mapes d&apos;equip</strong>{" "}
            d&apos;autoconeixement, comunicació i desenvolupament. Base jurídica: el teu{" "}
            <strong>consentiment</strong> en iniciar l&apos;avaluació i/o{" "}
            <strong>l&apos;execució del servei</strong> contractat per la teva organització.
          </li>
          <li>
            <strong>Enviar-te l&apos;informe per correu electrònic</strong>, quan tu o
            l&apos;administrador de la teva organització ho sol·liciteu.
          </li>
          <li>
            <strong>Mantenir la seguretat i el funcionament correcte</strong> de la
            plataforma. Base jurídica: el nostre <strong>interès legítim</strong>.
          </li>
        </ul>
        <p>
          Les teves dades no s&apos;utilitzen per elaborar perfils amb efectes jurídics, ni
          per a processos de selecció, ni es cedeixen a tercers amb finalitats comercials.
        </p>
      </>,
    ],
    [
      "conservacion",
      "Conservació de les dades",
      <p key="p">
        Conservem les dades mentre existeixi la relació amb la teva organització o mentre
        siguin necessàries per a les finalitats descrites. Quan deixen de ser necessàries,
        se suprimeixen o s&apos;anonimitzen. Pots sol·licitar-ne la supressió en qualsevol
        moment (vegeu{" "}
        <a className="font-semibold text-sky-700 underline" href="#derechos">
          Els teus drets
        </a>
        ).
      </p>,
    ],
    [
      "destinatarios",
      "Destinataris i encarregats",
      <>
        <p>
          No venem ni cedim les teves dades. Per prestar el servei ens recolzem en
          proveïdors que actuen com a <strong>encarregats del tractament</strong> i només
          tracten les dades segons les nostres instruccions:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Proveïdor d&apos;allotjament i infraestructura de l&apos;aplicació.</li>
          <li>Proveïdor de base de dades gestionada.</li>
          <li>Proveïdor d&apos;enviament de correu electrònic (notificacions i informes).</li>
        </ul>
        <p>
          Seleccionem proveïdors que ofereixen garanties adequades de protecció de dades.
          Quan algun tractament impliqui transferències fora de l&apos;Espai Econòmic
          Europeu, s&apos;apliquen les garanties previstes a la normativa vigent.
        </p>
      </>,
    ],
    [
      "derechos",
      "Els teus drets",
      <>
        <p>
          Pots exercir en qualsevol moment els teus drets{" "}
          <strong>
            d&apos;accés, rectificació, supressió, oposició, limitació del tractament i
            portabilitat
          </strong>
          , així com retirar el consentiment prestat. Per fer-ho, escriu a <Mail /> indicant
          el dret que vols exercir.
        </p>
        <p>
          Si consideres que el tractament no s&apos;ajusta a la normativa, tens dret a
          presentar una reclamació davant l&apos;
          <strong>Agència Espanyola de Protecció de Dades</strong> (<Aepd />
          ).
        </p>
      </>,
    ],
    [
      "seguridad",
      "Seguretat",
      <p key="p">
        Apliquem mesures tècniques i organitzatives raonables per protegir les teves dades:
        xifratge en trànsit (HTTPS), control d&apos;accés per rols, autenticació mitjançant
        sessions signades i separació de la informació per organització. Cap mesura no és
        infal·lible, però treballem per minimitzar els riscos.
      </p>,
    ],
    [
      "resultados",
      "Naturalesa dels resultats",
      <p key="p">
        DISC GESEM és un qüestionari d&apos;estils conductuals basat en el model DISC. Els
        resultats descriuen <strong>tendències i preferències</strong>, no constitueixen un
        diagnòstic clínic ni una mesura de capacitats, i poden variar segons el context i el
        moment. La seva finalitat és l&apos;autoconeixement, la comunicació i el
        desenvolupament d&apos;equips.
      </p>,
    ],
    [
      "cookies",
      "Galetes",
      <p key="p">
        Només fem servir galetes tècniques: una per mantenir la sessió de les persones
        usuàries autenticades i una altra per recordar l&apos;idioma triat. No fem servir
        galetes de publicitat ni de seguiment de tercers.
      </p>,
    ],
    [
      "contacto",
      "Canvis i contacte",
      <p key="p">
        Podem actualitzar aquesta política per reflectir canvis legals o del servei.
        Publicarem sempre la versió vigent en aquesta pàgina amb la data
        d&apos;actualització. Per a qualsevol consulta sobre privacitat, escriu-nos a{" "}
        <Mail />.
      </p>,
    ],
  ],
};

const COPY: Record<Lang, Copy> = { es: ES, ca: CA };

export default async function PrivacidadPage() {
  const c = COPY[await getLang()];
  const n = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <main className="relative w-full overflow-x-clip">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 -z-20 h-[420px]" aria-hidden />
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-500">{c.kicker}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">{c.title}</h1>
        <p className="mt-3 text-sm text-slate-500">{c.intro}</p>

        {/* Índice */}
        <nav className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {c.contents}
          </p>
          <ol className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {c.sections.map(([id, label], i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="group flex items-baseline gap-2 py-0.5 text-sm text-slate-600 transition hover:text-sky-600"
                >
                  <span className="text-[11px] font-bold tabular-nums text-slate-300 group-hover:text-sky-400">
                    {n(i)}
                  </span>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {c.sections.map(([id, title, body], i) => (
            <Section key={id} id={id} n={n(i)} title={title}>
              {body}
            </Section>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6">
          <Link href="/" className="text-sm font-semibold text-sky-700 transition hover:text-sky-900">
            {c.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
