import React, { useState } from 'react';
import type { Behavior } from '../types';
import { WrenchScrewdriverIcon } from './Icons';

interface ModifyBehaviorModalProps {
    behavior: Behavior;
    onClose: () => void;
    onSave: (behaviorId: string, updates: Partial<Pick<Behavior, 'name' | 'description' | 'tags'>>) => void;
}

const ModifyBehaviorModal: React.FC<ModifyBehaviorModalProps> = ({ behavior, onClose, onSave }) => {
    const [name, setName] = useState(behavior.name);
    const [description, setDescription] = useState(behavior.description);
    const [tags, setTags] = useState(behavior.tags.join(', '));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave(behavior.id, { name, description, tags: tagArray });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-lg border border-nexus-primary/50 relative">
                 <button onClick={onClose} className="absolute top-3 right-3 text-nexus-text-muted hover:text-white">&times;</button>
                 <form onSubmit={handleSave}>
                     <div className="flex items-center gap-3 mb-4">
                        <WrenchScrewdriverIcon className="w-8 h-8 text-nexus-secondary"/>
                        <h3 className="text-xl font-bold text-nexus-text">Modify Behavior</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="bhv-name" className="block text-sm font-medium text-nexus-text-muted">Behavior Name</label>
                            <input
                                type="text"
                                id="bhv-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full mt-1 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="bhv-description" className="block text-sm font-medium text-nexus-text-muted">Description</label>
                            <textarea
                                id="bhv-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full mt-1 h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="bhv-tags" className="block text-sm font-medium text-nexus-text-muted">Tags (comma-separated)</label>
                            <input
                                type="text"
                                id="bhv-tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full mt-1 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark">Cancel</button>
                        <button type="submit" className="py-2 px-6 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModifyBehaviorModal;