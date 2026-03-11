import { useEffect } from 'react';
import Shell from './components/layout/Shell.tsx';
import { useBrowserStore } from './store/browserStore';

function App() {
  const archiveInactiveTabs = useBrowserStore(state => state.archiveInactiveTabs);

  useEffect(() => {
    // Run archive check on startup
    archiveInactiveTabs();

    // Check every hour (3600000 ms)
    const interval = setInterval(() => {
      archiveInactiveTabs();
    }, 3600000);

    return () => clearInterval(interval);
  }, [archiveInactiveTabs]);

  return (
    <Shell />
  );
}

export default App;
