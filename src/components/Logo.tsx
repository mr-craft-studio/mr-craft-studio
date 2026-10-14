import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Minimal geometric MR. CRAFT logo mark matching Atelier Unit's architectural precision */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-500 hover:rotate-90"
      >
        {/* Outer square frame */}
        <rect
          x="2.5"
          y="2.5"
          width="27"
          height="27"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        {/* Geometric craft cross & diagonal diamond accents */}
        <line
          x1="2.5"
          y1="16"
          x2="29.5"
          y2="16"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
        <line
          x1="16"
          y1="2.5"
          x2="16"
          y2="29.5"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
        {/* Solid center square nucleus */}
        <rect
          x="12"
          y="12"
          width="8"
          height="8"
          fill="#ffffff"
        />
      </svg>
      <div className="flex flex-col">
        <span className="font-semibold tracking-[0.22em] text-[13px] leading-tight text-white uppercase font-mono">
          MR. CRAFT
        </span>
        <span className="text-[9px] tracking-[0.35em] text-white/50 uppercase">
          STUDIO
        </span>
      </div>
    </div>
  );
};
