import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from './Icons';

type SystemStatus = 'Online' | 'Degraded' | 'Offline' | 'Initializing';

interface SystemStatusControlProps {
    status: SystemStatus;
    onSetStatus: (status: SystemStatus) => void;
    isInteractionDisabled: boolean;
}

const statusConfig: Record<SystemStatus, { color: string; dotColor: string; label: string }> = {
    Online: { color: 'text-nexus-secondary', dotColor: 'bg-nexus-secondary', label: 'Online' },
    Degraded: { color: 'text-yellow-400', dotColor: 'bg-yellow-400', label: 'Degraded' },
    Offline: { color: 'text-red-500', dotColor: 'bg-red-500', label: 'Offline' },
    Initializing: { color: 'text-blue-400', dotColor: 'bg-blue-400', label: 'Initializing...' },
};


const SystemStatusControl: React.FC<SystemStatusControlProps> = ({ status, onSetStatus, isInteractionDisabled }) => {
    const config = statusConfig[status];

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button
                        disabled={isInteractionDisabled || status === 'Initializing'}
                        className={`inline-flex w-full justify-center items-center gap-2 rounded-md px-4 py-2 text-lg font-bold transition-opacity
                        ${config.color}
                        disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        <span className={`w-3 h-3 rounded-full ${config.dotColor} ${status === 'Online' ? 'animate-pulse' : ''}`}></span>
                        {config.label}
                        <ChevronDownIcon className="ml-1 -mr-1 h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                </div>
                <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-nexus-surface rounded-md bg-nexus-dark shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                        <div className="px-1 py-1 ">
                            {(['Online', 'Degraded', 'Offline'] as const).map(s => (
                                <Menu.Item key={s}>
                                    {({ active }) => (
                                        <button
                                            onClick={() => onSetStatus(s)}
                                            className={`${
                                                active ? 'bg-nexus-primary text-nexus-dark' : 'text-nexus-text'
                                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            <span className={`w-2 h-2 rounded-full mr-3 ${statusConfig[s].dotColor}`}></span>
                                            {statusConfig[s].label}
                                        </button>
                                    )}
                                </Menu.Item>
                            ))}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default SystemStatusControl;
