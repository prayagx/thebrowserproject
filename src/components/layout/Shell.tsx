import { useState } from 'react';
import Sidebar from '../sidebar/Sidebar.tsx';
import CommandPalette from '../palette/CommandPalette';
import Scratchpad from './Scratchpad';
import WebviewContainer from './WebviewContainer';
import { cn } from '../../lib/utils';
import { useBrowserStore } from '../../store/browserStore';

export default function Shell() {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const { tabs, activeTabId, splitTabId, setSplitTab } = useBrowserStore();

    const activeTab = tabs.find(t => t.id === activeTabId);
    const splitTab = tabs.find(t => t.id === splitTabId);

    return (
        <div className="flex h-screen w-screen text-[var(--color-arc-text-primary)] bg-[var(--color-arc-dark)]">
            {/* Invisible safe-zone edge trigger for auto-expanding the sidebar */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-4 z-50 cursor-pointer"
                onMouseEnter={() => setSidebarExpanded(true)}
            />

            {/* Sidebar Container */}
            <div
                className={cn(
                    "flex flex-col h-full flex-shrink-0 transition-[width,padding] duration-300 cubic-bezier(0.16, 1, 0.3, 1) z-40 bg-[var(--color-arc-sidebar)] backdrop-blur-3xl overflow-hidden",
                    sidebarExpanded ? "w-64 border-r border-[var(--color-arc-border)]" : "w-0 border-r-0"
                )}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                {/* Top Toggle Strip isn't necessary for auto-hide, but we can keep it inside if they ever want to pin. 
                    Actually, if it's w-0, it disappears entirely. */}
                <div className={cn(
                    "w-64 h-full transition-[opacity,transform] duration-500",
                    sidebarExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                )}>
                    <Sidebar />
                </div>
            </div>

            {/* Main Content Area */}
            {/* When collapsed, we add a 16px left padding (pl-4). This creates a 'safe zone' on the left edge of the OS window where the Native Webview cannot render, allowing the React hover div above to catch the mouse! */}
            <div className={cn(
                "flex-1 relative overflow-hidden py-3 pr-3 flex gap-3 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
                sidebarExpanded ? "pl-3 pb-3" : "pl-4 pb-3"
            )}>
                {/* Left/Main WebView */}
                <div className={cn("flex-1 bg-black/60 rounded-[24px] border border-white/10 shadow-2xl overflow-hidden ring-[0.5px] ring-white/20 relative transition-transform duration-500", splitTab && "border-r-2")}>
                    {tabs.filter(t => !t.isArchived && t.id !== splitTabId).map(tab => (
                        <WebviewContainer 
                            key={`main-${tab.id}`}
                            tabId={`main-${tab.id}`} 
                            url={tab.url} 
                            isActive={activeTabId === tab.id} 
                        />
                    ))}
                    {!activeTab && (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-arc-text-secondary)]">
                            <div className="text-center space-y-4">
                                <h1 className="text-2xl font-semibold">Ready to browse.</h1>
                                <p>Press <kbd className="px-2 py-1 bg-white/10 rounded-md text-sm">Cmd+T</kbd> to search or go to a URL.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right/Split WebView */}
                {splitTab && (
                    <div className="flex-1 bg-black/60 rounded-[24px] border border-white/10 shadow-2xl overflow-hidden relative group ring-[0.5px] ring-white/20 transition-transform duration-500">
                        <button
                            onClick={() => setSplitTab(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70"
                        >
                            Close Split
                        </button>
                        <WebviewContainer 
                            key={`split-${splitTab.id}`}
                            tabId={`split-${splitTab.id}`} 
                            url={splitTab.url} 
                            isActive={true} 
                        />
                    </div>
                )}
            </div>

            <CommandPalette />
            <Scratchpad />
        </div>
    );
}
