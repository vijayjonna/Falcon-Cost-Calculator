import React from 'react';

interface FalconLogoProps {
  className?: string;
  size?: number | string;
  color?: string;
  showBadge?: boolean;
  isDarkMode?: boolean;
}

export const FalconLogo: React.FC<FalconLogoProps> = ({
  className = "w-8 h-8",
  size,
  color,
  showBadge = false,
  isDarkMode = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  // Exact architectural blueprint slate-navy tone matching the reference sample
  // Adaptive high-contrast blueprint sky tone for dark theme backgrounds
  const markColor = color || (isDarkMode ? '#60a5fa' : '#184572');

  const svgContent = (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Falcon Cost Calculator Logo"
    >
      {/* Architectural Drafting Framework (CAD / Blueprint Crosshairs) */}
      <g stroke={markColor} strokeWidth="9" strokeLinecap="square">
        {/* Top horizontal drafting line with crosshair extension on the right */}
        <line x1="162" y1="108" x2="436" y2="108" />

        {/* Right vertical drafting line - upper section (crosshair at top-right) */}
        <line x1="412" y1="80" x2="412" y2="198" />

        {/* Right vertical drafting line - lower section (crosshair at bottom-right) */}
        <line x1="412" y1="300" x2="412" y2="444" />

        {/* Bottom horizontal drafting line with crosshair extension on the right */}
        <line x1="268" y1="418" x2="436" y2="418" />
      </g>

      {/* Precision Architectural Falcon Silhouette */}
      <g fill={markColor}>
        {/* Head, Crest, Hooked Beak, Torso, and Swept Tail */}
        <path d="
          M 284 236
          L 276 210
          L 368 210
          C 382 210 398 220 416 248
          C 418 258 406 266 392 266
          L 384 258
          C 360 286 330 330 304 372
          L 258 444
          L 204 444
          L 252 380
          L 284 370
          Z
        " />

        {/* Swept Aerodynamic 3-Blade Wing with Negative Space Kerf Slots */}
        <path d="
          M 56 64
          C 126 128 196 186 268 242
          L 268 360
          C 246 394 226 422 220 442
          L 194 442
          C 188 418 160 380 62 280
          C 126 316 168 328 198 322
          C 162 284 122 240 58 172
          C 126 214 172 228 206 220
          C 160 174 112 122 56 64
          Z
        " />
      </g>
    </svg>
  );

  if (!showBadge) {
    return svgContent;
  }

  return (
    <div
      className={`inline-flex items-center justify-center p-1.5 rounded-2xl transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/80 border border-slate-800 shadow-sm'
          : 'bg-white border border-slate-200 shadow-sm'
      }`}
    >
      {svgContent}
    </div>
  );
};
