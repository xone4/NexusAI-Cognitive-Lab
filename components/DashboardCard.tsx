import React, { Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from './Icons';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  fullHeight?: boolean;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '', icon, fullHeight = false, isCollapsible = true, defaultOpen = true }) => {
  return (
    <Disclosure defaultOpen={defaultOpen} as="div">
      {({ open }) => (
        <div
          className={`bg-nexus-surface rounded-lg border border-nexus-surface/50 shadow-lg flex flex-col backdrop-blur-sm bg-opacity-50 transition-all duration-300 group ${fullHeight && open ? 'h-full' : ''} ${className}`}
        >
          <Disclosure.Button as="div" className={`p-4 ${isCollapsible ? 'cursor-pointer' : ''}`}>
            <div className="flex items-center">
              {icon && <div className="w-6 h-6 mr-3 text-nexus-primary">{icon}</div>}
              <h3 className="text-lg font-semibold text-nexus-text flex-grow">{title}</h3>
              {isCollapsible && (
                <ChevronDownIcon className={`w-5 h-5 text-nexus-text-muted transition-transform duration-300 opacity-0 group-hover:opacity-100 ${open ? '' : '-rotate-90'}`} />
              )}
            </div>
          </Disclosure.Button>
          
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Disclosure.Panel className="px-4 pb-4 flex-grow min-h-0">
              {children}
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
};

export default DashboardCard;
