import React from "react";

export type ActionGlyphName =
  | "income"
  | "aid"
  | "coup"
  | "tax"
  | "assassinate"
  | "steal"
  | "exchange"
  | "challenge"
  | "block"
  | "reveal"
  | "elimination"
  | "turn"
  | "system";

interface ActionGlyphProps {
  name: ActionGlyphName;
  size?: number;
}

export function ActionGlyph({ name, size = 16 }: ActionGlyphProps) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const solid = { fill: "currentColor" };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {name === "income" && (
        <>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M12 8v8" {...stroke} />
          <path d="M9 12h6" {...stroke} />
        </>
      )}
      {name === "aid" && (
        <>
          <path d="M6 12h12" {...stroke} />
          <path d="M12 6v12" {...stroke} />
          <circle cx="12" cy="12" r="8" {...stroke} />
        </>
      )}
      {name === "coup" && (
        <>
          <path d="M5 17 19 7" {...stroke} />
          <path d="m13 7 6 0 0 6" {...stroke} />
          <path d="M7 11 5 17 11 19" {...stroke} />
        </>
      )}
      {name === "tax" && (
        <>
          <path
            d="M12 5 18 8v4c0 4-2.7 6.6-6 7-3.3-.4-6-3-6-7V8l6-3Z"
            {...stroke}
          />
          <path d="M9.5 10.5h5" {...stroke} />
          <path d="M9.5 13.5h5" {...stroke} />
        </>
      )}
      {name === "assassinate" && (
        <>
          <path d="M7 17 17 7" {...stroke} />
          <path d="m9 7 8 8" {...stroke} />
          <circle cx="12" cy="12" r="8" {...stroke} />
        </>
      )}
      {name === "steal" && (
        <>
          <rect x="5" y="8" width="9" height="7" rx="2" {...stroke} />
          <path d="M10 11.5h9" {...stroke} />
          <path d="m16 9 3 2.5-3 2.5" {...stroke} />
        </>
      )}
      {name === "exchange" && (
        <>
          <path d="M7 8h10" {...stroke} />
          <path d="m13 5 4 3-4 3" {...stroke} />
          <path d="M17 16H7" {...stroke} />
          <path d="m11 13-4 3 4 3" {...stroke} />
        </>
      )}
      {name === "challenge" && (
        <>
          <path d="M12 18v-2.5" {...stroke} />
          <path d="M9.4 9.5a2.6 2.6 0 1 1 4.4 2 4 4 0 0 0-1.3 2" {...stroke} />
          <circle cx="12" cy="20" r="1" {...solid} />
        </>
      )}
      {name === "block" && (
        <>
          <path
            d="M12 4 18 7v4c0 4.2-2.8 7.3-6 8-3.2-.7-6-3.8-6-8V7l6-3Z"
            {...stroke}
          />
          <path d="M9 12h6" {...stroke} />
        </>
      )}
      {name === "reveal" && (
        <>
          <path
            d="M3.5 12s3.2-5 8.5-5 8.5 5 8.5 5-3.2 5-8.5 5-8.5-5-8.5-5Z"
            {...stroke}
          />
          <circle cx="12" cy="12" r="2.5" {...stroke} />
        </>
      )}
      {name === "elimination" && (
        <>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M8.5 8.5 15.5 15.5" {...stroke} />
          <path d="M15.5 8.5 8.5 15.5" {...stroke} />
        </>
      )}
      {name === "turn" && (
        <>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M12 8v4l2.5 2.5" {...stroke} />
        </>
      )}
      {name === "system" && (
        <>
          <path d="M12 5v14" {...stroke} />
          <path d="M5 12h14" {...stroke} />
          <circle cx="12" cy="12" r="8" {...stroke} />
        </>
      )}
    </svg>
  );
}
