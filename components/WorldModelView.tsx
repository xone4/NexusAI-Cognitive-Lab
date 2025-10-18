import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorldModel, WorldModelEntity, WorldModelEntityType, WorldModelPrinciple } from '../types';
import DashboardCard from './DashboardCard';
import { DicesIcon, BrainCircuitIcon, CubeTransparentIcon, SaveIcon, XCircleIcon } from './Icons';

interface WorldModelViewProps {
  worldModel: WorldModel | null;
  onUpdateEntity: (entity: WorldModelEntity) => void;
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

const EntityEditorPanel: React.FC<{
  entity: WorldModelEntity;
  onSave: (entity: WorldModelEntity) => void;
  onCancel: () => void;
}> = memo(({ entity, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(entity.name);
  const [type, setType] = useState<WorldModelEntityType>(entity.type);
  const [summary, setSummary] = useState(entity.summary);
  const [propertiesString, setPropertiesString] = useState(() => JSON.stringify(entity.properties, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Keep editor in sync if the selected entity changes from outside
  useEffect(() => {
    setName(entity.name);
    setType(entity.type);
    setSummary(entity.summary);
    setPropertiesString(JSON.stringify(entity.properties, null, 2));
    setJsonError(null);
  }, [entity]);


  const entityTypes: WorldModelEntityType[] = ['CONCEPT', 'PERSON', 'PLACE', 'OBJECT', 'EVENT', 'ORGANIZATION'];

  const handlePropertiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPropertiesString(e.target.value);
    try {
      JSON.parse(e.target.value);
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON format.');
    }
  };
  
  const handleSave = () => {
    if (jsonError) {
      alert('Cannot save: Properties field contains invalid JSON.');
      return;
    }
    onSave({
      ...entity,
      name,
      type,
      summary,
      properties: JSON.parse(propertiesString)
    });
  };
  
  return (
    <DashboardCard title={t('worldModel.entityDetails')} icon={<CubeTransparentIcon/>} className="flex-shrink-0 animate-spawn-in" isCollapsible={false}>
      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text"/>
        </div>
        {/* Type */}
        <div>
          <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">Type</label>
          <select value={type} onChange={e => setType(e.target.value as WorldModelEntityType)} className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text">
            {entityTypes.map(et => <option key={et} value={et}>{et}</option>)}
          </select>
        </div>
        {/* Summary */}
        <div>
          <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">Summary</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none"/>
        </div>
        {/* Properties */}
        <div>
          <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">Properties (JSON)</label>
          <textarea value={propertiesString} onChange={handlePropertiesChange} rows={4} className={`w-full mt-1 p-2 bg-nexus-dark/70 border rounded-xl focus:outline-none focus:ring-2 text-nexus-text font-mono text-sm resize-y ${jsonError ? 'border-red-500 focus:ring-red-500' : 'border-nexus-surface focus:ring-nexus-primary'}`}/>
          {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
        </div>
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
            <button onClick={onCancel} className="flex items-center gap-2 py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark text-sm font-semibold">
                <XCircleIcon className="w-5 h-5"/> Cancel
            </button>
            <button onClick={handleSave} disabled={!!jsonError} className="flex items-center gap-2 py-2 px-4 rounded-full bg-nexus-primary text-nexus-dark text-sm font-bold hover:bg-nexus-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                <SaveIcon className="w-5 h-5"/> Save Changes
            </button>
        </div>
      </div>
    </DashboardCard>
  );
});
EntityEditorPanel.displayName = 'EntityEditorPanel';


const WorldModelView: React.FC<WorldModelViewProps> = ({ worldModel, onUpdateEntity }) => {
  const { t } = useTranslation();
  const [selectedEntity, setSelectedEntity] = useState<WorldModelEntity | null>(null);
  const [selectedPrinciple, setSelectedPrinciple] = useState<WorldModelPrinciple | null>(null);
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const { links } = useMemo(() => {
    if (!worldModel) return { links: [] };
    const generatedLinks: Link[] = [];
    worldModel.relationships.forEach(rel => {
        generatedLinks.push({
            source: rel.sourceId,
            target: rel.targetId,
            strength: rel.strength,
        });
    });
    return { links: generatedLinks };
  }, [worldModel]);

  useEffect(() => {
    if (!worldModel) {
        setNodes([]);
        return;
    };
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const angleStep = worldModel.entities.length > 0 ? (2 * Math.PI) / worldModel.entities.length : 0;
    
    const initialNodes = worldModel.entities.map((entity, i) => {
        const angle = angleStep * i;
        return {
            id: entity.id,
            name: entity.name,
            type: entity.type,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    });
    setNodes(initialNodes);
  }, [worldModel]);

  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, k: 1 });
  const [draggedNode, setDraggedNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const screenCTM = svg.getScreenCTM();
    return screenCTM ? pt.matrixTransform(screenCTM.inverse()) : pt;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const target = e.target as SVGElement;
    const nodeId = target.closest('g[data-node-id]')?.getAttribute('data-node-id');
    const { x, y } = getSVGPoint(e.clientX, e.clientY);

    if (nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setDraggedNode({ 
          id: nodeId, 
          offsetX: (x - viewTransform.x) / viewTransform.k - node.x,
          offsetY: (y - viewTransform.y) / viewTransform.k - node.y,
        });
      }
    } else {
      setIsPanning(true);
      setPanStart({ x: x - viewTransform.x, y: y - viewTransform.y });
    }
  }, [getSVGPoint, nodes, viewTransform]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const { x, y } = getSVGPoint(e.clientX, e.clientY);

    if (draggedNode) {
      e.preventDefault();
      const newX = (x - viewTransform.x) / viewTransform.k - draggedNode.offsetX;
      const newY = (y - viewTransform.y) / viewTransform.k - draggedNode.offsetY;
      setNodes(prevNodes => prevNodes.map(n => n.id === draggedNode.id ? { ...n, x: newX, y: newY } : n));
    } else if (isPanning) {
      e.preventDefault();
      setViewTransform(prev => ({ ...prev, x: x - panStart.x, y: y - panStart.y }));
    }
  }, [getSVGPoint, draggedNode, isPanning, panStart, viewTransform]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const { x, y } = getSVGPoint(e.clientX, e.clientY);
    const scaleFactor = 1.1;
    const newK = e.deltaY > 0 ? viewTransform.k / scaleFactor : viewTransform.k * scaleFactor;
    
    setViewTransform(prev => {
        const newX = x - (x - prev.x) * (newK / prev.k);
        const newY = y - (y - prev.y) * (newK / prev.k);
        return { x: newX, y: newY, k: newK };
    });
  }, [getSVGPoint, viewTransform.k]);
  
  const handleEntityClick = (entity: WorldModelEntity) => {
    if (draggedNode) return;
    setSelectedEntity(prev => prev?.id === entity.id ? null : entity);
    setSelectedPrinciple(null);
  };
  
  const handlePrincipleClick = (principle: WorldModelPrinciple) => {
    setSelectedPrinciple(prev => prev?.id === principle.id ? null : principle);
    setSelectedEntity(null);
  }
  
  if (!worldModel) {
    return (
        <div className="flex items-center justify-center h-full text-nexus-text-muted">
            <div className="w-16 h-16 mb-4 relative"><div className="nexus-loader"></div></div>
            Initializing World Model...
        </div>
    );
  }

  const entitiesInPrinciple = useMemo(() => {
    if (!selectedPrinciple) return new Set<string>();
    const principleText = selectedPrinciple.statement.toLowerCase();
    const entityIds = worldModel.entities
        .filter(e => principleText.includes(e.name.toLowerCase()))
        .map(e => e.id);
    return new Set(entityIds);
  }, [selectedPrinciple, worldModel.entities]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Panel: Principles & Entities */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <DashboardCard title={t('worldModel.corePrinciples')} icon={<BrainCircuitIcon />} className="flex-shrink-0">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {worldModel.principles.length > 0 ? worldModel.principles.map(p => (
                <div key={p.id} onClick={() => handlePrincipleClick(p)} className={`p-2 rounded-lg text-sm italic cursor-pointer transition-colors ${selectedPrinciple?.id === p.id ? 'bg-nexus-primary/20' : 'bg-nexus-dark/50 hover:bg-nexus-surface'}`}>
                    <p className="text-nexus-text-muted">"{p.statement}"</p>
                    <p className="text-right text-xs text-nexus-primary font-mono">Conf: {(p.confidence * 100).toFixed(0)}%</p>
                </div>
            )) : <p className="text-sm text-nexus-text-muted text-center">{t('worldModel.noPrinciples')}</p>}
          </div>
        </DashboardCard>
        <DashboardCard title={t('worldModel.keyEntities')} icon={<CubeTransparentIcon />} className="flex-grow min-h-0">
          <div className="space-y-2 h-full overflow-y-auto pr-2">
             {worldModel.entities.length > 0 ? worldModel.entities.map(e => (
                <div key={e.id} onClick={() => handleEntityClick(e)} className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${selectedEntity?.id === e.id ? 'bg-nexus-primary/20' : 'bg-nexus-dark/50 hover:bg-nexus-surface'}`}>
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
          <svg 
            ref={svgRef}
            width="100%" height="100%" viewBox="0 0 800 600"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={isPanning || draggedNode ? 'cursor-grabbing' : 'cursor-grab'}
          >
             <defs>
                <filter id="glow-entity" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.k})`}>
              {/* Links */}
              <g>
                  {links.map((link, i) => {
                      const sourceNode = nodes.find(n => n.id === link.source);
                      const targetNode = nodes.find(n => n.id === link.target);
                      if (!sourceNode || !targetNode) return null;

                      const isHighlightedBySelection = selectedEntity && (link.source === selectedEntity.id || link.target === selectedEntity.id);
                      const isHighlightedByPrinciple = selectedPrinciple && (entitiesInPrinciple.has(link.source) || entitiesInPrinciple.has(link.target));
                      const isHighlighted = isHighlightedBySelection || isHighlightedByPrinciple;
                      
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
                      const isHighlightedByPrinciple = selectedPrinciple && entitiesInPrinciple.has(node.id);
                      const isActive = isSelected || isConnected || isHighlightedByPrinciple;

                      return (
                          <g key={node.id} data-node-id={node.id} transform={`translate(${node.x},${node.y})`} onClick={() => handleEntityClick(entity)} className="cursor-pointer group">
                              <title>{`${node.name} (type: ${node.type})`}</title>
                              <circle
                                  r={isSelected ? 10 : 6}
                                  fill={entityColors[node.type]}
                                  stroke={isSelected ? "white" : entityColors[node.type]}
                                  strokeWidth="2"
                                  opacity={!selectedEntity && !selectedPrinciple || isActive ? 1 : 0.2}
                                  className="transition-all duration-300"
                                  style={{ filter: isSelected || isHighlightedByPrinciple ? 'url(#glow-entity)' : 'none' }}
                              />
                              <text
                                  x="12" y="5"
                                  fontSize="12"
                                  fill="white"
                                  className="pointer-events-none transition-all duration-300"
                                  style={{ opacity: isSelected || isHighlightedByPrinciple || (!selectedEntity && !selectedPrinciple && nodes.length < 20) ? 1 : 0, transitionDelay: isSelected ? '150ms' : '0ms' }}
                              >{node.name}</text>
                          </g>
                      );
                  })}
              </g>
            </g>
          </svg>
        </DashboardCard>

        {selectedEntity && (
          <EntityEditorPanel
            entity={selectedEntity}
            onSave={(updatedEntity) => {
              onUpdateEntity(updatedEntity);
              setSelectedEntity(updatedEntity); // Keep panel open with new data
            }}
            onCancel={() => setSelectedEntity(null)}
          />
        )}
      </div>
    </div>
  );
};

export default memo(WorldModelView);