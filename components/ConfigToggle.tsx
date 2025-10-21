import React from 'react';

const ConfigToggle: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}> = ({ label, description, checked, onChange, disabled }) => (
    <div className="relative group">
        <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-nexus-primary' : 'bg-nexus-dark'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-full' : ''}`}></div>
            </div>
            <span className={`text-sm font-medium ${disabled ? 'text-nexus-text-muted/50' : 'text-nexus-text-muted'}`}>{label}</span>
        </label>
        <div className="absolute bottom-full start-0 mb-2 w-64 bg-nexus-dark text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {description}
            <div className="absolute top-full start-4 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-nexus-dark"></div>
        </div>
    </div>
);

export default ConfigToggle;
