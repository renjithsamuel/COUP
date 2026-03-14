"use client";

import React from "react";
import { Character } from "@/models/card";

interface IconProps {
  size?: number;
  color?: string;
}

/* ─── Duke: regal crown with purple/gold detail ─── */
function DukeIcon({ size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="duke-crown"
          x1="20"
          y1="8"
          x2="60"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="50%" stopColor="#FFAB00" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        <linearGradient
          id="duke-robe"
          x1="24"
          y1="42"
          x2="56"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#CE93D8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7B1FA2" stopOpacity="0.9" />
        </linearGradient>
        <filter id="duke-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Crown */}
      <path
        d="M18 34L24 16L32 26L40 8L48 26L56 16L62 34V40H18V34Z"
        fill="url(#duke-crown)"
        filter="url(#duke-glow)"
      />
      <rect x="18" y="38" width="44" height="5" rx="2" fill="#FFAB00" />
      {/* Crown gems */}
      <circle cx="30" cy="30" r="2.5" fill="#E040FB" />
      <circle cx="40" cy="22" r="3" fill="#E040FB" />
      <circle cx="50" cy="30" r="2.5" fill="#E040FB" />
      <circle cx="30" cy="30" r="1.2" fill="#F3E5F5" opacity="0.7" />
      <circle cx="40" cy="22" r="1.5" fill="#F3E5F5" opacity="0.7" />
      <circle cx="50" cy="30" r="1.2" fill="#F3E5F5" opacity="0.7" />
      {/* Crown edge detail */}
      <path d="M20 36H60" stroke="#FFE082" strokeWidth="0.5" opacity="0.5" />
      {/* Robe / figure */}
      <path d="M26 43H54L58 72H22L26 43Z" fill="url(#duke-robe)" />
      {/* Fur collar */}
      <ellipse cx="40" cy="44" rx="15" ry="3" fill="#F3E5F5" opacity="0.25" />
      {/* Gold chain / medallion */}
      <path
        d="M34 47C34 47 37 52 40 52C43 52 46 47 46 47"
        stroke="#FFD54F"
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
      <circle cx="40" cy="54" r="3" fill="#FFD54F" opacity="0.6" />
      <circle cx="40" cy="54" r="1.5" fill="#FFF8E1" opacity="0.4" />
      {/* Robe trim */}
      <path
        d="M28 60L22 72H58L52 60"
        stroke="#CE93D8"
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}

/* ─── Assassin: menacing hooded figure with dagger ─── */
function AssassinIcon({ size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="assn-hood"
          x1="20"
          y1="6"
          x2="60"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#546E7A" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>
        <linearGradient
          id="assn-blade"
          x1="39"
          y1="44"
          x2="41"
          y2="68"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#B0BEC5" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
        <radialGradient
          id="assn-face"
          cx="40"
          cy="30"
          r="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#263238" />
          <stop offset="100%" stopColor="#0a0a12" />
        </radialGradient>
        <filter id="assn-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#000"
            floodOpacity="0.5"
          />
        </filter>
      </defs>
      {/* Hood */}
      <path
        d="M16 40C16 16 24 6 40 6C56 6 64 16 64 40L58 46H22L16 40Z"
        fill="url(#assn-hood)"
        filter="url(#assn-shadow)"
      />
      {/* Hood creases */}
      <path
        d="M28 14C32 10 40 8 40 8"
        stroke="#37474F"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <path
        d="M52 14C48 10 40 8 40 8"
        stroke="#37474F"
        strokeWidth="0.6"
        opacity="0.4"
      />
      {/* Face shadow */}
      <ellipse cx="40" cy="30" rx="10" ry="9" fill="url(#assn-face)" />
      {/* Glowing eyes */}
      <ellipse cx="36" cy="29" rx="2.5" ry="1" fill="#F44336" opacity="0.9" />
      <ellipse cx="44" cy="29" rx="2.5" ry="1" fill="#F44336" opacity="0.9" />
      <ellipse cx="36" cy="29" rx="1" ry="0.5" fill="#FFCDD2" opacity="0.6" />
      <ellipse cx="44" cy="29" rx="1" ry="0.5" fill="#FFCDD2" opacity="0.6" />
      {/* Dagger blade */}
      <path d="M38.5 46L40 42L41.5 46L40 72L38.5 46Z" fill="url(#assn-blade)" />
      {/* Crossguard */}
      <rect x="35" y="44" width="10" height="2.5" rx="1" fill="#546E7A" />
      {/* Grip */}
      <rect x="38.5" y="42" width="3" height="4" rx="0.5" fill="#37474F" />
      <line
        x1="39"
        y1="42.5"
        x2="41"
        y2="42.5"
        stroke="#455A64"
        strokeWidth="0.5"
      />
      <line
        x1="39"
        y1="44"
        x2="41"
        y2="44"
        stroke="#455A64"
        strokeWidth="0.5"
      />
      {/* Blade edge highlights */}
      <line
        x1="40"
        y1="48"
        x2="40"
        y2="68"
        stroke="#CFD8DC"
        strokeWidth="0.3"
        opacity="0.5"
      />
      {/* Drip */}
      <circle cx="40" cy="72" r="1.5" fill="#F44336" opacity="0.4" />
    </svg>
  );
}

/* ─── Captain: naval officer with decorated hat and anchor ─── */
function CaptainIcon({ size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="capt-hat"
          x1="20"
          y1="8"
          x2="60"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#0D47A1" />
        </linearGradient>
        <linearGradient
          id="capt-anchor"
          x1="32"
          y1="44"
          x2="48"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#90CAF9" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
      </defs>
      {/* Hat brim */}
      <ellipse cx="40" cy="26" rx="20" ry="5" fill="#0D47A1" />
      {/* Hat crown */}
      <path
        d="M24 26C24 26 26 10 40 10C54 10 56 26 56 26"
        fill="url(#capt-hat)"
      />
      {/* Hat band */}
      <rect x="24" y="22" width="32" height="4" rx="1" fill="#0D47A1" />
      <rect
        x="24"
        y="22"
        width="32"
        height="1"
        rx="0.5"
        fill="#FFD54F"
        opacity="0.7"
      />
      <rect
        x="24"
        y="25"
        width="32"
        height="0.8"
        rx="0.4"
        fill="#FFD54F"
        opacity="0.5"
      />
      {/* Badge emblem */}
      <circle cx="40" cy="18" r="4.5" fill="#FFD54F" opacity="0.8" />
      <circle cx="40" cy="18" r="3" fill="#0D47A1" />
      <path d="M38 18L40 15L42 18L40 16.5Z" fill="#FFD54F" opacity="0.7" />
      {/* Face silhouette */}
      <ellipse cx="40" cy="36" rx="10" ry="9" fill="#0a1628" />
      {/* Epaulettes */}
      <ellipse cx="25" cy="40" rx="5" ry="2" fill="#1565C0" opacity="0.6" />
      <ellipse cx="55" cy="40" rx="5" ry="2" fill="#1565C0" opacity="0.6" />
      <path
        d="M21 40L25 42L29 40"
        stroke="#FFD54F"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <path
        d="M51 40L55 42L59 40"
        stroke="#FFD54F"
        strokeWidth="0.5"
        opacity="0.6"
      />
      {/* Anchor */}
      <circle
        cx="40"
        cy="52"
        r="5"
        stroke="url(#capt-anchor)"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="40"
        y1="46"
        x2="40"
        y2="68"
        stroke="url(#capt-anchor)"
        strokeWidth="2"
      />
      <path
        d="M33 64C33 58 40 55 40 55C40 55 47 58 47 64"
        stroke="url(#capt-anchor)"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="35"
        y1="52"
        x2="45"
        y2="52"
        stroke="url(#capt-anchor)"
        strokeWidth="1.5"
      />
      {/* Anchor ring */}
      <circle
        cx="40"
        cy="47"
        r="2"
        stroke="#90CAF9"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

/* ─── Ambassador: ornate scroll with diplomatic seal ─── */
function AmbassadorIcon({ size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="amb-scroll"
          x1="24"
          y1="8"
          x2="56"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A5D6A7" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient
          id="amb-seal"
          x1="34"
          y1="50"
          x2="46"
          y2="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
      </defs>
      {/* Scroll top roll */}
      <ellipse cx="28" cy="14" rx="5" ry="6" fill="#C8E6C9" opacity="0.8" />
      <ellipse cx="52" cy="14" rx="5" ry="6" fill="#C8E6C9" opacity="0.8" />
      {/* Scroll body */}
      <rect
        x="28"
        y="10"
        width="24"
        height="42"
        rx="2"
        fill="url(#amb-scroll)"
      />
      {/* Scroll edge shadow */}
      <rect x="28" y="10" width="3" height="42" fill="#81C784" opacity="0.15" />
      <rect x="49" y="10" width="3" height="42" fill="#1B5E20" opacity="0.08" />
      {/* Text lines */}
      <line
        x1="32"
        y1="18"
        x2="48"
        y2="18"
        stroke="#2E7D32"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <line
        x1="32"
        y1="22"
        x2="46"
        y2="22"
        stroke="#2E7D32"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <line
        x1="32"
        y1="26"
        x2="48"
        y2="26"
        stroke="#2E7D32"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <line
        x1="32"
        y1="30"
        x2="44"
        y2="30"
        stroke="#2E7D32"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <line
        x1="32"
        y1="34"
        x2="47"
        y2="34"
        stroke="#2E7D32"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <line
        x1="32"
        y1="38"
        x2="42"
        y2="38"
        stroke="#2E7D32"
        strokeWidth="0.8"
        opacity="0.5"
      />
      {/* Wax seal */}
      <circle cx="40" cy="56" r="8" fill="url(#amb-seal)" />
      <circle cx="40" cy="56" r="5.5" fill="#FF8F00" />
      <circle
        cx="40"
        cy="56"
        r="5.5"
        stroke="#FFE082"
        strokeWidth="0.5"
        fill="none"
      />
      {/* Seal emblem - fleur de lis style */}
      <path d="M40 51L42 54L40 53L38 54Z" fill="#FFF8E1" opacity="0.8" />
      <circle cx="40" cy="57" r="1.5" fill="#FFF8E1" opacity="0.6" />
      <path
        d="M37 56L40 59L43 56"
        stroke="#FFF8E1"
        strokeWidth="0.5"
        opacity="0.6"
        fill="none"
      />
      {/* Ribbons */}
      <path
        d="M36 62C34 66 30 70 28 72"
        stroke="#EF5350"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 62C46 66 50 70 52 72"
        stroke="#EF5350"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ribbon tips */}
      <path d="M26 72L28 72L27 75Z" fill="#EF5350" />
      <path d="M52 72L54 72L53 75Z" fill="#EF5350" />
    </svg>
  );
}

/* ─── Contessa: elegant tiara with jewels and noble figure ─── */
function ContessaIcon({ size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="cont-tiara"
          x1="20"
          y1="8"
          x2="60"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
        <linearGradient
          id="cont-dress"
          x1="22"
          y1="40"
          x2="58"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#EF9A9A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#C62828" stopOpacity="0.8" />
        </linearGradient>
        <filter id="cont-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Tiara */}
      <path
        d="M22 28L28 12L33 20L40 6L47 20L52 12L58 28"
        fill="url(#cont-tiara)"
        filter="url(#cont-glow)"
      />
      <path
        d="M22 28L28 12L33 20L40 6L47 20L52 12L58 28"
        stroke="#FFE082"
        strokeWidth="0.8"
        fill="none"
      />
      {/* Tiara band */}
      <rect x="22" y="26" width="36" height="3" rx="1.5" fill="#FFB300" />
      {/* Jewels */}
      <circle cx="28" cy="15" r="2.5" fill="#F44336" />
      <circle cx="28" cy="15" r="1" fill="#FFCDD2" opacity="0.7" />
      <circle cx="40" cy="10" r="3.5" fill="#F44336" />
      <circle cx="40" cy="10" r="1.5" fill="#FFCDD2" opacity="0.7" />
      <circle cx="52" cy="15" r="2.5" fill="#F44336" />
      <circle cx="52" cy="15" r="1" fill="#FFCDD2" opacity="0.7" />
      {/* Smaller gems on band */}
      <circle cx="34" cy="27.5" r="1" fill="#E040FB" opacity="0.6" />
      <circle cx="40" cy="27.5" r="1" fill="#E040FB" opacity="0.6" />
      <circle cx="46" cy="27.5" r="1" fill="#E040FB" opacity="0.6" />
      {/* Face silhouette */}
      <ellipse cx="40" cy="37" rx="10" ry="9" fill="#1a0a0a" />
      {/* Necklace */}
      <path
        d="M28 46C28 46 34 52 40 52C46 52 52 46 52 46"
        stroke="#FFD54F"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <circle cx="40" cy="52" r="2.5" fill="#F44336" />
      <circle cx="40" cy="52" r="1" fill="#FFCDD2" opacity="0.6" />
      <circle cx="35" cy="50" r="1.2" fill="#FFD54F" opacity="0.5" />
      <circle cx="45" cy="50" r="1.2" fill="#FFD54F" opacity="0.5" />
      {/* Dress */}
      <path
        d="M24 48L20 76H60L56 48C56 48 50 54 40 54C30 54 24 48 24 48Z"
        fill="url(#cont-dress)"
      />
      {/* Dress details */}
      <path d="M34 54V70" stroke="#EF9A9A" strokeWidth="0.5" opacity="0.3" />
      <path d="M46 54V70" stroke="#EF9A9A" strokeWidth="0.5" opacity="0.3" />
      <path d="M40 54V72" stroke="#EF9A9A" strokeWidth="0.3" opacity="0.2" />
    </svg>
  );
}

const CHARACTER_ICON_MAP: Record<Character, React.FC<IconProps>> = {
  [Character.DUKE]: DukeIcon,
  [Character.ASSASSIN]: AssassinIcon,
  [Character.CAPTAIN]: CaptainIcon,
  [Character.AMBASSADOR]: AmbassadorIcon,
  [Character.CONTESSA]: ContessaIcon,
};

export interface CharacterIconProps extends IconProps {
  character: Character;
}

export function CharacterIcon({ character, size, color }: CharacterIconProps) {
  const Icon = CHARACTER_ICON_MAP[character];
  return <Icon size={size} color={color} />;
}
