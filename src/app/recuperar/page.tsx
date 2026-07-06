import Link from "next/link";
import RequestResetForm from "@/components/RequestResetForm";

export const metadata = { title: "Recuperar contraseña · DISC GESEM" };

export default function RecuperarPage() {
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
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Te enviaremos un enlace para crear una nueva.
          </p>
        </div>

        <RequestResetForm />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
          ← Volver al acceso
        </Link>
      </p>
    </div>
  );
}
