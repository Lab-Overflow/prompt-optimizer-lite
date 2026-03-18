# Prompt Optimizer Lite (VS Code Extension)

A lightweight prompt optimizer that prioritizes the **current chat model** and falls back to a **local Python optimizer** if model invocation fails.

## Core Behavior

1. Chat mode (`@promptopt`):
- Uses `request.model.sendRequest(...)`.
- This means it follows the model selected in the current VS Code Chat session.

2. Editor mode (`Prompt Optimizer Lite: Optimize Selection`):
- Tries `vscode.lm.selectChatModels(...)` first.
- If no model is available or authorization fails, falls back to Python.

3. Failure fallback:
- Runs `scripts/fallback_optimize.py`.
- If Python is unavailable, uses a built-in emergency template.

## Why this design

- Main path: best quality from active chat model.
- Fallback path: no API key needed, survives auth/network/quota failures.
- Keeps architecture small and easy to publish.

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

Press `F5` in VS Code to launch Extension Development Host.

## Usage

### Chat participant

In Chat, type:

```text
@promptopt 帮我把这个需求改成可执行的高质量提示词：...
```

### Editor command

1. Select text in editor.
2. Run `Prompt Optimizer Lite: Optimize Selection`.
3. Choose replace/copy/preview.

## Python fallback

Direct CLI usage:

```bash
python3 scripts/fallback_optimize.py --input "帮我做一个客服机器人提示词"
```

Smoke test:

```bash
python3 scripts/smoke_test_fallback.py
```

## Settings

- `promptOptimizerLite.replaceSelection`: replace selected text directly.
- `promptOptimizerLite.fallbackPythonCommand`: override python command path.
