import React, { useState } from 'react';
import meiLogoPng from '@/assets/mei-logo.png';

interface MeiLogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

export const MeiLogo: React.FC<MeiLogoProps> = ({
  className = 'w-full h-full object-contain',
  size,
  alt = 'Mahendra Educational Institutions Logo',
}) => {
  const [imageError, setImageError] = useState(false);

  if (!imageError) {
    return (
      <img
        src={meiLogoPng}
        alt={alt}
        width={size}
        height={size}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 680"
      width={size || '100%'}
      height={size || '100%'}
      className={className}
      aria-label={alt}
    >
      <defs>
        {/* Globe Gradients */}
        <radialGradient id="meiGlobeSphere" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="35%" stopColor="#1e73be" />
          <stop offset="70%" stopColor="#0d47a1" />
          <stop offset="100%" stopColor="#062557" />
        </radialGradient>

        <radialGradient id="meiGlobeHighlight" cx="35%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* M Ribbon Gradient */}
        <linearGradient id="meiMRibbonGrad" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="30%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>

        {/* 3D Text Gradient */}
        <linearGradient id="meiTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e64c8" />
          <stop offset="45%" stopColor="#12499c" />
          <stop offset="55%" stopColor="#0d3575" />
          <stop offset="100%" stopColor="#082250" />
        </linearGradient>

        {/* Drop Shadows */}
        <filter id="meiShadowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.3" />
        </filter>

        <filter id="meiTextShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Group for Logo Mark */}
      <g transform="translate(0, 15)">
        {/* Globe Outer Shadow */}
        <circle cx="300" cy="225" r="160" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.3" filter="url(#meiShadowFilter)" />

        {/* 3D Globe Base Sphere */}
        <circle cx="300" cy="225" r="155" fill="url(#meiGlobeSphere)" />

        {/* Globe Grid: Latitudes */}
        <ellipse cx="300" cy="225" rx="155" ry="32" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.75" />
        <ellipse cx="300" cy="180" rx="146" ry="26" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.65" />
        <ellipse cx="300" cy="135" rx="120" ry="20" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.55" />
        <ellipse cx="300" cy="98" rx="78" ry="12" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.45" />
        <ellipse cx="300" cy="270" rx="146" ry="26" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.65" />
        <ellipse cx="300" cy="315" rx="120" ry="20" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.55" />
        <ellipse cx="300" cy="352" rx="78" ry="12" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.45" />

        {/* Globe Grid: Longitudes */}
        <ellipse cx="300" cy="225" rx="0.1" ry="155" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
        <ellipse cx="300" cy="225" rx="55" ry="155" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.7" />
        <ellipse cx="300" cy="225" rx="105" ry="155" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.7" />
        <ellipse cx="300" cy="225" rx="138" ry="155" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.65" />

        {/* Inner Core Node */}
        <circle cx="300" cy="225" r="28" fill="#1d4ed8" opacity="0.85" stroke="#93c5fd" strokeWidth="2" />
        <circle cx="295" cy="220" r="10" fill="#ffffff" opacity="0.5" />

        {/* Globe Specular Highlight */}
        <circle cx="300" cy="225" r="155" fill="url(#meiGlobeHighlight)" />

        {/* Stylized 3D Crest "M" Ribbon */}
        {/* Shadow */}
        <path
          d="M 152 400 C 105 320, 115 170, 205 95 C 240 65, 275 110, 300 170 C 325 110, 360 65, 395 95 C 485 170, 495 320, 448 400 C 440 375, 435 340, 438 310 C 448 235, 420 150, 370 120 C 340 100, 320 135, 300 195 C 280 135, 260 100, 230 120 C 180 150, 152 235, 162 310 C 165 340, 160 375, 152 400 Z"
          fill="#000000"
          opacity="0.3"
          filter="url(#meiShadowFilter)"
          transform="translate(0, 4)"
        />

        {/* Main Ribbon Body */}
        <path
          d="M 152 400 C 105 320, 115 170, 205 95 C 240 65, 275 110, 300 170 C 325 110, 360 65, 395 95 C 485 170, 495 320, 448 400 C 440 375, 435 340, 438 310 C 448 235, 420 150, 370 120 C 340 100, 320 135, 300 195 C 280 135, 260 100, 230 120 C 180 150, 152 235, 162 310 C 165 340, 160 375, 152 400 Z"
          fill="url(#meiMRibbonGrad)"
          stroke="#60a5fa"
          strokeWidth="2"
        />

        {/* Arrow Tip on Left */}
        <polygon points="152,400 135,420 162,410" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />

        {/* Dispersed Pixels on Right */}
        <rect x="445" y="380" width="14" height="14" fill="#3b82f6" rx="1.5" opacity="0.9" />
        <rect x="465" y="365" width="12" height="12" fill="#2563eb" rx="1.5" opacity="0.85" />
        <rect x="440" y="405" width="10" height="10" fill="#60a5fa" rx="1.5" opacity="0.8" />
        <rect x="425" y="415" width="12" height="12" fill="#1d4ed8" rx="1.5" opacity="0.9" />
        <rect x="405" y="425" width="9" height="9" fill="#3b82f6" rx="1" opacity="0.75" />
        <rect x="458" y="400" width="8" height="8" fill="#93c5fd" rx="1" opacity="0.85" />
        <rect x="475" y="385" width="9" height="9" fill="#60a5fa" rx="1" opacity="0.7" />
      </g>

      {/* Typography */}
      <g transform="translate(300, 505)" textAnchor="middle">
        <text x="0" y="2" fontFamily="'Arial Black', 'Impact', 'Montserrat', sans-serif" fontSize="64" fontWeight="900" letterSpacing="4" fill="#061c40" opacity="0.7">
          MAHENDRA
        </text>
        <text x="0" y="0" fontFamily="'Arial Black', 'Impact', 'Montserrat', sans-serif" fontSize="64" fontWeight="900" letterSpacing="4" fill="url(#meiTextGrad)" stroke="#93c5fd" strokeWidth="0.75" filter="url(#meiTextShadow)">
          MAHENDRA
        </text>

        <line x1="-285" y1="16" x2="285" y2="16" stroke="#000000" strokeWidth="3" strokeLinecap="square" />

        <text x="0" y="52" fontFamily="'Arial Black', 'Montserrat', sans-serif" fontSize="28" fontWeight="900" letterSpacing="4.5" fill="#111827">
          EDUCATIONAL INSTITUTIONS
        </text>

        <text x="0" y="94" fontFamily="'Arial Black', 'Montserrat', sans-serif" fontSize="25" fontWeight="900" letterSpacing="4" fill="#1f2937">
          SINCE 1978
        </text>
      </g>
    </svg>
  );
};

export default MeiLogo;
