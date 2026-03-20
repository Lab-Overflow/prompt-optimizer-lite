# Prompt Optimizer Lite (VS Code Extension)

A lightweight prompt optimizer for VS Code.
It prioritizes the **current chat model** and automatically falls back to a **local Python optimizer** when model invocation fails.

## Why This Exists

Before this extension is published to VS Code Marketplace, many users can only install from GitHub source.
This README is designed for that path: fast setup, clear demo, and practical usage patterns.

## What You Can Do

- Optimize rough prompts with `@promptopt` directly in VS Code Chat.
- Optimize from editor selection with one command.
- Optimize even when no selection exists (manual input box will appear).
- Send optimized result to replace selection, insert at cursor, copy clipboard, or open preview.
- Keep working when model APIs fail via Python fallback.

## Quick Start (From GitHub Source)

### Prerequisites

- VS Code `1.105.0` or later
- Node.js `18+` (recommended `20+`)
- Python `3.x` (optional but recommended for fallback)
- A VS Code chat model provider (Copilot/Codex/Claude-compatible provider in Chat)

### Option A: Run In Extension Development Host (Recommended for first try)

1. Clone and open this repo in VS Code.
2. Install dependencies:

```bash
npm install
```

3. Compile extension:

```bash
npm run compile
```

4. Press `F5` to launch **Extension Development Host**.
5. In the new window, run command palette:

```text
Prompt Optimizer Lite: Optimize Prompt
```

### Option B: Build and install a VSIX

1. Build package:

```bash
npm run package
```

2. Install generated `.vsix` using either:

- VS Code UI: `Extensions: Install from VSIX...`
- CLI:

```bash
code --install-extension prompt-optimizer-vscode-lite-0.1.0.vsix
```

## 3-Minute Demo

### Demo 1: No selection required

1. Open any file in VS Code.
2. Run `Prompt Optimizer Lite: Optimize Prompt` without selecting text.
3. Paste a rough prompt in the input box.
4. Choose one action:
- `Insert At Cursor`
- `Copy To Clipboard`
- `Open Preview`

### Demo 2: Selection workflow

1. Select any rough prompt text in editor.
2. Run the same command.
3. Choose:
- `Replace Selection`
- `Copy To Clipboard`
- `Open Preview`

### Demo 3: Chat workflow

In VS Code Chat, type:

```text
@promptopt 把这段需求优化成可直接执行的高质量提示词：...
```

The extension will use the current chat model first.

## Typical Use Cases

- Turn product requirement notes into execution-ready prompts.
- Turn coding task ideas into structured coding-agent prompts.
- Turn writing outlines into prompts with output format + acceptance criteria.
- Turn ambiguous requests into prompts with assumptions, constraints, and checks.

## Fallback Behavior

1. Primary path:
- Use current VS Code chat model (`request.model.sendRequest(...)`) in chat participant mode.
- Use `vscode.lm.selectChatModels(...)` first in command mode.

2. Fallback path:
- Run `scripts/fallback_optimize.py`.

3. Emergency path:
- If Python is unavailable, use built-in template fallback.

Direct CLI fallback test:

```bash
python3 scripts/fallback_optimize.py --input "帮我做一个客服机器人提示词"
python3 scripts/smoke_test_fallback.py
```

## Settings

- `promptOptimizerLite.replaceSelection`
- `promptOptimizerLite.fallbackPythonCommand`

## Project Structure

```text
prompt-optimizer-vscode-lite/
├─ package.json
├─ tsconfig.json
├─ src/
│  └─ extension.ts
└─ scripts/
   ├─ fallback_optimize.py
   └─ smoke_test_fallback.py
```

## Development

```bash
npm install
npm run compile
```

Press `F5` to run in Extension Development Host.

## Star History

<a href="https://www.star-history.com/#Lab-Overflow/prompt-optimizer-lite&Date">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://api.star-history.com/svg?repos=Lab-Overflow/prompt-optimizer-lite&type=Date&theme=dark"
    />
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://api.star-history.com/svg?repos=Lab-Overflow/prompt-optimizer-lite&type=Date"
    />
    <img
      alt="Star History Chart"
      src="https://api.star-history.com/svg?repos=Lab-Overflow/prompt-optimizer-lite&type=Date"
    />
  </picture>
</a>
