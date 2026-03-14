"use client";

/**
 * Abstract COUP background symbolism
 * Subtle, blurred SVG featuring interlocking card shapes and crown elements
 */
export function CoupBackgroundSVG() {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(1px)",
        opacity: 0.08,
      }}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* Main crown/coup symbol — large card shapes overlapping */}
      <g opacity="0.7">
        {/* Left card */}
        <path
          d="M 300 200 L 400 180 L 420 400 L 300 420 Z"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Crown peak on left card */}
        <circle cx="350" cy="200" r="15" fill="url(#grad1)" opacity="0.6" />
      </g>

      {/* Center card — larger, emphasized */}
      <g opacity="0.9">
        <path
          d="M 400 150 L 600 150 L 650 500 L 350 500 Z"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center crown/gem */}
        <circle cx="500" cy="180" r="20" fill="url(#grad1)" opacity="0.7" />
        <circle cx="500" cy="180" r="10" fill="url(#grad1)" opacity="0.5" />
      </g>

      {/* Right card */}
      <g opacity="0.7">
        <path
          d="M 580 200 L 680 180 L 700 420 L 580 400 Z"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Crown peak on right card */}
        <circle cx="630" cy="200" r="15" fill="url(#grad1)" opacity="0.6" />
      </g>

      {/* Subtle background geometry — implies hidden information */}
      <g opacity="0.4" stroke="url(#grad1)" strokeWidth="1" fill="none">
        {/* Orbital rings suggesting strategy/layers */}
        <circle cx="500" cy="450" r="120" strokeDasharray="8,8" />
        <circle cx="500" cy="450" r="180" strokeDasharray="12,6" />
        <circle cx="500" cy="450" r="240" strokeDasharray="6,10" />
      </g>

      {/* Bottom accent dots suggesting coins/influence */}
      <g opacity="0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`coin-${i}`}
            cx={300 + i * 140}
            cy="750"
            r="20"
            fill="url(#grad1)"
            opacity="0.4"
          />
        ))}
      </g>

      {/* Corner accents — subtly frame the edges */}
      <g opacity="0.3" stroke="url(#grad1)" strokeWidth="2" fill="none">
        {/* Top left */}
        <path d="M 50 50 L 120 50 M 50 50 L 50 120" strokeLinecap="round" />
        {/* Top right */}
        <path d="M 950 50 L 880 50 M 950 50 L 950 120" strokeLinecap="round" />
        {/* Bottom left */}
        <path d="M 50 950 L 120 950 M 50 950 L 50 880" strokeLinecap="round" />
        {/* Bottom right */}
        <path
          d="M 950 950 L 880 950 M 950 950 L 950 880"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
