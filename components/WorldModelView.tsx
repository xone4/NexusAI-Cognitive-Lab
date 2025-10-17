import React, { useState, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorldModel, WorldModelEntity } from '../types';
import DashboardCard from './DashboardCard';
import { DicesIcon, BrainCircuitIcon, CubeTransparentIcon } from './Icons';

interface WorldModelViewProps {
  worldModel: WorldModel | null;
}

interface Node {
    id: string;
    name: string;
    type: WorldModelEntity['type'];
    x: number;
    y: number;
}

interface Link {
    source: string;
    target: string;
    strength: number;
}

const entityColors: Record<WorldModelEntity['type'], string> = {
    'CONCEPT': '#ff00aa', // nexus-accent
    'PERSON': '#facc15', // yellow-400
    'PLACE': '#4ade80', // green-400
    'OBJECT': '#60a5fa', // blue-400
    'EVENT': '#f97316', // orange-400
    'ORGANIZATION': '#a78bfa', // purple-400
};


const WorldModelView: React.FC<WorldModelViewProps> = ({ worldModel }) => {
  const { t } = useTranslation();
  const [selectedEntity, setSelectedEntity] = useState<WorldModelEntity | null>(null);

  const { nodes, links } = useMemo(() => {
    if (!worldModel) return { nodes: [], links: [] };

    const generatedNodes: Node[] = [];
    const generatedLinks: Link[] = [];

    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const angleStep = worldModel.entities.length > 0 ? (2 * Math.PI) / worldModel.entities.length : 0;

    worldModel.entities.forEach((entity, i) => {
        const angle = angleStep * i;
        generatedNodes.push({
            id: entity.id,
            name: entity.name,
            type: entity.type,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        });
    });

    const nodeMap = new Map(generatedNodes.map(n => [n.id, n]));
    worldModel.relationships.forEach(rel => {
        if (nodeMap.has(rel.sourceId) && nodeMap.has(rel.targetId)) {
            generatedLinks.push({
                source: rel.sourceId,
                target: rel.targetId,
                strength: rel.strength,
            });
        }
    });

    return { nodes: generatedNodes, links: generatedLinks };
  }, [worldModel]);

  const handleEntityClick = (entity: WorldModelEntity) => {
    setSelectedEntity(entity);
  };
  
  if (!worldModel) {
    return (
        <div className="flex items-center justify-center h-full text-nexus-text-muted">
            <div className="w-16 h-16 mb-4 relative"><div className="nexus-loader"></div></div>
            Initializing World Model...
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Panel: Principles & Entities */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <DashboardCard title={t('worldModel.corePrinciples')} icon={<BrainCircuitIcon />} className="flex-shrink-0">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {worldModel.principles.length > 0 ? worldModel.principles.map(p => (
                <div key={p.id} className="bg-nexus-dark/50 p-2 rounded-lg text-sm italic">
                    <p className="text-nexus-text-muted">"{p.statement}"</p>
                    <p className="text-right text-xs text-nexus-primary font-mono">Conf: {(p.confidence * 100).toFixed(0)}%</p>
                </div>
            )) : <p className="text-sm text-nexus-text-muted text-center">{t('worldModel.noPrinciples')}</p>}
          </div>
        </DashboardCard>
        <DashboardCard title={t('worldModel.keyEntities')} icon={<CubeTransparentIcon />} className="flex-grow min-h-0">
          <div className="space-y-2 h-full overflow-y-auto pr-2">
             {worldModel.entities.length > 0 ? worldModel.entities.map(e => (
                <div key={e.id} onClick={() => handleEntityClick(e)} className="bg-nexus-dark/50 p-2 rounded-lg cursor-pointer hover:bg-nexus-primary/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entityColors[e.type] }}></div>
                    <span className="text-sm font-semibold text-nexus-text truncate">{e.name}</span>
                </div>
             )) : <p className="text-sm text-nexus-text-muted text-center">{t('worldModel.noEntities')}</p>}
          </div>
        </DashboardCard>
      </div>
      
      {/* Right Panel: Graph and Details */}
      <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
        <DashboardCard title={t('worldModel.title')} icon={<DicesIcon />} fullHeight className="flex-grow">
          <svg width="100%" height="100%" viewBox="0 0 800 600">
             <defs>
                <filter id="glow-entity" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {/* Links */}
            <g>
                {links.map((link, i) => {
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const targetNode = nodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    const isHighlighted = selectedEntity && (link.source === selectedEntity.id || link.target === selectedEntity.id);

                    return (
                        <line
                            key={i}
                            x1={sourceNode.x} y1={sourceNode.y}
                            x2={targetNode.x} y2={targetNode.y}
                            stroke={isHighlighted ? "#ff00aa" : "#00aaff"}
                            strokeWidth={isHighlighted ? 2 : 0.5 + link.strength * 1.5}
                            strokeOpacity={isHighlighted ? 0.9 : 0.2 + link.strength * 0.5}
                            className="transition-all duration-300"
                        />
                    );
                })}
            </g>
            {/* Nodes */}
            <g>
                {nodes.map(node => {
                    const entity = worldModel.entities.find(e => e.id === node.id);
                    if (!entity) return null;
                    const isSelected = selectedEntity?.id === node.id;
                    const isConnected = selectedEntity && links.some(l => (l.source === node.id && l.target === selectedEntity.id) || (l.target === node.id && l.source === selectedEntity.id));
                    return (
                        <g key={node.id} transform={`translate(${node.x},${node.y})`} onClick={() => handleEntityClick(entity)} className="cursor-pointer group">
                             {/* FIX: Corrected invalid JSX syntax for the title attribute. */}
                             <title>{`${node.name} (type: ${node.type})`}</title>
                            <circle
                                r={isSelected ? 10 : 6}
                                fill={entityColors[node.type]}
                                stroke={isSelected ? "white" : entityColors[node.type]}
                                strokeWidth="2"
                                opacity={!selectedEntity || isSelected || isConnected ? 1 : 0.3}
                                className="transition-all duration-300"
                                style={{ filter: isSelected ? 'url(#glow-entity)' : 'none' }}
                            />
                            <text
                                x="12" y="5"
                                fontSize="12"
                                fill="white"
                                className="pointer-events-none transition-all duration-300"
                                style={{ opacity: isSelected || (!selectedEntity && nodes.length < 20) ? 1 : 0, transitionDelay: isSelected ? '150ms' : '0ms' }}
                            >{node.name}</text>
                        </g>
                    );
                })}
            </g>
          </svg>
        </DashboardCard>

        {selectedEntity && (
          <DashboardCard title={t('worldModel.entityDetails')} icon={<CubeTransparentIcon/>} className="flex-shrink-0 animate-spawn-in" isCollapsible={false}>
            <div className="space-y-2">
                <h4 className="text-lg font-bold text-nexus-primary">{selectedEntity.name}</h4>
                <p className="text-sm text-nexus-text-muted">{t('worldModel.type')}: <span className="font-semibold" style={{ color: entityColors[selectedEntity.type] }}>{selectedEntity.type}</span></p>
                <p className="text-sm text-nexus-text-muted italic">"{selectedEntity.summary}"</p>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
};

export default memo(WorldModelView);