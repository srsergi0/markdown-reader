# Markdown Reader

<div align="center">

**A fast, native desktop Markdown reader built with [Electrobun](https://blackboard.sh/electrobun).**

[![GitHub Release](https://img.shields.io/github/v/release/yourusername/markdown-reader?style=flat-square)](https://github.com/yourusername/markdown-reader/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/markdown-reader?style=flat-square)](https://github.com/yourusername/markdown-reader/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/yourusername/markdown-reader?style=flat-square)](https://github.com/yourusername/markdown-reader/issues)

[Download](#installation) | [Features](#features) | [Development](#development) | [Contributing](#contributing)

</div>

---

## Why Markdown Reader?

Most Markdown editors are either web apps that feel slow or Electron apps that eat your RAM. Markdown Reader is different:

- **~14MB** bundle size (vs 150MB+ for Electron)
- **<50ms** startup time (vs 2-5s for Electron)
- **Native feel** — uses system WebView, not bundled Chromium
- **File association** — double-click `.md` files to open them
- **Real-time sync** — edits in external editors show up instantly

## Features

| Feature | Description |
|---------|-------------|
| **Markdown Rendering** | Full GFM support, syntax highlighting, Mermaid diagrams |
| **Live Reload** | File changes detected and reflected instantly |
| **Folder Browser** | Browse and search entire documentation folders |
| **Tab Support** | Open multiple files in tabs |
| **Dark/Light Theme** | Toggle with persistence |
| **Drag & Drop** | Drop files or folders directly onto the app |
| **PDF Export** | Export to PDF with custom page size, margins, orientation |
| **HTML Export** | Export standalone HTML files |
| **Print** | Native print support with preview |
| **Search** | Full-text search across folder contents (`Ctrl+Shift+F`) |
| **Block Editor** | Optional WYSIWYG editing with BlockNote |
| **Cross-Platform** | Windows, macOS, Linux |

## Installation

### Download

Grab the latest release for your platform from the [Releases page](https://github.com/yourusername/markdown-reader/releases):

| Platform | Format | Link |
|----------|--------|------|
| Windows | `.exe` installer | [Download](https://github.com/yourusername/markdown-reader/releases/latest) |
| macOS | `.dmg` | [Download](https://github.com/yourusername/markdown-reader/releases/latest) |
| Linux | `.tar.gz` | [Download](https://github.com/yourusername/markdown-reader/releases/latest) |

### Build from Source

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and install
git clone https://github.com/yourusername/markdown-reader.git
cd markdown-reader
bun install

# Build
bun run build

# Or build production release
bun run build:prod
```

## Development

```bash
# Start with hot module replacement (recommended)
bun run dev:hmr

# Start without HMR
bun run dev

# Build for production
bun run build
```

### How HMR Works

1. Vite dev server starts on `localhost:5173`
2. Electrobun detects the running server
3. App loads from Vite instead of bundled assets
4. React components update instantly on save

## Project Structure

```
markdown-reader/
├── src/
│   ├── bun/              # Main process (Electrobun/Bun)
│   │   └── index.ts
│   ├── mainview/         # React UI
│   │   ├── App.tsx
│   │   ├── components/   # UI components
│   │   └── utils/        # Utilities
│   └── shared/           # Shared types
├── electrobun.config.ts  # App configuration
├── vite.config.ts        # Vite configuration
└── package.json
```

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) — fast JavaScript runtime
- **Framework**: [Electrobun](https://blackboard.sh/electrobun) — native desktop apps
- **UI**: [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com)
- **Build**: [Vite](https://vitejs.dev) — instant HMR
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) + remark/rehype plugins

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) first.

## License

[MIT](LICENSE)
