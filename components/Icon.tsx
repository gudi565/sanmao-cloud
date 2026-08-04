import { cn } from "@/lib/utils";

const PATHS: Record<string, React.ReactNode> = {
  pen: (
    <path
      d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
      strokeWidth="1.6"
    />
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.6" />
      <circle cx="8.5" cy="8.5" r="1.6" strokeWidth="1.6" />
      <path d="m21 15-5-5L5 21" strokeWidth="1.6" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" strokeWidth="1.6" />
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7M3 12h18" strokeWidth="1.6" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 0 4 20.5Zm0 0V21" strokeWidth="1.6" />
      <path d="M9 7h6M9 11h6" strokeWidth="1.6" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2.5" strokeWidth="1.6" />
      <path d="m16 10 5-3v10l-5-3" strokeWidth="1.6" />
    </>
  ),
  code: (
    <path d="m9 9-3 3 3 3m6-6 3 3-3 3m-2-8-2 12" strokeWidth="1.6" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" strokeWidth="1.6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" strokeWidth="1.6" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeWidth="1.6" />
    </>
  ),
  layers: (
    <path d="m12 3 9 5-9 5-9-5Zm9 9-9 5-9-5m18 4-9 5-9-5" strokeWidth="1.6" />
  ),
  sparkles: (
    <path
      d="M12 3l1.7 4.8L18.5 9.5 13.7 11.2 12 16l-1.7-4.8L5.5 9.5l4.8-1.7Zm7 7 .8 2.2 2.2.8-2.2.8L19 17l-.8-2.2-2.2-.8 2.2-.8Z"
      strokeWidth="1.4"
    />
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" strokeWidth="1.6" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" strokeWidth="1.6" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 6.1M17 20a5.5 5.5 0 0 0-2.5-4.6" strokeWidth="1.6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.4" strokeWidth="1.6" />
    </>
  ),
  shield: (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" strokeWidth="1.6" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <path d="M12 7v5l3 2" strokeWidth="1.6" />
    </>
  ),
  graduation: (
    <>
      <path d="M22 9 12 4 2 9l10 5Z" strokeWidth="1.6" />
      <path d="M6 11v5c0 1.3 2.7 3 6 3s6-1.7 6-3v-5" strokeWidth="1.6" />
    </>
  ),
  star: (
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17.9 6.7 19.6l1-5.8L3.5 9.7l5.9-.9Z"
      strokeWidth="1.5"
    />
  ),
  play: <path d="M8 5.5v13l11-6.5Z" strokeWidth="1.6" />,
  check: <path d="m20 6-9.5 9.5L5 10" strokeWidth="1.8" />,
  plus: <path d="M12 5v14M5 12h14" strokeWidth="1.8" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" strokeWidth="1.8" />,
  chat: (
    <path
      d="M21 12a8 8 0 0 1-8 8H8l-4 3V12a8 8 0 0 1 8-8h1a8 8 0 0 1 8 8Z"
      strokeWidth="1.6"
    />
  ),
  rocket: (
    <path
      d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2m9-13c-3 0-7 2-9.5 5.5L6 13l5 5 4.5-2.5C19 12 21 8 21 5c-1 0-2 0-3 0Zm-5 6 2-2m-7 1 3 3"
      strokeWidth="1.5"
    />
  ),
};

type Props = {
  name: keyof typeof PATHS | string;
  className?: string;
  size?: number;
};

export default function Icon({ name, className, size = 24 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      aria-hidden
    >
      {PATHS[name] ?? PATHS.sparkles}
    </svg>
  );
}
