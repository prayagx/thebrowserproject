import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useBrowserStore } from '../../store/browserStore';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { getCurrentWindow } from '@tauri-apps/api/window';

export default function CommandPalette() {
    const [query, setQuery] = useState('');
    const { createTab, tabs, isCommandPaletteOpen, setCommandPaletteOpen } = useBrowserStore();

    useEffect(() => {
        const togglePalette = () => {
            setCommandPaletteOpen(!isCommandPaletteOpen);
        };

        const registerShortcut = async () => {
            try {
                await register('CommandOrControl+T', togglePalette);
                // Also add Cmd+L for focusing the URL bar
                await register('CommandOrControl+L', togglePalette);
            } catch (e) {
                console.error("Failed to register shortcut:", e);
            }
        };

        const unregisterShortcut = async () => {
            try {
                await unregister('CommandOrControl+T');
                await unregister('CommandOrControl+L');
            } catch (e) {
                // Ignore errors on unregister
            }
        };

        let unlistenFocus: (() => void) | undefined;
        
        const init = async () => {
            const win = getCurrentWindow();
            const isFocused = await win.isFocused();
            if (isFocused) {
                await registerShortcut();
            }

            unlistenFocus = await win.onFocusChanged(({ payload: focused }) => {
                if (focused) {
                    registerShortcut();
                } else {
                    unregisterShortcut();
                }
            });
        };

        init();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setCommandPaletteOpen(false);
            }
            // Fallback for regular DOM focus
            if ((e.metaKey || e.ctrlKey) && (e.code === 'KeyT' || e.code === 'KeyL')) {
                e.preventDefault();
                togglePalette();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            unregisterShortcut();
            if (unlistenFocus) unlistenFocus();
        };
    }, [isCommandPaletteOpen, setCommandPaletteOpen]);

    if (!isCommandPaletteOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        let url = trimmedQuery;

        // Robust URL detection: starts with protocol, or contains a dot and no spaces
        const hasProtocol = /^https?:\/\//i.test(url);
        const isDomain = !url.includes(' ') && url.includes('.') && url.length > 3;
        const isLocal = url.startsWith('localhost') || url.startsWith('127.0.0.1');

        if (hasProtocol) {
            // Already a full URL
        } else if (isDomain || isLocal) {
            url = `https://${url}`;
        } else {
            // Treat as search query
            url = `https://duckduckgo.com/?q=${encodeURIComponent(trimmedQuery)}`;
        }

        console.log('Opening URL:', url);
        createTab(url, trimmedQuery, false);
        setCommandPaletteOpen(false);
        setQuery('');
    };

    const filteredTabs = tabs.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.url.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-md transition-all duration-300" onClick={() => setCommandPaletteOpen(false)}>
            <div
                className="w-full max-w-2xl bg-[#1c1c1c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="flex items-center px-5 py-4 border-b border-white/10 bg-black/20">
                    <Search size={22} className="text-white/50 mr-4" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search DuckDuckGo or enter URL..."
                        className="flex-1 bg-transparent border-none outline-none text-2xl font-light text-white placeholder-white/30 tracking-wide"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>

                {/* Results Area */}
                {query && (
                    <div className="max-h-96 overflow-y-auto p-3 bg-black/10">
                        <div className="text-[10px] font-bold text-white/40 uppercase px-3 py-2 tracking-widest">Tabs & History</div>
                        {filteredTabs.map(tab => (
                            <div key={tab.id} className="group flex items-center gap-4 px-3 py-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors duration-200">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white/10 text-white shadow-sm font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
                                    {tab.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[15px] font-medium text-white/90 truncate">{tab.title}</span>
                                    <span className="text-[13px] text-white/40 truncate mt-0.5">{tab.url}</span>
                                </div>
                            </div>
                        ))}
                        {filteredTabs.length === 0 && (
                            <div className="px-3 py-8 text-center text-sm text-white/40 font-medium">
                                Press Enter to search the web for "{query}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
