import { useState } from 'react';
import { Plus, Settings, Archive, X, Check, Pin } from 'lucide-react';
import { useBrowserStore, type Tab, type Workspace } from '../../store/browserStore';
import { cn } from '../../lib/utils';

export default function Sidebar() {
    const {
        workspaces, activeWorkspaceId, switchWorkspace, addWorkspace,
        tabs, activeTabId, switchTab, closeTab, createTab
    } = useBrowserStore();

    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const [isShowingArchived, setIsShowingArchived] = useState(false);

    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
    
    // Split tabs into archived and active
    const workspaceTabs = tabs.filter(t => t.workspaceId === activeWorkspaceId);
    const activeTabs = workspaceTabs.filter(t => !t.isArchived);
    const archivedTabs = workspaceTabs.filter(t => t.isArchived).sort((a,b) => b.lastAccessed - a.lastAccessed);
    
    const pinnedTabs = activeTabs.filter(t => t.isPinned);
    const tempTabs = activeTabs.filter(t => !t.isPinned);

    const handleCreateNewTab = () => {
        createTab('https://en.wikipedia.org/wiki/Special:Random', 'New Tab', false);
    };

    return (
        <div className="flex flex-col h-full bg-transparent text-sm relative border-r border-white-[0.02] shadow-[1px_0_10px_rgba(0,0,0,0.5)]">
            {/* Workspaces Header */}
            <div
                className="flex items-center justify-between px-4 py-5 hover:bg-white/5 cursor-pointer transition-colors backdrop-blur-md rounded-xl mx-2 mt-2 mb-1 border border-white/5"
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex justify-center items-center shadow-sm">
                        <span className="text-white text-[10px] font-bold">{activeWorkspace?.name?.charAt(0) || 'W'}</span>
                    </div>
                    <span className="font-semibold tracking-wide text-[var(--color-arc-text-primary)]">{activeWorkspace?.name || 'Workspace'}</span>
                </div>
                <Settings size={14} className="text-[var(--color-arc-text-secondary)] hover:text-white transition-colors" />
            </div>

            {/* Workspace Dropdown */}
            {isWorkspaceMenuOpen && (
                <div className="absolute top-20 left-4 right-4 bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 py-1 flex flex-col">
                    {workspaces.map((ws: Workspace) => (
                        <div
                            key={ws.id}
                            onClick={() => { switchWorkspace(ws.id); setIsWorkspaceMenuOpen(false); }}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[var(--color-arc-hover)] cursor-pointer"
                        >
                            <span>{ws.name}</span>
                            {ws.id === activeWorkspaceId && <Check size={14} />}
                        </div>
                    ))}
                    <div className="h-[1px] bg-[var(--color-arc-border)] my-1" />
                    <div
                        className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-arc-hover)] cursor-pointer text-[var(--color-arc-text-secondary)]"
                        onClick={() => {
                            const name = prompt('New Workspace Name:');
                            if (name) { addWorkspace(name); setIsWorkspaceMenuOpen(false); }
                        }}
                    >
                        <Plus size={14} /> <span>Create Workspace</span>
                    </div>
                </div>
            )}

            {/* Tabs Area */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
                {isShowingArchived ? (
                    <div>
                        <div className="flex items-center justify-between uppercase text-[9px] font-bold text-[var(--color-arc-text-muted)] mb-3 px-2 tracking-widest">
                            <span>Archived Tabs ({archivedTabs.length})</span>
                            <button onClick={() => setIsShowingArchived(false)} className="hover:text-white">Close</button>
                        </div>
                        <div className="space-y-1">
                            {archivedTabs.map(tab => (
                                <SidebarItem
                                    key={tab.id}
                                    tab={tab}
                                    isActive={false} // Archived tabs shouldn't display as active
                                    onClick={() => {
                                        // Unarchive and switch
                                        useBrowserStore.getState().toggleArchive(tab.id);
                                        switchTab(tab.id);
                                        setIsShowingArchived(false);
                                    }}
                                    onClose={() => closeTab(tab.id)}
                                />
                            ))}
                            {archivedTabs.length === 0 && (
                                <div className="px-2 py-2 text-xs text-[var(--color-arc-text-secondary)] text-center italic">
                                    No archived tabs
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Pinned Tabs */}
                        {pinnedTabs.length > 0 && (
                            <div className="mb-2">
                                <h3 className="uppercase text-[9px] font-bold text-[var(--color-arc-text-muted)] mb-3 px-2 tracking-widest">Pinned</h3>
                                <div className="space-y-1">
                                    {pinnedTabs.map(tab => (
                                        <SidebarItem
                                            key={tab.id}
                                            tab={tab}
                                            isActive={activeTabId === tab.id}
                                            onClick={() => switchTab(tab.id)}
                                            onClose={() => useBrowserStore.getState().toggleArchive(tab.id)} // Pin -> Archive instead of full close on X? Or close? Arc usually closes pins contextually. We'll use close -> archive.
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Temporary Tabs */}
                        <div>
                            <h3 className="uppercase text-[9px] font-bold text-[var(--color-arc-text-muted)] mb-3 px-2 tracking-widest">Today</h3>
                            <div className="space-y-1">
                                {tempTabs.map(tab => (
                                    <SidebarItem
                                        key={tab.id}
                                        tab={tab}
                                        isActive={activeTabId === tab.id}
                                        onClick={() => switchTab(tab.id)}
                                        onClose={() => useBrowserStore.getState().toggleArchive(tab.id)} // Close -> Archive
                                    />
                                ))}
                                {tempTabs.length === 0 && (
                                    <div className="px-2 py-2 text-xs text-[var(--color-arc-text-secondary)] text-center italic">
                                        No active tabs
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Action Area */}
            <div className="p-3 flex flex-col gap-1.5 pb-4 mt-auto">
                <button
                    onClick={handleCreateNewTab}
                    className="flex items-center justify-center gap-2 w-full p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-200 font-medium border border-white/5 shadow-sm"
                >
                    <Plus size={14} />
                    <span className="text-sm">New Tab</span>
                </button>
                <button
                    onClick={() => useBrowserStore.getState().toggleScratchpad()}
                    className="flex items-center gap-2 w-full p-2 rounded-lg text-[var(--color-arc-text-secondary)] hover:bg-[var(--color-arc-hover)] transition-colors"
                >
                    <Settings size={16} />
                    <span>Notes</span>
                </button>
                <button 
                    onClick={() => setIsShowingArchived(!isShowingArchived)}
                    className={cn(
                        "flex items-center gap-2 w-full p-2 rounded-lg text-[var(--color-arc-text-secondary)] hover:bg-[var(--color-arc-hover)] transition-colors",
                        isShowingArchived && "bg-white/10 text-white"
                    )}
                >
                    <Archive size={16} />
                    <span>Archived Tabs</span>
                </button>
            </div>
        </div>
    );
}

function SidebarItem({ tab, isActive, onClick, onClose }: { tab: Tab, isActive: boolean, onClick: () => void, onClose: () => void }) {
    const setSplitTab = useBrowserStore(s => s.setSplitTab);

    const togglePin = useBrowserStore(s => s.togglePin);

    let hostname = '';
    try {
        hostname = new URL(tab.url).hostname;
    } catch {
        // Fallback or ignore
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out border border-transparent",
                isActive
                    ? 'bg-white/10 text-white shadow-sm border-white/5 ring-1 ring-white/10'
                    : 'hover:bg-white/5 text-white/60 hover:text-white'
            )}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                {/* Real Favicon */}
                <div className="w-4 h-4 shrink-0 flex items-center justify-center overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
                    {hostname ? (
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                            alt=""
                            className="w-full h-full object-contain rounded-[4px]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerText = tab.title.charAt(0).toUpperCase();
                                e.currentTarget.parentElement!.className = "w-4 h-4 shrink-0 flex items-center justify-center text-[10px] font-bold bg-white/20 text-white rounded-[4px]";
                            }}
                        />
                    ) : (
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center text-[10px] font-bold bg-white/10 text-white rounded-md border border-white/10 shadow-sm">
                            {tab.title.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <span className="truncate flex-1 text-[13px] font-medium tracking-tight">{tab.title}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={(e) => { e.stopPropagation(); togglePin(tab.id); }}
                    className="hover:bg-white/20 p-1 rounded-md"
                    title={tab.isPinned ? "Unpin Tab" : "Pin Tab"}
                >
                    <Pin size={14} className={tab.isPinned ? "fill-current" : ""} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setSplitTab(tab.id); }}
                    className="hover:bg-white/20 p-1 rounded-md"
                    title="Split Right"
                >
                    <div className="w-3 h-3 border border-current rounded-sm border-r-[3px]" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="hover:bg-white/20 p-1 rounded-md"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
