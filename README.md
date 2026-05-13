# Gemini Layout Enhancer

A browser extension (Chrome, Edge, Firefox) that adds four layout enhancement buttons to [Google Gemini](https://gemini.google.com), unlocking widescreen mode, split view, focus mode, and Markdown export.

---

## Features

| Button | Icon | Description |
|--------|------|-------------|
| Widescreen | ←→ | Removes Gemini's default 600px content width limit — content fills the full window |
| Split View | ▫▫ | Clones the conversation into two side-by-side columns, both staying in sync |
| Focus Mode | ⛶ | Hides the sidebar and top bar for distraction-free reading. Press `Esc` or click `✕` to exit |
| Export Markdown | ↓ | Converts the entire conversation to Markdown and copies it to the clipboard |

---

## Installation

Install from your browser's extension store, or load manually:

1. Clone or download this repository
   ```bash
   git clone https://github.com/aleclee1005/gemini-layout-enhancer.git
   ```

2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked** and select the `gemini-layout-enhancer` folder

5. Open [gemini.google.com](https://gemini.google.com) — the four buttons will appear in the header

---

## How It Works

### Widescreen
Gemini restricts content width to ~600px for readability. The extension overrides this with two phases:
- **Phase 1** — injects high-specificity CSS (`#app-root` prefix) to remove `max-width` globally
- **Phase 2** — traverses the DOM via JavaScript to remove any inline width constraints
- A `MutationObserver` watches for new messages and unlocks them automatically

### Split View
Creates a live clone of the messages container and arranges both columns with CSS Grid:
- The original column (left) remains untouched so Angular's framework stays stable
- The clone (right) is re-synced on every DOM change via `MutationObserver`
- The input bar is extracted to span both columns at the bottom

### Focus Mode
Injects CSS to hide `bard-sidenav`, `top-bar`, and related elements. A floating `✕` button (and the `Esc` key) restores the original layout.

### Export Markdown
Walks all `model-response` and `user-query` nodes in DOM order and recursively converts HTML to Markdown, handling:
- Headings, bold, italic, strikethrough
- Fenced code blocks (with language tag)
- Ordered / unordered lists
- Tables
- Links and images

The result is written directly to the clipboard via `navigator.clipboard.writeText()`.

---

## File Structure

```
gemini-layout-enhancer/
├── manifest.json   # Browser Extension Manifest V3
└── content.js      # All extension logic (single IIFE, no dependencies)
```

---

## Compatibility

- **Chrome** 109+, **Edge** 109+, **Firefox** 109+ (Manifest V3)
- **Google Gemini** — tested on `gemini.google.com` as of 2025. Gemini's DOM structure may change; open an issue if something breaks.

---

## License

MIT
