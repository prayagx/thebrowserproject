<div align="center">
  <img src="https://tauri.app/meta/favicon-96x96.png" alt="Tauri Logo" width="80"/>
  <h1>The Desktop Browser</h1>
  <p>A lightning-fast, Arc-inspired conceptual desktop browser built with <strong>Tauri v2</strong>, <strong>React</strong>, and <strong>Native Rust Webviews</strong>.</p>
</div>

<hr/>

## 🚀 Overview

This project is a functional prototype of a modern desktop browser focusing on productivity and organization. It challenges traditional top-bar horizontal tab layouts by implementing a permanent, auto-hiding *Vertical Sidebar*, Workspace scoping, and a keyboard-centric Command Palette.

Designed to feel native to your operating system via Tauri's OS-level WebView rendering, it avoids heavy Electron memory footprints while maintaining blazing-fast performance.

## ✨ Features

- **Native OS Webviews**: Utilizes Tauri v2's unreleased core webview bindings (`@tauri-apps/api/webview`) to render actual OS windows, bypassing restrictive iframe headers like `X-Frame-Options` (Fully supports YouTube, Google, etc).
- **Auto-Hiding Sidebar**: A sleek edge-hover mechanic expands your tabs when you need them, and tucks them away into a narrow rail when you don't.
- **Advanced Tab Engine**: 
  - **Pinning**: Keep your active apps permanently at the top.
  - **Temporary Tabs**: Clutter-free browsing.
  - **Auto-Archiving**: Tabs left un-accessed automatically move to the Archive after 7 days, powered by a local Zustand store.
- **Workspaces**: Complete compartmentalization. Switching workspaces visually swaps your active tab context instantly.
- **Command Palette (`Cmd+T`)**: A MacOS Spotlight-inspired search bar that intelligently detects direct Domain names, Localhost ports, or executes DuckDuckGo web searches.
- **Native View Compositing**: Custom React hacks physically push Native OS Webviews off-screen when summoning React overlays, blending Web UI with OS Windows flawlessly.

## 🛠️ Tech Stack

- **Core**: Tauri v2, Rust
- **Frontend**: React (Vite), TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites
Make sure you have [Rust](https://www.rust-lang.org/tools/install) and [Node.js](https://nodejs.org/) installed, along with the Tauri OS prerequisites.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thebrowserproject.git
   cd thebrowserproject
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run tauri dev
   ```

### Building for Production
To build the application for your current operating system into an installer / `.app` package:
```bash
npm run tauri build
```

## 🧠 Architecture Notes
Handling Native Webviews inside a React frontend poses unique challenges because Native Webviews render *above* the DOM canvas. 
- *Position Syncing*: `WebviewContainer.tsx` uses a synchronized `ResizeObserver` pipeline mapped to `requestAnimationFrame` to lock native window bounds physically to CSS flexbox layouts.
- *Z-Index Hacks*: The Sidebar uses a 16px "Safe Zone" edge padding, forcing the native webview to step aside so that React can capture `onMouseEnter` mouse-events on the window edge.

## 📄 License
This project is open-source. Feel free to fork and build your own dream browser!
