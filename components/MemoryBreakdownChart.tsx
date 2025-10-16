import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MemoryBreakdownChartProps {
  data: {
    replicas: number;
    tools: number;
    system: number;
  };
}

const COLORS = {
  replicas: '#00aaff', // nexus-primary
  tools: '#00e5ff',    // nexus-secondary
  system: '#ff00aa',   // nexus-accent
};

const MemoryBreakdownChart: React.FC<MemoryBreakdownChartProps> = ({ data }) => {
  const { t } = useTranslation();
  if (!data) {
    return null;
  }

  const chartData = [
    { key: 'replicas', name: t('vitals.replicas'), value: data.replicas },
    { key: 'tools', name: t('vitals.tools'), value: data.tools },
    { key: 'system', name: t('vitals.system'), value: data.system },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="40%"
          labelLine={false}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(10, 15, 31, 0.8)',
                borderColor: '#18213a',
                borderRadius: '0.75rem',
                backdropFilter: 'blur(5px)',
            }}
            labelStyle={{ color: '#e0e0e0' }}
            formatter={(value: number) => `${value.toFixed(2)}%`}
        />
        <Legend wrapperStyle={{fontSize: "12px", bottom: 0}}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default memo(MemoryBreakdownChart);