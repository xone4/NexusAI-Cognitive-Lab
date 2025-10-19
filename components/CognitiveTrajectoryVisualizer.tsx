import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import type { CognitiveTrajectory } from '../types';
import DashboardCard from './DashboardCard';
import { TrajectoryIcon, BrainCircuitIcon } from './Icons';

interface CognitiveTrajectoryVisualizerProps {
    trajectory: CognitiveTrajectory;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-nexus-surface/90 backdrop-blur-sm p-3 rounded-xl border border-nexus-primary/50 text-xs shadow-lg">
                <p className="font-bold text-nexus-primary">Step {data.step}</p>
                <p className="text-nexus-text mt-1 max-w-xs break-words">{data.thought}</p>
                <div className="mt-2 pt-2 border-t border-nexus-surface">
                    <p className="text-nexus-text-muted">Velocity: <span className="font-mono text-nexus-secondary">{data.velocity.toFixed(4)}</span></p>
                    <p className="text-nexus-text-muted">Curvature: <span className="font-mono text-nexus-accent">{data.curvature.toFixed(4)}</span></p>
                </div>
            </div>
        );
    }
    return null;
};


const CognitiveTrajectoryVisualizer: React.FC<CognitiveTrajectoryVisualizerProps> = ({ trajectory }) => {
    const { t } = useTranslation();
    const { summary, steps } = trajectory;

    const chartData = useMemo(() => {
        return steps.map(step => ({
            step: step.step,
            x: step.position[0],
            y: step.position[1],
            velocity: step.velocity,
            curvature: step.curvature,
            thought: step.thought,
        }));
    }, [steps]);

    return (
        <div className="space-y-4">
            <DashboardCard title={t('traceInspector.trajectorySummary')} icon={<TrajectoryIcon />}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div><p className="text-xs text-nexus-text-muted">{t('traceInspector.avgVelocity')}</p><p className="text-lg font-bold text-nexus-primary">{summary.avgVelocity.toFixed(4)}</p></div>
                    <div><p className="text-xs text-nexus-text-muted">{t('traceInspector.avgCurvature')}</p><p className="text-lg font-bold text-nexus-secondary">{summary.avgCurvature.toFixed(4)}</p></div>
                    <div><p className="text-xs text-nexus-text-muted">{t('traceInspector.maxCurvature')}</p><p className="text-lg font-bold text-nexus-accent">{summary.maxCurvature.toFixed(4)}</p></div>
                    <div><p className="text-xs text-nexus-text-muted">{t('traceInspector.pathLength')}</p><p className="text-lg font-bold text-nexus-text">{summary.pathLength}</p></div>
                    <div><p className="text-xs text-nexus-text-muted">{t('traceInspector.totalDistance')}</p><p className="text-lg font-bold text-nexus-text">{summary.totalDistance.toFixed(4)}</p></div>
                </div>
            </DashboardCard>

            <DashboardCard title={t('traceInspector.trajectoryPlot')} icon={<TrajectoryIcon />} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <XAxis type="number" dataKey="x" name="Dim 1" domain={['auto', 'auto']} hide />
                        <YAxis type="number" dataKey="y" name="Dim 2" domain={['auto', 'auto']} hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Line dataKey="y" type="monotone" stroke="#00aaff" strokeWidth={1} dot={false} isAnimationActive={false} name="Path" />
                        <Scatter name="Cognitive Steps" data={chartData} fill="#00e5ff" shape="circle" />
                    </ScatterChart>
                </ResponsiveContainer>
            </DashboardCard>
            
            <DashboardCard title={t('traceInspector.trajectorySteps')} icon={<BrainCircuitIcon />}>
                <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-nexus-text-muted uppercase bg-nexus-dark/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">{t('traceInspector.step')}</th>
                                <th className="px-4 py-2">{t('traceInspector.thought')}</th>
                                <th className="px-4 py-2 text-right">{t('traceInspector.velocity')}</th>
                                <th className="px-4 py-2 text-right">{t('traceInspector.curvature')}</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {trajectory.steps.map(step => (
                                <tr key={step.step} className="border-b border-nexus-surface/50 hover:bg-nexus-surface/30">
                                    <td className="px-4 py-2 font-semibold text-nexus-text">{step.step}</td>
                                    <td className="px-4 py-2 text-nexus-text">{step.thought}</td>
                                    <td className="px-4 py-2 text-right text-nexus-secondary">{step.velocity.toFixed(4)}</td>
                                    <td className="px-4 py-2 text-right text-nexus-accent">{step.curvature.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DashboardCard>
        </div>
    );
};

export default CognitiveTrajectoryVisualizer;
