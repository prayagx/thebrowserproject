import { useEffect, useRef, useState, useCallback } from 'react';
import { Webview } from '@tauri-apps/api/webview';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';
import { useBrowserStore } from '../../store/browserStore';

interface WebviewContainerProps {
    tabId: string;
    url: string;
    isActive: boolean;
}

export default function WebviewContainer({ tabId, url, isActive }: WebviewContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const webviewRef = useRef<Webview | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const isCommandPaletteOpen = useBrowserStore(s => s.isCommandPaletteOpen);
    
    // Hide native webviews when the React overlay needs focus
    const isEffectivelyActive = isActive && !isCommandPaletteOpen;

    const syncBounds = useCallback(() => {
        if (!webviewRef.current || !isEffectivelyActive || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Use direct setter without waiting for .position() promise to avoid IPC latency lag
        webviewRef.current.setPosition(new LogicalPosition(Math.round(rect.left), Math.round(rect.top))).catch(() => {});
        webviewRef.current.setSize(new LogicalSize(Math.round(rect.width), Math.round(rect.height))).catch(() => {});
    }, [isActive]);

    useEffect(() => {
        let mounted = true;

        async function initWebview() {
            if (!containerRef.current) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            const label = `tab-${tabId.replace(/[^a-zA-Z0-9-]/g, '')}`;

            try {
                let wv = await Webview.getByLabel(label);
                
                if (!wv) {
                    const appWindow = getCurrentWindow();
                    wv = new Webview(appWindow, label, {
                        url,
                        x: Math.round(rect.left),
                        y: Math.round(rect.top),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        transparent: false,
                        focus: isActive
                    });
                } else if (mounted) {
                    // Update bounds if it already exists
                    wv.setPosition(new LogicalPosition(Math.round(rect.left), Math.round(rect.top))).catch(() => {});
                    wv.setSize(new LogicalSize(Math.round(rect.width), Math.round(rect.height))).catch(() => {});
                }
                
                if (mounted) {
                    webviewRef.current = wv;
                    syncBounds(); // Force sync once immediately after mount
                } else {
                    wv.close();
                }
            } catch (error: any) {
                console.error('Failed to create webview:', error);
                if (mounted) setErrorMsg(error?.toString() || 'Unknown error');
            }
        }

        initWebview();

        return () => {
            mounted = false;
            if (webviewRef.current) {
                webviewRef.current.close().catch(console.error);
                webviewRef.current = null;
            }
        };
    }, [isEffectivelyActive]);

    // Handle updates to bounds and visibility
    useEffect(() => {
        // Create a ResizeObserver to sync the DOM rect to the native webview
        const observer = new ResizeObserver(() => {
            // Force a small delay to allow flexbox CSS transitions to calculate
            requestAnimationFrame(() => syncBounds());
        });
        
        if (containerRef.current) observer.observe(containerRef.current);

        // Also sync on window resize directly to catch flexbox shifts
        window.addEventListener('resize', syncBounds);

        // Also sync visibility based on React props
        if (webviewRef.current) {
            if (isEffectivelyActive) {
                webviewRef.current.show().catch(() => {});
                syncBounds();
            } else {
                webviewRef.current.setPosition(new LogicalPosition(-9999, -9999)).catch(() => {});
                webviewRef.current.hide().catch(() => {});
            }
        }

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncBounds);
        };
    }, [isEffectivelyActive, syncBounds]);

    // Handle URL navigation updates independently of the initialization
    useEffect(() => {
        // If url changes and we have the webview, there isn't a direct "navigate" API in the basic Webview class,
        // usually this means we evaluate a JS script to set window.location
        if (webviewRef.current && isEffectivelyActive) {
            // Note: If you need to navigate existing webviews dynamically, 
            // you might need additional plugins or re-evaluate window.location
        }
    }, [url, isEffectivelyActive]);

    return (
        <div 
            ref={containerRef} 
            className="w-full h-full"
            style={{ 
                visibility: isEffectivelyActive ? 'visible' : 'hidden', 
                pointerEvents: 'none' // The actual interactivity is handled by the Tauri overlay
            }}
        >
            {errorMsg && (
                <div className="absolute inset-0 bg-red-900/80 text-white p-4 overflow-auto pointer-events-auto flex items-center justify-center">
                    <p>Webview Error: {errorMsg}</p>
                </div>
            )}
        </div>
    );
}
