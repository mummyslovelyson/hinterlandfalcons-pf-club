import React, { useEffect, useState } from 'react';

interface LogoPreloaderProps {
  /** Minimum display duration in milliseconds (default: 900) */
  minDuration?: number;
  /** Fullscreen fixed overlay or inline container */
  fullScreen?: boolean;
  /** Callback fired once preloader has completed fade out */
  onFinish?: () => void;
  /** Custom additional styling */
  className?: string;
}

export const LogoPreloader: React.FC<LogoPreloaderProps> = ({
  minDuration = 6000,
  fullScreen = true,
  onFinish,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (minDuration <= 0) {
      setIsVisible(false);
      onFinish?.();
      return;
    }

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        onFinish?.();
      }, 500); // match transition duration
      return () => clearTimeout(removeTimer);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`
        ${fullScreen ? 'fixed inset-0 z-[99999]' : 'relative w-full h-full min-h-[320px]'}
        flex items-center justify-center
        bg-[#071311] select-none pointer-events-auto
        transition-all duration-500 ease-out
        ${isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}
        ${className}
      `}
      style={{
        background: 'radial-gradient(circle at 50% 50%, #13332e 0%, #0a1c19 55%, #050d0c 100%)',
      }}
    >
      {/* Centered Logo Container */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Golden Halo Breathing Behind Logo */}
        <div
          className="absolute -inset-6 sm:-inset-8 rounded-full pointer-events-none animate-logo-glow"
          style={{
            background: 'radial-gradient(circle, rgba(215, 166, 12, 0.42) 0%, rgba(215, 166, 12, 0.12) 50%, transparent 75%)',
            filter: 'blur(16px)',
          }}
        />

        {/* Secondary Deep Pine Ring for Depth */}
        <div
          className="absolute -inset-2 rounded-full pointer-events-none opacity-60"
          style={{
            border: '1.5px solid rgba(215, 166, 12, 0.35)',
            boxShadow: '0 0 25px rgba(34, 83, 79, 0.6)',
          }}
        />

        {/* The Official Falcons Logo Alone */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl p-0.5 animate-logo-pulse">
          <img
            src="/falcons-logo.png"
            alt="Hinterland Falcons"
            className="w-full h-full object-cover rounded-full select-none pointer-events-none"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
};

export default LogoPreloader;
