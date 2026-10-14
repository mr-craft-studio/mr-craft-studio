import React, { useState, useEffect } from 'react';

/**
 * Page Reading Progress Bar
 * Fixed at the very top of the viewport.
 * Dynamically fills from 0% to 100% as the visitor scrolls down the page.
 */
export const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let ticking = false;

    const computeProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;

      if (maxScroll <= 0) {
        setProgress(0);
        return;
      }

      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const rawPercent = (currentScroll / maxScroll) * 100;
      const clamped = Math.min(100, Math.max(0, rawPercent));
      setProgress(clamped);
    };

    const handleScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          computeProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    computeProgress();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Page Reading Progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none select-none bg-white/[0.04]"
    >
      {/* Animated Fill Bar */}
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-300 transition-[width] duration-75 ease-out relative shadow-[0_0_10px_rgba(52,211,153,0.5)]"
        style={{ width: `${progress}%` }}
      >
        {/* Glowing Head Point */}
        {progress > 0 && progress < 100 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#34d399,0_0_12px_#fbbf24] opacity-90" />
        )}
      </div>
    </div>
  );
};
