'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bug, X, Trash2, Copy, Terminal, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  type: 'log' | 'warn' | 'error';
  content: string;
  timestamp: string;
}

export default function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hasNewLogs, setHasNewLogs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore logs from session to survive redirects
    const stored = sessionStorage.getItem('chocket_debug_logs');
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (type: 'log' | 'warn' | 'error', ...args: any[]) => {
      const content = args.map(arg => {
        try {
          if (arg && typeof arg === 'object') {
            const str = JSON.stringify(arg, (key, value) => {
              if (key === '_owner' || key === '$$typeof') return '[ReactElement]';
              return value;
            }, 2);
            return str.length > 1000 ? str.substring(0, 1000) + '... [LOG TRUNCATED]' : str;
          }
          return String(arg);
        } catch (e) {
          return '[Unserializable Object]';
        }
      }).join(' ');

      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(7),
        type,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      // Use queueMicrotask to ensure we don't update state during a render phase
      queueMicrotask(() => {
        setLogs(prev => {
          const updated = [...prev.slice(-100), newLog];
          try {
            sessionStorage.setItem('chocket_debug_logs', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        if (!isOpen) setHasNewLogs(true);
      });
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };
    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };
    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };

    // Catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      if (event.error) {
         addLog('error', `UNCAUGHT: ${event.error.message}\n${event.error.stack}`);
      } else {
         addLog('error', `UNCAUGHT: ${event.message}`);
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      window.removeEventListener('error', handleError);
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
    setHasNewLogs(false);
    sessionStorage.removeItem('chocket_debug_logs');
  };

  const copyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.content}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Logs copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy logs');
    });
  };

  const openConsole = () => {
    setIsOpen(true);
    setHasNewLogs(false);
  };

  return (
    <>
      <button
        onClick={openConsole}
        className="fixed bottom-24 right-6 z-[9999] w-12 h-12 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border border-white/20"
        title="Debug Logs"
      >
        <Bug className={`w-5 h-5 ${hasNewLogs ? 'animate-bounce' : ''}`} />
        {hasNewLogs && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-4 md:inset-x-auto md:right-6 md:bottom-36 md:w-[500px] md:h-[600px] bg-[#0D0705] border border-[#3E2723] rounded-3xl shadow-2xl z-[10000] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#1A0F0B] border-b border-[#3E2723] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFF3E0]">System Monitor</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={copyLogs} className="p-2 hover:bg-white/5 rounded-lg text-[#FFF3E0]/40 transition-all" title="Copy Logs">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={clearLogs} className="p-2 hover:bg-white/5 rounded-lg text-red-500/60 transition-all" title="Clear Logs">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-[#3E2723] mx-1" />
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-[#FFF3E0]/40 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logs List */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-2 selection:bg-[#D4AF37]/20"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                  <Terminal className="w-12 h-12 mb-4" />
                  <p className="uppercase tracking-widest text-[10px]">No logs recorded yet</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-2 group border-b border-white/5 pb-1">
                    <span className="text-[#FFF3E0]/20 shrink-0 select-none">{log.timestamp}</span>
                    <span className={`shrink-0 select-none font-bold ${
                      log.type === 'error' ? 'text-red-500' : 
                      log.type === 'warn' ? 'text-amber-500' : 'text-blue-400'
                    }`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <pre className="whitespace-pre-wrap break-all text-[#FFF3E0]/80">{log.content}</pre>
                  </div>
                ))
              )}
            </div>

            {/* Footer Status */}
            <div className="p-2 px-4 bg-[#0D0705] border-t border-[#3E2723] flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter text-[#FFF3E0]/20 italic">
               <div className="flex items-center gap-2">
                 <AlertCircle className="w-3 h-3" />
                 <span>Screenshot this for technical support</span>
               </div>
               <span>Total: {logs.length} entries</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
