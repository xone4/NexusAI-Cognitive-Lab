import React, { memo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import type { QualiaVector } from '../types';
import { BrainCircuitIcon } from './Icons';

interface QualiaVectorVisualizerProps {
  activeVector: QualiaVector | null;
  onUpdate: (vector: QualiaVector) => void;
  isInteractionDisabled: boolean;
}

const QualiaVectorVisualizer: React.FC<QualiaVectorVisualizerProps> = ({ activeVector, onUpdate, isInteractionDisabled }) => {

  const defaultVector: QualiaVector = {
    valence: 0,
    arousal: 0.1,
    dominance: 0.5,
    novelty: 0,
    complexity: 0.1,
    temporality: 0,
  };

  const vector = activeVector || defaultVector;

  const data = [
    { subject: 'Valence', value: vector.valence, fullMark: 1, range: [-1, 1] },
    { subject: 'Arousal', value: vector.arousal, fullMark: 1, range: [0, 1] },
    { subject: 'Dominance', value: vector.dominance, fullMark: 1, range: [0, 1] },
    { subject: 'Novelty', value: vector.novelty, fullMark: 1, range: [0, 1] },
    { subject: 'Complexity', value: vector.complexity, fullMark: 1, range: [0, 1] },
    { subject: 'Temporality', value: vector.temporality, fullMark: 1, range: [-1, 1] },
  ];

  // For recharts, we need to normalize data to be always positive for display.
  // We'll handle the real values in the tooltip.
  const displayData = data.map(d => ({
      ...d,
      displayValue: d.range[0] === -1 ? (d.value + 1) / 2 : d.value
  }));


  if (!activeVector) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted p-4">
        <BrainCircuitIcon className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-semibold">Qualia State Dormant</p>
        <p className="text-sm">The AI's internal state is neutral. Abstract or emotional queries will activate this space.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData}>
        <defs>
            <radialGradient id="qualiaGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00aaff" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#00aaff" stopOpacity={0}/>
            </radialGradient>
        </defs>
        <PolarGrid stroke="#ffffff2a" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0a0a0', fontSize: 13 }} />
        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
        <Radar 
            name="Qualia State" 
            dataKey="displayValue" 
            stroke="#00e5ff" 
            fill="url(#qualiaGradient)" 
            fillOpacity={0.6} 
            strokeWidth={2}
        />
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(10, 15, 31, 0.9)',
                borderColor: '#18213a',
                borderRadius: '0.5rem',
                backdropFilter: 'blur(5px)',
            }}
            labelStyle={{ color: '#e0e0e0' }}
            formatter={(value, name, props) => {
                // Find original data point to show the real value
                const originalPoint = data.find(d => d.subject === props.payload.subject);
                return [`${originalPoint?.value.toFixed(2)}`, `${originalPoint?.subject}`];
            }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default memo(QualiaVectorVisualizer);