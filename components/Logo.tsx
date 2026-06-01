import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 48 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]"
      >
        <defs>
          <radialGradient id="logo_inner_glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(40)">
            <stop stopColor="#2dd4bf" stopOpacity="0.4" />
            <stop offset="1" stopColor="#080b14" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="logo_main_grad" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f8fafc" />
            <stop offset="0.5" stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>

          <filter id="soft_glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ondas de Ressonância (Anéis) */}
        <circle cx="50" cy="50" r="46" stroke="#2dd4bf" strokeWidth="0.25" strokeOpacity="0.2">
          <animate attributeName="r" values="44;48;44" dur="8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="8s" repeatCount="indefinite" />
        </circle>
        
        <circle cx="50" cy="50" r="38" stroke="#2dd4bf" strokeWidth="0.5" strokeOpacity="0.3">
          <animate attributeName="r" values="36;40;36" dur="6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* Brilho de Fundo */}
        <circle cx="50" cy="50" r="30" fill="url(#logo_inner_glow)" />

        {/* Símbolo Central: A Gota de Voz */}
        <path
          d="M50 22C50 22 75 48 75 62C75 75.8 63.8 87 50 87C36.2 87 25 75.8 25 62C25 48 50 22 50 22Z"
          fill="url(#logo_main_grad)"
          filter="url(#soft_glow)"
        >
          <animate
            attributeName="d"
            values="M50 22C50 22 75 48 75 62C75 75.8 63.8 87 50 87C36.2 87 25 75.8 25 62C25 48 50 22 50 22Z;
                    M50 24C50 24 73 49 73 62C73 74 62.5 85 50 85C37.5 85 27 74 27 62C27 49 50 24 50 24Z;
                    M50 22C50 22 75 48 75 62C75 75.8 63.8 87 50 87C36.2 87 25 75.8 25 62C25 48 50 22 50 22Z"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        {/* O Ponto de Consciência */}
        <circle cx="50" cy="65" r="4" fill="white">
          <animate attributeName="r" values="3;5;3" dur="4s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default Logo;