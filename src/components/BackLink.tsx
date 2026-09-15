"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * "Volver" que regresa a la pantalla anterior (admin o panel de cliente, según
 * de dónde se viniera) y, si se entró directamente, va a `href`.
 */
export function BackLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        const sameOrigin = document.referrer.startsWith(window.location.origin);
        if (sameOrigin && window.history.length > 1) {
          e.preventDefault();
          window.history.back();
        }
      }}
    >
      {children}
    </Link>
  );
}
