# Contributing to Markdown Reader

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Clone the repo
git clone https://github.com/yourusername/markdown-reader.git
cd markdown-reader

# Install dependencies
bun install

# Start development (Vite dev server + Electron)
bun run dev
```

## Project Structure

```
electron/
├── main.js        # Electron main process (window, IPC, file watching, export)
└── preload.js     # contextBridge API exposed to the renderer

src/
├── mainview/      # React UI (components, styles, desktop bridge)
└── shared/        # Shared types and print/HTML builders
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Vite dev server + Electron with HMR |
| `bun run build` | Build the renderer (Vite) |
| `bun run typecheck` | Type-check with `tsc` |
| `bun run dist` | Package the app for the current OS |
| `bun run dist:win` | Package for Windows |
| `bun run dist:mac` | Package for macOS |
| `bun run dist:linux` | Package for Linux |

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## Code Style

- TypeScript for all code
- React functional components with hooks
- Tailwind CSS for styling
- Follow existing patterns in the codebase

## Reporting Issues

- Use GitHub Issues
- Include OS, Electron version, and steps to reproduce
- Screenshots welcome

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
