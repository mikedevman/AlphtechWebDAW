import React, { useRef, useState, useCallback, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  glowColor?: string;
  onChange: (val: number) => void;
}

export const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = '',
  defaultValue,
  glowColor = '#ff8400',
  onChange,
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  // Map value to angle (-135deg to +135deg => 270 deg total range)
  const normalized = (value - min) / (max - min);
  const angle = -135 + normalized * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handleDoubleClick = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 150; // pixels for full range
      const range = max - min;
      const deltaVal = (deltaY / sensitivity) * range;
      let newVal = Math.min(max, Math.max(min, startValRef.current + deltaVal));

      if (step) {
        newVal = Math.round(newVal / step) * step;
      }
      onChange(Number(newVal.toFixed(1)));
    },
    [isDragging, min, max, step, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col items-center select-none group">
      <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
        {label}
      </span>

      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className="relative w-14 h-14 rounded-full bg-gradient-to-b from-[#252b36] to-[#12151b] border-2 border-[#333c4d] shadow-lg cursor-ns-resize flex items-center justify-center transition-shadow group-hover:border-[#4b586e]"
        style={{
          boxShadow: isDragging ? `0 0 15px ${glowColor}66` : undefined,
        }}
      >
        {/* Arc Track Indicator */}
        <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke="#1b2028"
            strokeWidth="3"
            strokeDasharray="113"
            strokeDashoffset="28"
          />
          <circle
            cx="30"
            cy="30"
            r="24"
            fill="none"
            stroke={glowColor}
            strokeWidth="3.5"
            strokeDasharray="113"
            strokeDashoffset={113 - normalized * 85}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Knob Pointer */}
        <div
          className="w-10 h-10 rounded-full bg-[#181c24] border border-[#2e3745] relative flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div
            className="w-1 h-3 rounded-full absolute top-1 shadow-sm"
            style={{ backgroundColor: glowColor, boxShadow: `0 0 6px ${glowColor}` }}
          />
        </div>
      </div>

      {/* Value Display */}
      <span className="text-xs font-mono font-medium text-slate-300 mt-1.5 bg-[#14171e] px-1.5 py-0.5 rounded border border-[#252b36]">
        {value > 0 && unit.includes('dB') ? `+${value}` : value}
        <span className="text-[10px] text-slate-500 ml-0.5">{unit}</span>
      </span>
    </div>
  );
};
