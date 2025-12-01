import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogEntry } from '../types';
import { Terminal, Cpu, Radio } from 'lucide-react';

interface DataLogProps {
  logs: LogEntry[];
}

export const DataLog: React.FC<DataLogProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-80 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {logs.slice(-5).map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className="pointer-events-auto bg-sci-glass backdrop-blur-md border border-sci-dim rounded-md p-3 text-xs font-mono shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1 text-sci-accent/70 border-b border-sci-dim pb-1">
              <div className="flex items-center gap-2">
                {log.source === 'GEMINI' ? <Cpu size={12} /> : log.source === 'SYSTEM' ? <Terminal size={12} /> : <Radio size={12} />}
                <span className="font-bold tracking-wider">{log.source}</span>
              </div>
              <span>{log.timestamp}</span>
            </div>
            <div className="text-gray-300 break-words">
              {log.message}
            </div>
            {log.data && (
              <pre className="mt-2 p-1 bg-black/50 rounded text-[10px] text-green-400 overflow-x-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
