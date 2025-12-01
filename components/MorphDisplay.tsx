import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileWarning } from 'lucide-react';

// Default placeholders in case no user data is provided
const DEFAULT_IMAGES = [
  "https://picsum.photos/id/10/800/800", // 1
  "https://picsum.photos/id/11/800/800", // 2
  "https://picsum.photos/id/14/800/800", // 3
  "https://picsum.photos/id/17/800/800", // 4
  "https://picsum.photos/id/20/800/800", // 5
  "https://picsum.photos/id/28/800/800", // 6
  "https://picsum.photos/id/34/800/800", // 7
  "https://picsum.photos/id/40/800/800", // 8
  "https://picsum.photos/id/56/800/800", // 9
  "https://picsum.photos/id/64/800/800", // 10
];

interface MorphDisplayProps {
  value: number; // 1-10
}

export const MorphDisplay: React.FC<MorphDisplayProps> = ({ value }) => {
  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES);
  const [isDragging, setIsDragging] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (isCustom) {
        images.forEach(url => URL.revokeObjectURL(url));
      }
    };
  }, [images, isCustom]);

  // Drag Handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Explicitly cast to File[] as Array.from on FileList might infer unknown[] or any[]
    const rawFiles = Array.from(e.dataTransfer.files) as File[];
    const files = rawFiles.filter(file => file.type.startsWith('image/'));
    
    if (files.length > 1) {
      // Sort files by name to try and respect user's sequence (image1, image2, etc.)
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      
      const newUrls = files.map(file => URL.createObjectURL(file));
      setImages(newUrls);
      setIsCustom(true);
    }
  }, []);

  const clearCustomImages = () => {
    if (isCustom) {
      images.forEach(url => URL.revokeObjectURL(url));
    }
    setImages(DEFAULT_IMAGES);
    setIsCustom(false);
  };

  // Interpolation Logic
  const calculateIndices = (val: number, totalImages: number) => {
    if (totalImages < 2) return { index1: 0, index2: 0, mix: 0 };
    
    // Normalize value from [1, 10] to [0, totalImages - 1]
    const normalized = ((val - 1) / (10 - 1)) * (totalImages - 1);
    const index1 = Math.floor(normalized);
    const index2 = Math.min(totalImages - 1, Math.ceil(normalized));
    const mix = normalized - index1;
    return { index1, index2, mix };
  };

  const { index1, index2, mix } = useMemo(() => calculateIndices(value, images.length), [value, images]);

  return (
    <div 
      className="relative w-full aspect-square max-w-xl max-h-[50vh] sm:max-h-[60vh] mx-auto group"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Container Frame */}
      <div className={`absolute -inset-4 border-2 rounded-xl z-20 pointer-events-none transition-colors duration-500 ${isDragging ? 'border-sci-accent bg-sci-accent/10' : 'border-sci-accent/30'}`}>
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sci-accent"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sci-accent"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sci-accent"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sci-accent"></div>
        
        {/* Tech Labels */}
        <div className="absolute -top-3 left-10 bg-sci-bg px-2 text-xs font-mono text-sci-accent/80">
          VIEWPORT_RENDER_TARGET
        </div>
        <div className="absolute -bottom-3 right-10 bg-sci-bg px-2 text-xs font-mono text-sci-accent/80">
          DATA_STREAM_ACTIVE
        </div>
      </div>
      
      {/* Upload/Reset Controls */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
         {isCustom && (
          <button 
            onClick={clearCustomImages}
            className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 p-2 rounded-md backdrop-blur-md transition-all text-xs font-mono flex items-center gap-2"
          >
            <X size={14} /> RESET
          </button>
         )}
         <div className="bg-sci-panel/80 border border-sci-accent/30 text-sci-accent/60 p-2 rounded-md backdrop-blur-md text-[10px] font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <Upload size={12} /> DRAG_DROP_IMG_SEQUENCE
         </div>
      </div>

      {/* Dragging Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center border-2 border-dashed border-sci-accent text-sci-accent rounded-lg"
          >
            <Upload size={48} className="mb-4 animate-bounce" />
            <p className="font-mono text-lg font-bold">INITIATE_DATA_INGESTION</p>
            <p className="font-mono text-xs opacity-70 mt-2">RELEASE TO UPLOAD SEQUENCE</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Inner Display */}
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-black shadow-[0_0_50px_rgba(0,255,157,0.1)]">
        
        {/* Base Image (Lower Index) */}
        <motion.img
          key={`img-${index1}-${isCustom ? 'c' : 'd'}`}
          src={images[index1]}
          alt="Morph Base"
          className="absolute inset-0 w-full h-full object-contain bg-black"
          style={{ opacity: 1 }}
          initial={false}
        />

        {/* Overlay Image (Upper Index) */}
        <motion.img
          key={`img-${index2}-${isCustom ? 'c' : 'd'}`}
          src={images[index2]}
          alt="Morph Overlay"
          className="absolute inset-0 w-full h-full object-contain bg-black"
          style={{ opacity: mix }}
          initial={false}
        />

        {/* FX Overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[url('https://transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

        {/* HUD Overlay */}
        <div className="absolute bottom-6 left-6 z-20 font-mono text-xs text-sci-accent">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-sci-accent rounded-full animate-pulse"></div>
               <span className="opacity-70">SOURCE_A:</span> 
               <span className="font-bold">IMG_{index1.toString().padStart(3, '0')}</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-sci-accent/50 rounded-full"></div>
               <span className="opacity-70">SOURCE_B:</span>
               <span className="font-bold">IMG_{index2.toString().padStart(3, '0')}</span>
             </div>
             <div className="mt-2 text-[10px] text-gray-400">
               INTERPOLATION_MATRIX: {(mix * 100).toFixed(1)}%
             </div>
          </div>
        </div>
        
        {/* Empty State Warning if something breaks */}
        {images.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 font-mono">
            <FileWarning size={48} className="mb-4" />
            <p>NO_DATA_AVAILABLE</p>
          </div>
        )}
      </div>
    </div>
  );
};