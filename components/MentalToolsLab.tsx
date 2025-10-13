import React, { memo, useState, useMemo, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { MentalTool, Toolchain, Behavior } from '../types';
import { Menu, Transition } from '@headlessui/react';
import DashboardCard from './DashboardCard';
import ToolForgeModal from './ToolForgeModal';
import ModifyToolModal from './ModifyToolModal';
import ToolchainsManager from './ToolchainsManager';
import BehaviorManager from './BehaviorManager';
import { 
    BeakerIcon, 
    CodeBracketIcon, 
    TrashIcon, 
    FireIcon, 
    ArchiveBoxIcon, 
    WrenchScrewdriverIcon, 
    CheckCircleIcon,
    XCircleIcon,
    GlobeAltIcon,
    ChartPieIcon,
    CpuChipIcon,
    SparklesIcon
} from './Icons';

type SortKey = 'name' | 'complexity' | 'version' | 'status';
type FilterStatus = MentalTool['status'] | 'All';

interface MentalToolsLabProps {
  tools: MentalTool[];
  toolchains: Toolchain[];
  behaviors: Behavior[];
  isInteractionDisabled: boolean;
  onForgeTool: (details: { purpose: string; capabilities: string[] }) => Promise<MentalTool>;
  onModifyTool: (toolId: string, updates: Partial<Pick<MentalTool, 'name' | 'description' | 'tags'>>) => void;
  onToggleStatus: (toolId: string) => void;
  onOptimizeTool: (toolId: string) => void;
  onArchiveTool: (toolId: string) => void;
  onDecommissionTool: (toolId: string) => void;
  onCreateToolchain: (data: Omit<Toolchain, 'id'>) => void;
  onUpdateToolchain: (id: string, updates: Partial<Toolchain>) => void;
  onDeleteToolchain: (id: string) => void;
  onUpdateBehavior: (behaviorId: string, updates: Partial<Pick<Behavior, 'name' | 'description' | 'tags'>>) => void;
  onDeleteBehavior: (behaviorId: string) => void;
}

const ToolCard: React.FC<Omit<MentalToolsLabProps, 'tools' | 'toolchains' | 'behaviors' | 'onForgeTool' | 'onCreateToolchain' | 'onUpdateToolchain' | 'onDeleteToolchain' | 'onUpdateBehavior' | 'onDeleteBehavior'> & { tool: MentalTool; onSelectModify: (tool: MentalTool) => void; }> = memo(({ tool, isInteractionDisabled, onToggleStatus, onOptimizeTool, onArchiveTool, onDecommissionTool, onSelectModify }) => {
    const { t } = useTranslation();
    
    const statusStyles: Record<MentalTool['status'], { border: string; text: string; bg: string; anim?: string }> = {
        Idle: { border: 'border-nexus-surface', text: 'text-nexus-text-muted', bg: 'bg-nexus-surface/50' },
        Active: { border: 'border-nexus-secondary', text: 'text-nexus-secondary', bg: 'bg-nexus-secondary/20', anim: 'animate-pulse-slow' },
        Optimizing: { border: 'border-nexus-accent', text: 'text-nexus-accent', bg: 'bg-nexus-accent/20', anim: 'animate-pulse' },
        Archived: { border: 'border-gray-600', text: 'text-gray-500', bg: 'bg-gray-600/20' },
    };
    
    const style = statusStyles[tool.status] || statusStyles.Idle;

    const getToolIcon = (tool: MentalTool) => {
        const tags = tool.tags.join(' ').toLowerCase();
        if (tags.includes('code') || tags.includes('execution')) {
            return <CodeBracketIcon className={style.text} />;
        }
        if (tags.includes('web') || tags.includes('search')) {
            return <GlobeAltIcon className={style.text} />;
        }
        if (tags.includes('analysis') || tags.includes('data')) {
            return <ChartPieIcon className={style.text} />;
        }
        if (tags.includes('core')) {
            return <CpuChipIcon className={style.text} />;
        }
        return <BeakerIcon className={style.text} />;
    };

    return (
        <DashboardCard 
            title={tool.name} 
            icon={getToolIcon(tool)} 
            className={`border-s-4 ${style.border} ${style.anim || ''} transition-all duration-300 flex flex-col`}
        >
            <div className="flex-grow space-y-3">
                <div className="flex justify-between items-start">
                    <p className={`text-sm font-bold ${style.text}`}>{t('tools.status')}: {tool.status}</p>
                    <p className="text-sm text-nexus-text-muted">{`${t('tools.versionShort')}${tool.version.toFixed(1)} | ${t('tools.complexityShort')}: ${tool.complexity}`}</p>
                </div>
                <p className="text-sm text-nexus-text-muted italic flex-grow">"{tool.description}"</p>
                <div>
                    <h4 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-1">{t('tools.tags')}</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {tool.tags.map(tag => (
                            <span key={tag} className="text-xs bg-nexus-dark px-2 py-0.5 rounded-full text-nexus-secondary font-mono">{tag}</span>
                        ))}
                         {tool.tags.length === 0 && <span className="text-xs text-nexus-text-muted font-mono">{t('tools.noTags')}</span>}
                    </div>
                </div>
            </div>

            {/* Actions Dropdown */}
            <div className="mt-4 pt-3 border-t border-nexus-surface/30">
                 <Menu as="div" className="relative inline-block text-left w-full">
                    <div>
                        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-nexus-surface px-3 py-2 text-sm font-semibold text-nexus-text shadow-sm ring-1 ring-inset ring-nexus-primary/50 hover:bg-nexus-dark disabled:opacity-50" disabled={isInteractionDisabled || tool.status === 'Optimizing'}>
                            {t('tools.actions')}
                        </Menu.Button>
                    </div>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute bottom-full mb-2 w-56 origin-bottom-start rounded-xl bg-nexus-bg shadow-lg ring-1 ring-nexus-surface ring-opacity-50 focus:outline-none z-10">
                            <div className="py-1">
                                <Menu.Item disabled={tool.status === 'Archived' || tool.status === 'Optimizing'}>
                                {({ active, disabled }) => {
                                    const isActivate = tool.status !== 'Active';
                                    return (
                                        <button onClick={() => onToggleStatus(tool.id)} disabled={disabled} className={`${active ? 'bg-nexus-surface text-white' : 'text-nexus-text-muted'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}>
                                            {isActivate ? <CheckCircleIcon className="me-2 h-5 w-5 text-green-400" /> : <XCircleIcon className="me-2 h-5 w-5 text-yellow-400" />}
                                            {isActivate ? t('tools.activate') : t('tools.deactivate')}
                                        </button>
                                    );
                                }}
                                </Menu.Item>
                                <Menu.Item>
                                {({ active }) => (
                                    <button onClick={() => onSelectModify(tool)} className={`${active ? 'bg-nexus-surface text-white' : 'text-nexus-text-muted'} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}>
                                        <WrenchScrewdriverIcon className="me-2 h-5 w-5 text-purple-400" />
                                        {t('tools.modify')}
                                    </button>
                                )}
                                </Menu.Item>
                                 <Menu.Item disabled={tool.status !== 'Idle'}>
                                {({ active, disabled }) => (
                                    <button onClick={() => onOptimizeTool(tool.id)} disabled={disabled} className={`${active ? 'bg-nexus-surface text-white' : 'text-nexus-text-muted'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}>
                                        <SparklesIcon className="me-2 h-5 w-5 text-blue-400" />
                                        {t('tools.optimize')}
                                    </button>
                                )}
                                </Menu.Item>
                                 <div className="my-1 h-px bg-nexus-surface/50" />
                                 <Menu.Item disabled={tool.status === 'Active' || tool.status === 'Optimizing'}>
                                {({ active, disabled }) => (
                                    <button onClick={() => onArchiveTool(tool.id)} disabled={disabled} className={`${active ? 'bg-nexus-surface text-white' : 'text-nexus-text-muted'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}>
                                        <ArchiveBoxIcon className="me-2 h-5 w-5 text-gray-400" />
                                        {tool.status === 'Archived' ? t('tools.unarchive') : t('tools.archive')}
                                    </button>
                                )}
                                </Menu.Item>
                                 <Menu.Item disabled={tool.status !== 'Archived'}>
                                {({ active, disabled }) => (
                                    <button onClick={() => onDecommissionTool(tool.id)} disabled={disabled} className={`${active ? 'bg-red-500/20 text-red-400' : 'text-red-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}>
                                       <TrashIcon className="me-2 h-5 w-5" />
                                       {t('tools.decommission')}
                                    </button>
                                )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </DashboardCard>
    );
});
ToolCard.displayName = 'ToolCard';

const MentalToolsLab: React.FC<MentalToolsLabProps> = (props) => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [toolToModify, setToolToModify] = useState<MentalTool | null>(null);
  
  const { tools, toolchains, behaviors, ...otherProps } = props;

  const filteredAndSortedTools = useMemo(() => {
    return props.tools
      .filter(tool => filterStatus === 'All' || tool.status === filterStatus)
      .sort((a, b) => {
        if (sortKey === 'name' || sortKey === 'status') {
          return a[sortKey].localeCompare(b[sortKey]);
        }
        return b[sortKey] - a[sortKey]; // Sort descending for complexity/version
      });
  }, [props.tools, filterStatus, sortKey]);

  return (
    <div className="space-y-6">
      {isForgeModalOpen && <ToolForgeModal onClose={() => setIsForgeModalOpen(false)} onForge={props.onForgeTool} />}
      {toolToModify && <ModifyToolModal tool={toolToModify} onClose={() => setToolToModify(null)} onSave={props.onModifyTool} />}

      {/* Control Header */}
      <DashboardCard title={t('tools.labTitle')} icon={<BeakerIcon />}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-grow flex gap-4">
                {/* Filter */}
                <div>
                    <label htmlFor="filter-status" className="text-xs font-semibold text-nexus-text-muted">{t('tools.filterByStatus')}</label>
                    <select id="filter-status" value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)} className="w-full mt-1 block rounded-xl border-0 py-1.5 ps-3 pe-10 bg-nexus-bg text-nexus-text ring-1 ring-inset ring-nexus-surface focus:ring-2 focus:ring-nexus-primary sm:text-sm sm:leading-6">
                        <option value="All">{t('tools.all')}</option>
                        <option value="Idle">{t('tools.idle')}</option>
                        <option value="Active">{t('tools.active')}</option>
                        <option value="Optimizing">{t('tools.optimizing')}</option>
                        <option value="Archived">{t('tools.archived')}</option>
                    </select>
                </div>
                {/* Sort */}
                 <div>
                    <label htmlFor="sort-key" className="text-xs font-semibold text-nexus-text-muted">{t('tools.sortBy')}</label>
                    <select id="sort-key" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className="w-full mt-1 block rounded-xl border-0 py-1.5 ps-3 pe-10 bg-nexus-bg text-nexus-text ring-1 ring-inset ring-nexus-surface focus:ring-2 focus:ring-nexus-primary sm:text-sm sm:leading-6">
                        <option value="name">{t('tools.name')}</option>
                        <option value="complexity">{t('tools.complexity')}</option>
                        <option value="version">{t('tools.version')}</option>
                        <option value="status">{t('tools.status')}</option>
                    </select>
                </div>
            </div>
            {/* Action Button */}
            <div className="w-full md:w-auto">
                <button
                    onClick={() => setIsForgeModalOpen(true)}
                    disabled={props.isInteractionDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-nexus-primary/90 text-nexus-dark font-bold py-3 px-4 rounded-full border border-nexus-primary/80 hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed"
                >
                    <FireIcon className="w-5 h-5"/> {t('tools.forgeNewTool')}
                </button>
            </div>
        </div>
      </DashboardCard>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} {...props} onSelectModify={setToolToModify} />
        ))}
        {filteredAndSortedTools.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 text-center text-nexus-text-muted py-10">
                <CodeBracketIcon className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">{t('tools.noToolsMatch')}</h3>
                <p className="text-sm">{t('tools.noToolsMatchHint')}</p>
            </div>
        )}
      </div>
      
      {/* Toolchains */}
       <ToolchainsManager 
        allTools={props.tools}
        toolchains={props.toolchains}
        isThinking={props.isInteractionDisabled}
        onCreate={props.onCreateToolchain}
        onUpdate={props.onUpdateToolchain}
        onDelete={props.onDeleteToolchain}
       />
       
       {/* Behaviors */}
       <BehaviorManager
        behaviors={props.behaviors}
        onUpdate={props.onUpdateBehavior}
        onDelete={props.onDeleteBehavior}
       />

    </div>
  );
};

export default memo(MentalToolsLab);