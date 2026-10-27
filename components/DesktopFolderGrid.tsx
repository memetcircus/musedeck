import { useId } from "react";

export interface DesktopFolderGridProps {
  /** Folder names. Long names are middle-truncated like Finder ("stre...ideo"). */
  items?: string[];
  /** Grid columns. Defaults to 4 to match the screenshot. */
  columns?: number;
  /** Max label length before middle-truncation kicks in. Defaults to 12. */
  maxLabelChars?: number;
  /** Extra classes for the outer container. */
  className?: string;
}

const DEFAULT_ITEMS = [
  "new",
  "torba_6",
  "Qala...hip",
  "splatris",
  "Losounne",
  "torba_4",
  "Ahe...ame",
  "stre...ideo",
  "qala...icon",
  "awe",
  "Ahe...Ship",
  "gumruk",
  "Qala..ETS",
  "inst...depo",
  "Qal..post",
  "grid...sets",
  "Yet...rofili",
  "qala...Dist",
  "qala..asia",
  "kiro...isper",
  "qala...ook",
  "aiLEADER",
  "ame...misi",
  "fsf",
];

/** Finder-style middle truncation: "stream-video" -> "stre...ideo". */
export function truncateMiddle(name: string, maxChars = 12): string {
  if (name.length <= maxChars) return name;
  if (maxChars <= 3) return name.slice(0, maxChars);
  const head = Math.ceil((maxChars - 3) / 2);
  const tail = Math.floor((maxChars - 3) / 2);
  return `${name.slice(0, head)}...${name.slice(name.length - tail)}`;
}

function FolderIcon() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const backId = `fdb-${uid}`;
  const frontId = `fdf-${uid}`;

  return (
    <svg
      viewBox="0 0 96 70"
      className="h-auto w-16 drop-shadow-[0_5px_10px_rgba(0,0,0,0.55)] sm:w-[72px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={backId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f9ede" />
          <stop offset="1" stopColor="#3576b8" />
        </linearGradient>
        <linearGradient id={frontId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5d9fc" />
          <stop offset="0.45" stopColor="#7fc4f7" />
          <stop offset="1" stopColor="#5cadf0" />
        </linearGradient>
      </defs>
      {/* back plate + tab */}
      <path
        d="M14 6 h22 l7 8 h39 a8 8 0 0 1 8 8 v28 a8 8 0 0 1-8 8 H14 a8 8 0 0 1-8-8 V14 a8 8 0 0 1 8-8 z"
        fill={`url(#${backId})`}
      />
      {/* front plate */}
      <rect
        x="2"
        y="24"
        width="92"
        height="42"
        rx="9"
        fill={`url(#${frontId})`}
        stroke="rgba(25,70,115,0.35)"
        strokeWidth="1"
      />
      {/* top edge highlight */}
      <rect x="11" y="26" width="74" height="2" rx="1" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

/** Grain overlay that mimics the dark mottled desktop texture. */
function NoiseOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-20 mix-blend-overlay"
      aria-hidden="true"
    >
      <filter id="desktop-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#desktop-noise)" />
    </svg>
  );
}

/**
 * macOS-desktop-style folder grid on a dark textured background.
 * Drop into any React + Tailwind project: `<DesktopFolderGrid />`.
 */
export default function DesktopFolderGrid({
  items = DEFAULT_ITEMS,
  columns = 4,
  maxLabelChars = 12,
  className = "",
}: DesktopFolderGridProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#0a0c0e] px-6 py-8 ${className}`}>
      {/* mottled dark background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(120% 55% at 85% 0%, rgba(72,82,96,0.55), transparent 60%)",
            "radial-gradient(80% 45% at 18% 28%, rgba(52,60,72,0.4), transparent 62%)",
            "radial-gradient(90% 40% at 75% 55%, rgba(44,50,60,0.35), transparent 65%)",
            "radial-gradient(110% 70% at 50% 105%, rgba(34,38,46,0.65), transparent 65%)",
            "radial-gradient(130% 130% at 50% 40%, transparent 55%, rgba(0,0,0,0.55))",
          ].join(", "),
        }}
      />
      <NoiseOverlay />

      {/* folder grid */}
      <div
        className="relative mx-auto grid max-w-[430px] gap-x-2 gap-y-7"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.map((name, i) => (
          <div key={`${name}-${i}`} className="flex flex-col items-center gap-1.5">
            <FolderIcon />
            <span className="max-w-full whitespace-nowrap text-center text-[13px] leading-tight font-normal text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {truncateMiddle(name, maxLabelChars)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
