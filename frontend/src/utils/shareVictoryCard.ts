export interface VictoryCardDesign {
  themeKey: string;
  themeLabel: string;
  tagline: string;
  backgroundStart: string;
  backgroundMid: string;
  backgroundEnd: string;
  metallicStart: string;
  metallicEnd: string;
  lineColor: string;
  panelFill: string;
  panelStroke: string;
  statusFill: string;
  statusStroke: string;
  orbColor: string;
  orbAccent: string;
  gemA: string;
  gemB: string;
  gemC: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const TAGLINES = [
  "Read the table. Held the nerve. Closed with style.",
  "A cleaner read, a colder finish, a room remembered.",
  "Every bluff answered. Every opening punished.",
  "Patience at the start. Precision at the end.",
  "Quiet pressure. Sharp timing. Full control.",
  "The table bent first. The finish stayed elegant.",
  "No wasted moves. No soft endings. Just control.",
  "Built the edge slowly. Closed the door fast.",
  "Good reads, better timing, premium finish.",
  "Composure won the middle. Nerve won the table.",
] as const;

const THEMES: VictoryCardDesign[] = [
  {
    themeKey: "atelier-teal",
    themeLabel: "Atelier Teal",
    tagline: TAGLINES[0],
    backgroundStart: "#0F2228",
    backgroundMid: "#1A3941",
    backgroundEnd: "#0C1820",
    metallicStart: "#FFF4D6",
    metallicEnd: "#D3A261",
    lineColor: "rgba(242, 226, 192, 0.14)",
    panelFill: "rgba(14, 26, 34, 0.42)",
    panelStroke: "rgba(247, 230, 188, 0.1)",
    statusFill: "rgba(23, 28, 42, 0.92)",
    statusStroke: "rgba(247, 230, 188, 0.12)",
    orbColor: "rgba(128, 191, 182, 0.12)",
    orbAccent: "rgba(233, 201, 141, 0.22)",
    gemA: "#72D3C6",
    gemB: "#90C7FF",
    gemC: "#F6C445",
    textPrimary: "#F6F0E3",
    textSecondary: "#D4DCE4",
    textMuted: "#AEBECA",
  },
  {
    themeKey: "velvet-plum",
    themeLabel: "Velvet Plum",
    tagline: TAGLINES[1],
    backgroundStart: "#1A1423",
    backgroundMid: "#2A1F36",
    backgroundEnd: "#120F18",
    metallicStart: "#FFE7C7",
    metallicEnd: "#C88C5A",
    lineColor: "rgba(255, 226, 203, 0.15)",
    panelFill: "rgba(20, 15, 29, 0.46)",
    panelStroke: "rgba(255, 226, 203, 0.11)",
    statusFill: "rgba(24, 20, 34, 0.92)",
    statusStroke: "rgba(255, 226, 203, 0.14)",
    orbColor: "rgba(190, 126, 170, 0.12)",
    orbAccent: "rgba(255, 204, 158, 0.2)",
    gemA: "#F38BA8",
    gemB: "#C6A0F6",
    gemC: "#FAB387",
    textPrimary: "#F8F2EB",
    textSecondary: "#DDCFD7",
    textMuted: "#BCABB6",
  },
  {
    themeKey: "graphite-copper",
    themeLabel: "Graphite Copper",
    tagline: TAGLINES[2],
    backgroundStart: "#171A1E",
    backgroundMid: "#2A3137",
    backgroundEnd: "#111417",
    metallicStart: "#FFF0D8",
    metallicEnd: "#C37A4A",
    lineColor: "rgba(255, 233, 202, 0.14)",
    panelFill: "rgba(17, 22, 26, 0.44)",
    panelStroke: "rgba(255, 233, 202, 0.11)",
    statusFill: "rgba(24, 28, 34, 0.92)",
    statusStroke: "rgba(255, 233, 202, 0.14)",
    orbColor: "rgba(255, 170, 120, 0.08)",
    orbAccent: "rgba(226, 191, 120, 0.2)",
    gemA: "#FF9E64",
    gemB: "#7DCFFF",
    gemC: "#C0CAF5",
    textPrimary: "#F3EFE7",
    textSecondary: "#D7D6D0",
    textMuted: "#B8BAB5",
  },
  {
    themeKey: "nocturne-blue",
    themeLabel: "Nocturne Blue",
    tagline: TAGLINES[3],
    backgroundStart: "#11192B",
    backgroundMid: "#162A45",
    backgroundEnd: "#0D1421",
    metallicStart: "#FFF3D4",
    metallicEnd: "#D7A34B",
    lineColor: "rgba(239, 231, 201, 0.14)",
    panelFill: "rgba(14, 20, 34, 0.42)",
    panelStroke: "rgba(239, 231, 201, 0.1)",
    statusFill: "rgba(20, 25, 40, 0.92)",
    statusStroke: "rgba(239, 231, 201, 0.12)",
    orbColor: "rgba(125, 165, 255, 0.1)",
    orbAccent: "rgba(229, 194, 118, 0.2)",
    gemA: "#7AA2F7",
    gemB: "#73DACA",
    gemC: "#F7768E",
    textPrimary: "#F4F7FB",
    textSecondary: "#D8DFEA",
    textMuted: "#AAB8CD",
  },
  {
    themeKey: "forest-velour",
    themeLabel: "Forest Velour",
    tagline: TAGLINES[4],
    backgroundStart: "#102219",
    backgroundMid: "#1C3B2C",
    backgroundEnd: "#0C1711",
    metallicStart: "#FFF1CE",
    metallicEnd: "#C89B44",
    lineColor: "rgba(245, 230, 188, 0.14)",
    panelFill: "rgba(14, 24, 18, 0.44)",
    panelStroke: "rgba(245, 230, 188, 0.1)",
    statusFill: "rgba(21, 29, 22, 0.92)",
    statusStroke: "rgba(245, 230, 188, 0.12)",
    orbColor: "rgba(123, 203, 148, 0.1)",
    orbAccent: "rgba(233, 201, 141, 0.18)",
    gemA: "#7BE0B8",
    gemB: "#F6C445",
    gemC: "#8FB8FF",
    textPrimary: "#F5F4EC",
    textSecondary: "#D6DECF",
    textMuted: "#AFC2B1",
  },
] as const;

function hashSeed(seed: string) {
  return [...seed].reduce(
    (total, char, index) =>
      (total * 31 + char.charCodeAt(0) + index) % 2147483647,
    7,
  );
}

export function chooseVictoryCardDesign(seed: string): VictoryCardDesign {
  const hash = hashSeed(seed);
  const theme = THEMES[hash % THEMES.length];
  const tagline =
    TAGLINES[(Math.floor(hash / 11) + theme.themeKey.length) % TAGLINES.length];
  return {
    ...theme,
    tagline,
  };
}

function buildVictorySvg(winnerName: string, design: VictoryCardDesign) {
  const safeName = escapeXml(winnerName.trim() || "Unknown Victor");
  const safeTagline = escapeXml(design.tagline);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Coup victory card for ${safeName}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${design.backgroundStart}" />
          <stop offset="52%" stop-color="${design.backgroundMid}" />
          <stop offset="100%" stop-color="${design.backgroundEnd}" />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${design.metallicStart}" />
          <stop offset="100%" stop-color="${design.metallicEnd}" />
        </linearGradient>
        <radialGradient id="aura" cx="50%" cy="50%" r="62%">
          <stop offset="0%" stop-color="${design.metallicStart}" stop-opacity="0.22" />
          <stop offset="60%" stop-color="${design.metallicEnd}" stop-opacity="0.06" />
          <stop offset="100%" stop-color="${design.metallicEnd}" stop-opacity="0" />
        </radialGradient>
        <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke="${design.lineColor}" stroke-width="1"/>
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="630" rx="36" fill="url(#bg)" />
      <rect x="20" y="20" width="1160" height="590" rx="28" fill="none" stroke="${design.panelStroke}" />
      <rect x="42" y="42" width="1116" height="546" rx="24" fill="url(#grid)" opacity="0.45" />
      <ellipse cx="760" cy="214" rx="280" ry="194" fill="url(#aura)" />
      <circle cx="1018" cy="146" r="92" fill="${design.orbColor}" />
      <circle cx="192" cy="486" r="110" fill="${design.orbAccent}" />

      <path d="M112 108c166-56 332-70 530-70 210 0 360 24 470 92" fill="none" stroke="${design.lineColor}" stroke-width="2" />
      <path d="M110 514c142 66 322 92 544 92 190 0 326-18 452-58" fill="none" stroke="${design.lineColor}" stroke-width="2" />

      <g transform="translate(86 92)">
        <text x="0" y="0" fill="${design.metallicEnd}" font-size="28" font-family="Georgia, Times New Roman, serif" letter-spacing="9">COUP</text>
        <text x="0" y="58" fill="${design.textPrimary}" font-size="78" font-weight="900" font-family="Segoe UI, Arial, sans-serif">TABLE VICTORY</text>
        <text x="0" y="108" fill="${design.textSecondary}" font-size="24" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${safeTagline}</text>
      </g>

      <g transform="translate(648 168)" filter="url(#glow)">
        <circle cx="0" cy="0" r="84" fill="${design.metallicStart}" fill-opacity="0.08" stroke="${design.metallicEnd}" stroke-opacity="0.24" stroke-width="2" />
        <path d="M-54 28h108l-10-66-28 30-16-44-16 44-28-30Z" fill="url(#metal)" stroke="${design.metallicStart}" stroke-width="3.2" stroke-linejoin="round" />
        <path d="M-40 50h80" stroke="${design.metallicEnd}" stroke-width="7" stroke-linecap="round" />
      </g>

      <g transform="translate(92 298)">
        <rect x="0" y="0" width="716" height="206" rx="30" fill="${design.panelFill}" stroke="${design.panelStroke}" />
        <text x="38" y="52" fill="${design.textMuted}" font-size="23" font-weight="800" font-family="Segoe UI, Arial, sans-serif" letter-spacing="4">WINNER</text>
        <text x="38" y="126" fill="${design.textPrimary}" font-size="88" font-weight="900" font-family="Segoe UI, Arial, sans-serif">${safeName}</text>
        <text x="38" y="178" fill="${design.textSecondary}" font-size="30" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${safeTagline}</text>
      </g>

      <g transform="translate(870 382)">
        <rect x="0" y="0" width="230" height="138" rx="28" fill="${design.statusFill}" stroke="${design.statusStroke}" />
        <text x="28" y="46" fill="${design.metallicEnd}" font-size="18" font-weight="800" font-family="Segoe UI, Arial, sans-serif" letter-spacing="2">STATUS</text>
        <text x="28" y="92" fill="${design.textPrimary}" font-size="38" font-weight="900" font-family="Segoe UI, Arial, sans-serif">Winner</text>
        <text x="28" y="120" fill="${design.textMuted}" font-size="18" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${escapeXml(design.themeLabel)}</text>
      </g>

      <g opacity="0.92">
        <path d="M1020 92l30 30-30 30-30-30Z" fill="${design.gemA}" fill-opacity="0.88" />
        <path d="M76 480l20 20-20 20-20-20Z" fill="${design.gemB}" fill-opacity="0.9" />
        <path d="M1116 544l14 14-14 14-14-14Z" fill="${design.gemC}" fill-opacity="0.9" />
        <path d="M126 562l16 16-16 16-16-16Z" fill="${design.gemA}" fill-opacity="0.84" />
        <path d="M552 126l14 14-14 14-14-14Z" fill="${design.gemA}" fill-opacity="0.84" />
      </g>
    </svg>
  `;
}

function buildVictoryFilename(winnerName: string): string {
  const slug = winnerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "winner";
  const dateSuffix = new Date().toISOString().slice(0, 10);
  return `coup-victory-${slug}-${dateSuffix}.png`;
}

export function getVictoryCardPreviewSrc(
  winnerName: string,
  design: VictoryCardDesign,
): string {
  const svg = buildVictorySvg(winnerName, design);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function svgToPngFile(
  winnerName: string,
  design: VictoryCardDesign,
): Promise<File> {
  const svg = buildVictorySvg(winnerName, design);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () =>
        reject(new Error("Unable to load share card image"));
      nextImage.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to render share card");
    }

    context.drawImage(image, 0, 0);
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) {
          resolve(value);
          return;
        }
        reject(new Error("Unable to export victory card"));
      }, "image/png");
    });

    return new File([pngBlob], buildVictoryFilename(winnerName), {
      type: "image/png",
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadVictoryCard(
  winnerName: string,
  design: VictoryCardDesign,
): Promise<void> {
  const file = await svgToPngFile(winnerName, design);
  downloadFile(file);
}

export async function shareVictoryCard(
  winnerName: string,
  design: VictoryCardDesign,
): Promise<"shared" | "downloaded"> {
  const file = await svgToPngFile(winnerName, design);
  const sharePayload = {
    files: [file],
    title: `${winnerName} won the Coup table`,
    text: design.tagline,
  };

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (typeof navigator.canShare !== "function" ||
      navigator.canShare(sharePayload))
  ) {
    await navigator.share(sharePayload);
    return "shared";
  }

  downloadFile(file);
  return "downloaded";
}
