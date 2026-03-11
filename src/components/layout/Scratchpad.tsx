import { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBrowserStore } from '../../store/browserStore';

export default function Scratchpad() {
    const { isScratchpadOpen, toggleScratchpad } = useBrowserStore();
    const [content, setContent] = useState(() => {
        return localStorage.getItem('browser_scratchpad') || '';
    });
    const [isExpanded, setIsExpanded] = useState(false);

    // Save content on change
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem('browser_scratchpad', content);
        }, 500);
        return () => clearTimeout(timeout);
    }, [content]);

    if (!isScratchpadOpen) return null;

    return (
        <div
            className={cn(
                "absolute z-40 bg-[#1c1c1c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-white/5",
                isExpanded
                    ? "inset-4" // Full screen within main area
                    : "bottom-6 right-6 w-96 h-[400px]" // Default floating size
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/10 handle cursor-move">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                    <span className="text-xs font-semibold tracking-wider text-white/70 uppercase">Scratchpad</span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-white/10 rounded-md text-[var(--color-arc-text-secondary)] hover:text-white"
                    >
                        {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button
                        onClick={toggleScratchpad}
                        className="p-1 hover:bg-white/10 rounded-md text-[var(--color-arc-text-secondary)] hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing notes here... Markdown supported mentally."
                className="flex-1 bg-transparent border-none outline-none p-5 text-[15px] leading-relaxed text-white/90 placeholder-white/30 resize-none font-sans"
                spellCheck={false}
            />
        </div>
    );
}
