import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ScientificSliderProps {
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
}

export const ScientificSlider: React.FC<ScientificSliderProps> = ({ value, onChange, min, max, step }) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  
  // Motion value for smooth interpolation
  const x = useMotionValue(0);
  
  // Measure track width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Map value to percentage string for display
  const widthPercent = useTransform(x, (latest) => {
    if (trackWidth === 0) return '0%';
    const p = (latest / trackWidth) * 100;
    return `${Math.min(100, Math.max(0, p))}%`;
  });

  // Sync internal motion value when prop `value` changes externally (e.g. from Gemini)
  useEffect(() => {
    if (trackWidth > 0) {
      const range = max - min;
      const progress = (value - min) / range;
      const targetX = progress * trackWidth;
      
      // Animate the slider handle smoothly to the new position
      animate(x, targetX, {
        type: "spring",
        stiffness: 80,
        damping: 15,
        mass: 0.8
      });
    }
  }, [value, min, max, trackWidth, x]);

  const handleDrag = (event: any, info: any) => {
    if (trackWidth > 0) {
      const currentX = x.get();
      const progress = Math.max(0, Math.min(1, currentX / trackWidth));
      const newValue = min + progress * (max - min);
      onChange(newValue);
    }
  };

  return (
    <div className="w-full relative group py-8 select-none">
      {/* Ruler Marks */}
      <div className="flex justify-between w-full px-1 mb-2 text-xs font-mono text-gray-500 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className={`text-[10px] font-bold ${ (i+1) <= value ? 'text-sci-accent' : 'text-gray-600' } transition-colors duration-300`}>{i + 1}</span>
            <div className={`w-[2px] ${ (i+1) % 5 === 0 ? 'h-3 bg-sci-accent/50' : 'h-1.5 bg-gray-700'}`}></div>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
            <span className={`text-[10px] font-bold ${ value >= 10 ? 'text-sci-accent' : 'text-gray-600' }`}>10</span>
            <div className="h-3 w-[2px] bg-sci-accent/50"></div>
          </div>
      </div>

      <div className="relative h-16 flex items-center" ref={constraintsRef}>
        {/* Track Background - High Visibility */}
        <div ref={trackRef} className="absolute w-full h-8 bg-gray-800 rounded-full overflow-hidden border border-gray-600 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
           {/* Grid Pattern in Track */}
           <div className="absolute inset-0 opacity-20 w-full h-full" 
                style={{backgroundImage: 'linear-gradient(90deg, transparent 98%, rgba(255,255,255,0.2) 98%)', backgroundSize: '20px 100%'}}>
           </div>
        </div>

        {/* Active Fill - Neon Glow */}
        <motion.div 
          className="absolute h-8 bg-sci-accent shadow-[0_0_20px_rgba(0,255,157,0.6)] rounded-l-full"
          style={{ width: widthPercent }}
        />
        
        {/* Fill Gradient Overlay */}
        <motion.div 
          className="absolute h-8 bg-gradient-to-b from-white/30 to-transparent rounded-l-full z-10"
          style={{ width: widthPercent }}
        />

        {/* Draggable Thumb - Large Control Puck */}
        <motion.div
          drag="x"
          dragConstraints={trackRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{ x }}
          className="absolute top-1/2 -mt-10 -ml-8 w-16 h-20 flex items-center justify-center cursor-grab active:cursor-grabbing z-30"
        >
          {/* Puck Visuals */}
          <div className="relative w-12 h-16 bg-zinc-900 border-[3px] border-sci-accent rounded-lg shadow-[0_0_40px_rgba(0,255,157,0.5)] flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-200">
             
             {/* Glowing Center */}
             <div className="absolute inset-0 bg-sci-accent/10 animate-pulse"></div>

             {/* Grip Texture */}
             <div className="flex flex-col gap-1.5 z-10 w-full px-3">
               <div className="w-full h-[2px] bg-sci-accent shadow-[0_0_5px_#00ff9d]"></div>
               <div className="w-full h-[2px] bg-sci-accent shadow-[0_0_5px_#00ff9d]"></div>
               <div className="w-full h-[2px] bg-sci-accent shadow-[0_0_5px_#00ff9d]"></div>
             </div>
             
             {/* Value Indicator Bubble */}
             <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black border border-sci-accent text-sci-accent px-3 py-1.5 rounded text-lg font-bold font-mono shadow-[0_0_15px_rgba(0,255,157,0.3)] whitespace-nowrap">
               {value.toFixed(1)}
               {/* Arrow */}
               <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-sci-accent rotate-45 border-b border-r border-black"></div>
             </div>
          </div>
        </motion.div>
      </div>
      
      {/* Track Gloss Reflection */}
      <div className="absolute top-1/2 mt-4 left-0 w-full h-[1px] bg-white/5 pointer-events-none"></div>
    </div>
  );
};