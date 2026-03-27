# Prompt Optimizer Lite

A lightweight VS Code extension that transforms rough ideas into high-quality, execution-ready prompts — powered by your current chat model with automatic local fallback.

## Install

### From VS Code Marketplace (Recommended)

Search **"Prompt Optimizer Lite"** in VS Code Extensions, or install via CLI:

```bash
code --install-extension lab-overflow.prompt-optimizer-vscode-lite
```

### From Source

1. Clone and open this repo in VS Code.
2. Install dependencies and compile:

```bash
npm install
npm run compile
```

3. Press `F5` to launch **Extension Development Host**.

### Build and Install VSIX

```bash
npm run package
code --install-extension prompt-optimizer-vscode-lite-1.0.1.vsix
```

## Features

- **Zero Configuration** — Install and start optimizing. No API keys, no external services, no account registration.
- **Chat Participant** — Type `@promptopt` in VS Code Chat to optimize prompts conversationally.
- **Editor Command** — Select text and run `Prompt Optimizer Lite: Optimize Prompt` from the command palette, or right-click for the context menu option.
- **Manual Input** — No selection needed. Run the command without selecting text and a prompt input box will appear.
- **Multiple Output Options** — Replace selection, insert at cursor, copy to clipboard, or open as a Markdown preview.
- **3-Layer Fallback** — Primary: current VS Code chat model → Fallback: local Python optimizer → Emergency: built-in structured template. Works even fully offline.

## How to Use

### Method 1: Chat Participant

Open VS Code Chat and type:

```text
@promptopt Optimize this into an execution-ready prompt: build a customer service chatbot
```

The extension uses the current chat model (Copilot, Codex, Claude, etc.) to optimize your prompt.

### Method 2: Editor Command

1. **With selection**: Select rough prompt text in your editor → Run `Prompt Optimizer Lite: Optimize Prompt` from command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), or right-click and select from the context menu.
2. **Without selection**: Run the same command → A prompt input box appears for you to type or paste your rough prompt.
3. Choose an output action:
   - `Replace Selection` — Overwrite the selected text with the optimized prompt
   - `Insert At Cursor` — Insert the optimized prompt at the current cursor position
   - `Copy To Clipboard` — Copy to clipboard for use anywhere
   - `Open Preview` — Open as a Markdown document for review

## Typical Use Cases

- Turn product requirement notes into execution-ready prompts
- Turn coding task ideas into structured coding-agent prompts
- Turn writing outlines into prompts with output format and acceptance criteria
- Turn ambiguous requests into prompts with assumptions, constraints, and verification checks

## Fallback Behavior

| Priority | Method | When |
|----------|--------|------|
| 1st | VS Code chat model | Default — uses `request.model` in chat, `vscode.lm.selectChatModels()` in command mode |
| 2nd | Local Python script | When model invocation fails — runs `scripts/fallback_optimize.py` locally |
| 3rd | Built-in template | When Python is also unavailable — generates a structured prompt template |

This 3-layer fallback ensures the extension **always produces a result**, even without network access.

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `promptOptimizerLite.replaceSelection` | boolean | `false` | When `true`, automatically replace selected text with the optimized result. When `false`, show an action picker to choose the output destination. |
| `promptOptimizerLite.fallbackPythonCommand` | string | `""` | Custom Python command for fallback execution (e.g., `/usr/bin/python3`). Leave empty to auto-detect `python3` or `python`. |

## Requirements

- VS Code `1.105.0` or later
- A VS Code chat model provider (Copilot, Codex, or any Claude-compatible chat provider) for primary optimization
- Python `3.x` (optional, for fallback optimization when model is unavailable)

## Links

- [Source Code](https://github.com/Lab-Overflow/prompt-optimizer-lite)
- [Report Issues](https://github.com/Lab-Overflow/prompt-optimizer-lite/issues)
- [License (Apache-2.0)](https://github.com/Lab-Overflow/prompt-optimizer-lite/blob/main/LICENSE)
