import { create } from 'zustand';

export interface Tab {
    id: string;
    url: string;
    title: string;
    workspaceId: string;
    isPinned: boolean;
    isArchived: boolean;
    lastAccessed: number;
}

export interface Workspace {
    id: string;
    name: string;
}

interface BrowserState {
    workspaces: Workspace[];
    activeWorkspaceId: string;
    tabs: Tab[];
    activeTabId: string | null;
    splitTabId: string | null;

    // Actions
    addWorkspace: (name: string) => void;
    switchWorkspace: (id: string) => void;
    createTab: (url: string, title?: string, isPinned?: boolean) => void;
    switchTab: (id: string) => void;
    setSplitTab: (id: string | null) => void;
    closeTab: (id: string) => void;
    togglePin: (id: string) => void;
    toggleArchive: (id: string) => void;
    archiveInactiveTabs: () => void;
    isScratchpadOpen: boolean;
    toggleScratchpad: () => void;
    isCommandPaletteOpen: boolean;
    setCommandPaletteOpen: (isOpen: boolean) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useBrowserStore = create<BrowserState>((set, get) => ({
    workspaces: [{ id: 'w1', name: 'Work' }],
    activeWorkspaceId: 'w1',
    tabs: [],
    activeTabId: null,
    splitTabId: null,
    isScratchpadOpen: false,
    isCommandPaletteOpen: false,

    toggleScratchpad: () => set((state) => ({ isScratchpadOpen: !state.isScratchpadOpen })),
    setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),

    addWorkspace: (name) => {
        const id = generateId();
        set((state) => ({
            workspaces: [...state.workspaces, { id, name }],
        }));
    },

    switchWorkspace: (id) => {
        set((state) => {
            const workspaceTabs = state.tabs.filter(t => t.workspaceId === id && !t.isArchived);
            workspaceTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
            return { 
                activeWorkspaceId: id,
                activeTabId: workspaceTabs.length > 0 ? workspaceTabs[0].id : null,
                splitTabId: null
            };
        });
    },

    createTab: (url, title = 'New Tab', isPinned = false) => {
        const { activeWorkspaceId } = get();
        const id = generateId();
        const newTab: Tab = {
            id,
            url,
            title,
            workspaceId: activeWorkspaceId,
            isPinned,
            isArchived: false,
            lastAccessed: Date.now(),
        };

        set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: id,
            splitTabId: null,
        }));
    },

    switchTab: (id) => {
        set((state) => ({
            activeTabId: id,
            splitTabId: null,
            tabs: state.tabs.map((tab) =>
                tab.id === id ? { ...tab, lastAccessed: Date.now() } : tab
            ),
        }));
    },

    setSplitTab: (id) => {
        set({ splitTabId: id });
    },

    closeTab: (id) => {
        set((state) => ({
            tabs: state.tabs.filter((tab) => tab.id !== id),
            activeTabId: state.activeTabId === id ? null : state.activeTabId,
            splitTabId: state.splitTabId === id ? null : state.splitTabId,
        }));
    },

    togglePin: (id) => {
        set((state) => ({
            tabs: state.tabs.map((tab) =>
                tab.id === id ? { ...tab, isPinned: !tab.isPinned } : tab
            ),
        }));
    },

    toggleArchive: (id) => {
        set((state) => ({
            tabs: state.tabs.map((tab) =>
                tab.id === id ? { ...tab, isArchived: !tab.isArchived } : tab
            ),
            activeTabId: state.activeTabId === id ? null : state.activeTabId,
            splitTabId: state.splitTabId === id ? null : state.splitTabId,
        }));
    },

    archiveInactiveTabs: () => {
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        set((state) => ({
            tabs: state.tabs.map((tab) => {
                if (!tab.isPinned && !tab.isArchived && now - tab.lastAccessed > SEVEN_DAYS_MS) {
                    return { ...tab, isArchived: true };
                }
                return tab;
            }),
        }));
    },
}));
