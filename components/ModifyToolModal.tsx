import React, { useState } from 'react';
import type { MentalTool } from '../types';
import { WrenchScrewdriverIcon } from './Icons';

interface ModifyToolModalProps {
    tool: MentalTool;
    onClose: () => void;
    onSave: (toolId: string, updates: Partial<Pick<MentalTool, 'name' | 'description' | 'tags'>>) => void;
}

const ModifyToolModal: React.FC<ModifyToolModalProps> = ({ tool, onClose, onSave }) => {
    const [name, setName] = useState(tool.name);
    const [description, setDescription] = useState(tool.description);
    const [tags, setTags] = useState(tool.tags.join(', '));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave(tool.id, { name, description, tags: tagArray });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-lg shadow-2xl w-full max-w-lg border border-nexus-primary/50 relative">
                 <button onClick={onClose} className="absolute top-3 right-3 text-nexus-text-muted hover:text-white">&times;</button>
                 <form onSubmit={handleSave}>
                     <div className="flex items-center gap-3 mb-4">
                        <WrenchScrewdriverIcon className="w-8 h-8 text-nexus-secondary"/>
                        <h3 className="text-xl font-bold text-nexus-text">Modify Mental Tool</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-nexus-text-muted">Tool Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full mt-1 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-nexus-text-muted">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full mt-1 h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-nexus-text-muted">Tags (comma-separated)</label>
                            <input
                                type="text"
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full mt-1 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-nexus-text-muted hover:bg-nexus-dark">Cancel</button>
                        <button type="submit" className="py-2 px-6 rounded-md bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModifyToolModal;