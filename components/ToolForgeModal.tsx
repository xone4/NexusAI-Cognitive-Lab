import React, { useState } from 'react';
import type { MentalTool } from '../types';
import { FireIcon, BrainCircuitIcon } from './Icons';

interface ToolForgeModalProps {
    onClose: () => void;
    onForge: (details: { purpose: string; capabilities: string[] }) => Promise<MentalTool>;
}

const ToolForgeModal: React.FC<ToolForgeModalProps> = ({ onClose, onForge }) => {
    const [purpose, setPurpose] = useState('');
    const [capabilities, setCapabilities] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleForge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!purpose.trim()) {
            setError("Purpose description is required.");
            return;
        }
        setError(null);
        setIsLoading(true);

        const capsArray = capabilities.split(',').map(c => c.trim()).filter(Boolean);

        try {
            await onForge({ purpose, capabilities: capsArray });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during forging.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-lg border border-nexus-primary/50 relative">
                 <button onClick={onClose} className="absolute top-3 right-3 text-nexus-text-muted hover:text-white">&times;</button>
                 <form onSubmit={handleForge}>
                    <div className="flex items-center gap-3 mb-4">
                        <FireIcon className="w-8 h-8 text-nexus-accent"/>
                        <h3 className="text-xl font-bold text-nexus-text">Forge a New Mental Tool</h3>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-nexus-text-muted">
                            <div className="w-16 h-16 mb-4 relative"><div className="nexus-loader"></div></div>
                            <p className="font-semibold text-lg">AI is Forging...</p>
                            <p className="text-sm">Synthesizing a new cognitive instrument based on your design...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="purpose" className="block text-sm font-medium text-nexus-text-muted">Purpose / Description</label>
                                <textarea
                                    id="purpose"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    className="w-full mt-1 h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm"
                                    placeholder="e.g., 'Analyze real-time market data to predict short-term volatility.'"
                                />
                             </div>
                              <div>
                                <label htmlFor="capabilities" className="block text-sm font-medium text-nexus-text-muted">Key Capabilities (comma-separated)</label>
                                <input
                                    type="text"
                                    id="capabilities"
                                    value={capabilities}
                                    onChange={(e) => setCapabilities(e.target.value)}
                                    className="w-full mt-1 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                                    placeholder="e.g., 'data analysis, prediction, financial modeling'"
                                />
                             </div>
                        </div>
                    )}


                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} disabled={isLoading} className="py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-6 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary flex items-center gap-2 disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed">
                            <FireIcon className="w-5 h-5"/>
                            Forge Tool
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ToolForgeModal;