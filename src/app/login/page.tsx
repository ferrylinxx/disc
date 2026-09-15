import LoginForm from "@/components/LoginForm";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Acceso" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    reset?: string;
    email?: string;
    pw?: string;
    next?: string;
  }>;
}) {
  const { reset, email, pw, next } = await searchParams;
  const lang = await getLang();
  const t = getDict(lang).auth;

  // El selector de idioma ya está en la cabecera de la web: aquí no se repite.
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="animate-fade-up glass ring-brand rounded-3xl p-8">
        <div className="mb-7 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/gesem-logo.svg"
            alt="GESEM DISC"
            className="mx-auto mb-5 h-12 w-auto"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.loginTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t.loginSubtitle}</p>
        </div>

        {reset === "ok" && (
          <p className="mb-5 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">
            {t.resetOk}
          </p>
        )}

        <LoginForm lang={lang} defaultEmail={email} defaultPassword={pw} next={next} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">{t.participantHint}</p>
    </div>
  );
}
