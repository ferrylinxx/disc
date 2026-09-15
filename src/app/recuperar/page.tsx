import Link from "next/link";
import RequestResetForm from "@/components/RequestResetForm";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Recuperar contraseña" };

export default async function RecuperarPage() {
  const lang = await getLang();
  const t = getDict(lang).auth;
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
            {t.recoverTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t.recoverSubtitle}</p>
        </div>

        <RequestResetForm lang={lang} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
          {t.backToLogin}
        </Link>
      </p>
    </div>
  );
}
