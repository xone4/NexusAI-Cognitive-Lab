import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PerformanceDataPoint } from '../types';

interface PerformanceChartsProps {
  data: PerformanceDataPoint[];
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ data }) => {
  const { t } = useTranslation();
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-nexus-text-muted">{t('performanceCharts.initializing')}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 80, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
        <XAxis dataKey="time" stroke="#a0a0a0" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
        <YAxis yAxisId="left" stroke="#00e5ff" tick={{ fill: '#00e5ff', fontSize: 12 }} unit="%" domain={[0, 100]} />
        <YAxis yAxisId="right" orientation="right" stroke="#ff00aa" tick={{ fill: '#ff00aa', fontSize: 12 }} unit="c/s" />
        <YAxis yAxisId="ms" orientation="right" stroke="#facc15" tick={{ fill: '#facc15', fontSize: 12 }} unit="ms" domain={[0, 'dataMax + 10']} style={{ transform: 'translateX(50px)' }} />

        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(10, 15, 31, 0.8)',
                borderColor: '#18213a',
                borderRadius: '0.75rem',
                backdropFilter: 'blur(5px)',
            }}
            labelStyle={{ color: '#e0e0e0' }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}} />
        <Line yAxisId="left" type="monotone" dataKey="cpu" name={t('replicas.processingCycles')} stroke="#00aaff" strokeWidth={2} dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="memory" name={t('replicas.contextUtilization')} stroke="#00e5ff" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="rsiCycles" name={t('performanceCharts.rsiCycles')} stroke="#ff00aa" strokeWidth={2} dot={false} />
        
        <Line yAxisId="ms" type="monotone" dataKey="networkLatency" name={t('performanceCharts.networkLatency')} stroke="#facc15" strokeWidth={2} dot={false} />
        <Line yAxisId="ms" type="monotone" dataKey="renderTime" name={t('performanceCharts.renderTime')} stroke="#4ade80" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default memo(PerformanceCharts);