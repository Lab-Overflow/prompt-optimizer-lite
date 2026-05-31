# Prompt Optimizer Lite (VS Code Extension)

A lightweight prompt optimizer for VS Code.
It prioritizes the **current chat model** and automatically falls back to a **local Python optimizer** when model invocation fails.

## Features

- **Zero Configuration** — Install from Marketplace and start optimizing immediately.
- **Chat Participant** — Type `@promptopt` in VS Code Chat to optimize prompts conversationally.
- **Editor Command** — Select text and run the optimize command, or right-click for the context menu option.
- **Manual Input** — No selection needed. A prompt input box appears when no text is selected.
- **Multiple Output Options** — Replace selection, insert at cursor, copy to clipboard, or open as Markdown preview.
- **3-Layer Fallback** — Chat model → Local Python → Built-in template. Works even fully offline.

## Install

### From VS Code Marketplace (Recommended)

Search **"Prompt Optimizer Lite"** in VS Code Extensions, or install from [Marketplace page](https://marketplace.visualstudio.com/items?itemName=lab-overflow.prompt-optimizer-vscode-lite).

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
code --install-extension prompt-optimizer-vscode-lite-1.1.2.vsix
```

## Quick Demo

### Demo 1: Chat Workflow

In VS Code Chat, type:

```text
@promptopt Optimize this into an execution-ready prompt: build a customer service chatbot
```

The extension will use the current chat model to optimize your prompt.

### Demo 2: Editor Selection

1. Select any rough prompt text in your editor.
2. Run `Prompt Optimizer Lite: Optimize Prompt` from command palette.
3. Choose an action:
   - `Replace Selection`
   - `Insert At Cursor`
   - `Copy To Clipboard`
   - `Open Preview`

### Demo 3: Manual Input (No Selection)

1. Open any file in VS Code.
2. Run the command without selecting text.
3. Paste or type a rough prompt in the input box.
4. Choose an output action.

## Typical Use Cases

- Turn product requirement notes into execution-ready prompts.
- Turn coding task ideas into structured coding-agent prompts.
- Turn writing outlines into prompts with output format and acceptance criteria.
- Turn ambiguous requests into prompts with assumptions, constraints, and checks.

## Fallback Behavior

| Priority | Method | When |
|----------|--------|------|
| 1st | VS Code chat model | Default path |
| 2nd | Local Python script (`scripts/fallback_optimize.py`) | When model invocation fails |
| 3rd | Built-in template | When Python is also unavailable |

Test fallback directly:

```bash
python3 scripts/fallback_optimize.py --input "build a customer service chatbot prompt"
python3 scripts/smoke_test_fallback.py
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `promptOptimizerLite.replaceSelection` | boolean | `false` | Auto-replace selected text with optimized result |
| `promptOptimizerLite.fallbackPythonCommand` | string | `""` | Custom Python command (e.g., `/usr/bin/python3`) |

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

## Maintainer

This project is led and maintained by **Lab-Overflow**.

- About: https://www.calculatorcaloriefree.com/about
- Email: 1248578665@qq.com
- Issues: https://github.com/Lab-Overflow/prompt-optimizer-lite/issues
