import React, { useEffect, useRef, memo } from 'react';
import type { LogEntry } from '../types';

interface LogStreamProps {
  logs: LogEntry[];
}

const levelColors: Record<LogEntry['level'], string> = {
    INFO: 'text-nexus-secondary',
    WARN: 'text-yellow-400',
    ERROR: 'text-red-500',
    SYSTEM: 'text-nexus-accent',
    REPLICA: 'text-nexus-primary',
    AI: 'text-purple-400',
    NETWORK: 'text-cyan-400',
};

const LogItem = memo(({ log }: { log: LogEntry }) => (
    <div className="flex items-start">
      <span className="text-nexus-text-muted mr-3">
        {new Date(log.timestamp).toLocaleTimeString()}
      </span>
      <span className={`font-bold w-16 ${levelColors[log.level]}`}>
        [{log.level}]
      </span>
      <span className="flex-1 text-nexus-text whitespace-pre-wrap break-words">{log.message}</span>
    </div>
));

const LogStream: React.FC<LogStreamProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
        // Only auto-scroll if user is near the bottom, respecting user's scroll position
        const isScrolledToBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 50;
        if (isScrolledToBottom) {
            element.scrollTop = element.scrollHeight;
        }
    }
  }, [logs]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto bg-nexus-dark/50 rounded-xl p-3 font-mono text-xs">
      {logs.map(log => (
        <LogItem key={log.id} log={log} />
      ))}
    </div>
  );
};

export default memo(LogStream);