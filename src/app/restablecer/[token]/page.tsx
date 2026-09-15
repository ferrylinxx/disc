import Link from "next/link";
import type { Metadata } from "next";
import SetPasswordForm from "@/components/SetPasswordForm";
import { isPasswordSetTokenValid } from "@/lib/auth/password";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Establece tu contraseña" };

/** Página para establecer/cambiar la contraseña con el token del email. */
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const valid = await isPasswordSetTokenValid(token);
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
            {valid ? t.setTitle : t.invalidLinkTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {valid ? t.setSubtitle : t.invalidLinkSubtitle}
          </p>
        </div>

        {valid ? (
          <SetPasswordForm token={token} lang={lang} />
        ) : (
          <Link
            href="/login"
            className="bg-brand block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95"
          >
            {t.goToLogin}
          </Link>
        )}
      </div>
    </div>
  );
}
