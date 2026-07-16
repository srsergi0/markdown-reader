# ⚡️ Markdown Reader

<div align="center">

**A lightweight, native desktop Markdown viewer built for speed and privacy.**

[![GitHub Release](https://img.shields.io/github/v/release/srsergi0/markdown-reader?style=flat-square&color=22c55e)](https://github.com/srsergi0/markdown-reader/releases)
[![GitHub Stars](https://img.shields.io/github/stars/srsergi0/markdown-reader?style=flat-square&color=facc15)](https://github.com/srsergi0/markdown-reader/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/website-online-cyan?style=flat-square)](https://srsergi0.github.io/markdown-reader/)

[Live Web Docs](https://srsergi0.github.io/markdown-reader/) // [Download Guide](#-downloads) // [Features](#-features) // [Development](#-development)

</div>

---

### Why Markdown Reader?

In the era of AI, we generate summaries, documentations, and code reports faster than we can read them. Markdown Reader is a local viewer designed to let you open, scan, and read markdown files immediately without waiting for heavy editors to launch.

*   🚀 **Launch in Milliseconds:** Starts in under 50ms (versus 2-5 seconds for Electron apps).
*   📦 **Tiny Footprint:** Bundle size is under 14MB by leveraging your operating system's native WebViews.
*   🔒 **100% Offline:** Read sensitive logs and local AI outputs securely—no cloud transmission.
*   📎 **System Native:** Full support for file associations. Double-click any `.md` file to open it.

---

## ⚡️ Quick Start

### Installation

Download the client directly for your operating system:

*   💾 **[Download for Windows](https://srsergi0.github.io/markdown-reader/#downloads)**
*   🍎 **[Download for macOS](https://srsergi0.github.io/markdown-reader/#downloads)**
*   🐧 **[Download for Linux](https://srsergi0.github.io/markdown-reader/#downloads)**

Or install via source build in seconds:

```bash
# Clone the repository
git clone https://github.com/srsergi0/markdown-reader.git
cd markdown-reader

# Install dependencies using Bun
bun install

# Run dev server or build production
bun run dev
bun run build:prod
```

---

## 🛠 Features

| Feature | Details | Benefit |
| :--- | :--- | :--- |
| **Native Render** | Uses platform system WebViews, not Chromium | Consumes near-zero RAM |
| **Realtime Sync** | Watches local file system events | Refreshes UI automatically on file updates |
| **Mermaid Charts** | In-app Mermaid rendering | Renders flowcharts and graphs in-doc |
| **Tabs & Navigation**| Multi-tab interface & sidebar browser | Navigate entire documentation folders |
| **PDF Export** | Built-in PDF configuration layout | Clean physical prints and offline sharing |

---

## 💻 Development

```bash
# Start with hot module replacement (HMR)
bun run dev:hmr

# Build the final application binaries
bun run build:prod
```

### Project Structure

```
markdown-reader/
├── src/
│   ├── bun/              # Main process (Electrobun/Bun runtime)
│   │   └── index.ts
│   ├── mainview/         # React Frontend UI
│   │   ├── App.tsx
│   │   └── components/   # Modular UI elements
│   └── shared/           # Type definitions shared between contexts
├── docs/                 # Static documentation site (GitHub Pages)
├── electrobun.config.ts  # Main configuration file
└── package.json
```

### Technology Stack

*   **Runtime:** [Bun](https://bun.sh)
*   **Engine:** [Electrobun](https://blackboard.sh/electrobun)
*   **UI Core:** [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com)
*   **Build Server:** [Vite](https://vitejs.dev)

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
