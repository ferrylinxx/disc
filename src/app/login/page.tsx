import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Acceso · DISC GESEM" };

export default function LoginPage() {
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
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Accede a tu panel de DISC GESEM.
          </p>
        </div>

        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Eres participante con una invitación?{" "}
        <Link href="/" className="font-semibold text-sky-600 hover:text-sky-700">
          Empieza aquí
        </Link>
      </p>
    </div>
  );
}
