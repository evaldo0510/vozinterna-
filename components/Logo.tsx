import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  emotionalState?: string;
}

const getColorForState = (state?: string) => {
  if (!state) return '#2dd4bf';
  const s = state.toLowerCase();
  if (s.includes('low') || s.includes('sad') || s.includes('heavy') || s.includes('triste') || s.includes('pesado') || s.includes('melanc')) {
    return '#3b82f6'; // Blue / Melancólico
  }
  if (s.includes('anx') || s.includes('accel') || s.includes('anxio') || s.includes('angr') || s.includes('raiv') || s.includes('irrit')) {
    return '#f97316'; // Orange/Amber / Ansioso
  }
  if (s.includes('flow') || s.includes('peace') || s.includes('seren') || s.includes('paz')) {
    return '#06b6d4'; // Cyan / Sereno
  }
  if (s.includes('align') || s.includes('hope') || s.includes('need') || s.includes('conec') || s.includes('esper')) {
    return '#ec4899'; // Pink/Magenta / Alinhado
  }
  return '#2dd4bf'; // Default Teal
};

const Logo: React.FC<LogoProps> = ({ className = "", size = 48, emotionalState }) => {
  const activeColor = getColorForState(emotionalState);
  const gradId = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id={`logo_inner_glow_${gradId}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(40)">
            <stop stopColor={activeColor} stopOpacity="0.4" />
            <stop offset="1" stopColor="#080b14" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id={`logo_main_grad_${gradId}`} x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f8fafc" />
            <stop offset="0.5" stopColor={activeColor} />
            <stop offset="1" stopColor={activeColor} />
          </linearGradient>

          <filter id={`soft_glow_${gradId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ondas de Ressonância (Anéis) */}
        <circle cx="50" cy="50" r="46" stroke={activeColor} strokeWidth="0.25" strokeOpacity="0.2">
          <animate attributeName="r" values="44;48;44" dur="8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="8s" repeatCount="indefinite" />
        </circle>
        
        <circle cx="50" cy="50" r="38" stroke={activeColor} strokeWidth="0.5" strokeOpacity="0.3">
          <animate attributeName="r" values="36;40;36" dur="6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* Brilho de Fundo */}
        <circle cx="50" cy="50" r="30" fill={`url(#logo_inner_glow_${gradId})`} />

        {/* Símbolo Central: A Gota de Voz */}
        <path
          d="M50 22C50 22 75 48 75 62C75 75.8 63.8 87 50 87C36.2 87 25 75.8 25 62C25 48 50 22 50 22Z"
          fill={`url(#logo_main_grad_${gradId})`}
          filter={`url(#soft_glow_${gradId})`}
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