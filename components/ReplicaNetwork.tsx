import React, { useMemo } from 'react';
import type { Replica } from '../types';
import { CubeTransparentIcon, BrainCircuitIcon } from './Icons';

interface ReplicaNetworkProps {
    rootReplica: Replica;
}

interface Node {
    id: string;
    name: string;
    depth: number;
    status: Replica['status'];
    x: number;
    y: number;
}

interface Link {
    source: string;
    target: string;
    intensity: number;
}

const ReplicaNetwork: React.FC<ReplicaNetworkProps> = ({ rootReplica }) => {
    const { nodes, links } = useMemo(() => {
        const flatReplicas: Replica[] = [];
        const traverse = (r: Replica) => {
            flatReplicas.push(r);
            r.children.forEach(traverse);
        };
        traverse(rootReplica);

        const nodeMap = new Map<string, Node>();
        const generatedNodes: Node[] = [];
        const generatedLinks: Link[] = [];

        const width = 500;
        const height = 360; // h-96 in parent
        const centerX = width / 2;
        const centerY = height / 2;
        
        const coreNode: Node = { id: rootReplica.id, name: rootReplica.name, depth: 0, status: rootReplica.status, x: centerX, y: centerY };
        generatedNodes.push(coreNode);
        nodeMap.set(coreNode.id, coreNode);

        const children = flatReplicas.filter(r => r.depth > 0);
        const radius = Math.min(centerX, centerY) * 0.75;
        const angleStep = children.length > 0 ? (2 * Math.PI) / children.length : 0;

        children.forEach((replica, i) => {
            const angle = angleStep * i;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const node: Node = { id: replica.id, name: replica.name, depth: replica.depth, status: replica.status, x, y };
            generatedNodes.push(node);
            nodeMap.set(node.id, node);
        });

        flatReplicas.forEach(replica => {
            if (replica.interactions) {
                replica.interactions.forEach(interaction => {
                    if (nodeMap.has(replica.id) && nodeMap.has(interaction.targetId)) {
                        generatedLinks.push({
                            source: replica.id,
                            target: interaction.targetId,
                            intensity: interaction.intensity
                        });
                    }
                });
            }
        });

        return { nodes: generatedNodes, links: generatedLinks };
    }, [rootReplica]);

    if (!rootReplica) {
        return <div className="text-nexus-text-muted">No data for network graph.</div>;
    }

    return (
        <svg width="100%" height="100%" viewBox="0 0 500 360">
            <defs>
                <linearGradient id="link-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00aaff" />
                    <stop offset="50%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#00aaff" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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

                    return (
                        <line
                            key={`${link.source}-${link.target}-${i}`}
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke="url(#link-gradient)"
                            strokeWidth={1 + link.intensity * 2}
                            strokeOpacity={0.4 + link.intensity * 0.6}
                            className="animate-data-flow-x"
                            style={{ animationDuration: `${3 - link.intensity * 2}s` }}
                        />
                    );
                })}
            </g>

            {/* Nodes */}
            <g>
                {nodes.map(node => {
                    const isCore = node.depth === 0;
                    const r = isCore ? 25 : 15;
                    const isActive = node.status === 'Active';
                    return (
                        <g key={node.id} transform={`translate(${node.x},${node.y})`} className="cursor-pointer group">
                             <title>{`${node.name} (Status: ${node.status})`}</title>
                            <circle
                                r={r}
                                fill="#18213a"
                                stroke={isActive ? '#00e5ff' : '#a0a0a0'}
                                strokeWidth="2"
                                className="transition-all duration-300 group-hover:stroke-nexus-accent"
                                style={{ filter: isActive ? 'url(#glow)' : 'none' }}
                            />
                            {isCore ? (
                               <BrainCircuitIcon className="text-nexus-primary" x="-15" y="-15" width="30" height="30" />
                            ) : (
                               <CubeTransparentIcon className="text-nexus-secondary" x="-10" y="-10" width="20" height="20" />
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    );
};

export default ReplicaNetwork;
