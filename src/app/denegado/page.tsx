import Link from "next/link";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Acceso denegado" };

export default async function DenegadoPage() {
  const t = getDict(await getLang()).auth;
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-up glass rounded-3xl p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
          🔒
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.deniedTitle}</h1>
        <p className="mt-2 text-sm text-slate-500">{t.deniedBody}</p>
        <Link
          href="/"
          className="bg-brand mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
        >
          {t.deniedBack}
        </Link>
      </div>
    </div>
  );
}
