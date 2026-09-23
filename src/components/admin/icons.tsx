import type { ReactNode, SVGProps } from "react";

/**
 * Iconos de trazo de la consola (24×24, trazo 1.8, extremos redondeados), para
 * no depender de emojis, que cambian de aspecto en cada sistema.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconTranslate = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5h9M8.5 3v2M6 5c.6 3.6 2.9 6.4 6 7.6M11 5c-.7 3.9-3.2 6.9-7 8" />
    <path d="M13 21l3.5-8 3.5 8M14.2 18.5h4.6" />
  </Icon>
);

export const IconEye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6v12M6 12h12" />
  </Icon>
);

export const IconRefresh = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 0 0-14.3-4.5L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.5l1.7-2M20 20v-4.5h-4.5" />
  </Icon>
);

export const IconSend = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3Z" />
  </Icon>
);

export const IconMonitor = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8.5 20h7M12 16v4" />
  </Icon>
);

export const IconPhone = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const IconLink = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </Icon>
);

export const IconQuote = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5v14" strokeWidth={3} />
    <path d="M10 8h9M10 12h9M10 16h6" />
  </Icon>
);

export const IconListBullet = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 6.5h10M10 12h10M10 17.5h10" />
    <circle cx="5" cy="6.5" r="1.1" fill="currentColor" />
    <circle cx="5" cy="12" r="1.1" fill="currentColor" />
    <circle cx="5" cy="17.5" r="1.1" fill="currentColor" />
  </Icon>
);

export const IconListOrdered = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 6.5h10M10 12h10M10 17.5h10" />
    <path d="M4 5.5l1.5-1v4M3.8 11.2c.3-.5.8-.8 1.4-.8.7 0 1.2.5 1.2 1.1 0 .9-2.6 2-2.6 2.8h2.7" strokeWidth={1.4} />
  </Icon>
);

export const IconDivider = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12h18" />
    <path d="M8 7h8M8 17h8" strokeOpacity={0.4} />
  </Icon>
);

export const IconClearFormat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 5h12M12 5l-3 14M15.5 14.5l5 5M20.5 14.5l-5 5" />
  </Icon>
);

export const IconUndo = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Icon>
);

export const IconRedo = (p: IconProps) => (
  <Icon {...p}>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
  </Icon>
);

/** Indicador de trabajo en curso (respeta "reducir movimiento" desde globals.css). */
export const Spinner = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={3} />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);
