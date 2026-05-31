# Prompt Optimizer Mini (VS Code Extension)

A lightweight prompt optimizer and model router for VS Code.
It can use your preferred OpenAI-compatible API, the current VS Code chat model, or an on-demand local GGUF model.

## Features

- **Zero Configuration** — Install from Marketplace and start optimizing immediately. If no remote model is available, the extension prepares a compact local model on demand.
- **Lightweight VSIX** — The extension package does not bundle model weights. The default local model is downloaded only when needed.
- **Model Router GUI** — Choose Auto, VS Code Chat, OpenAI-compatible API, Local Model, or Offline Template from the command palette.
- **Visible Optimization Trace** — Chat and preview views show the optimized prompt plus an expandable before/after route panel, so users can see what changed.
- **Bring Your Best Model** — Keep using stronger hosted models with your own base URL, API key, and model name. API keys are stored in VS Code SecretStorage.
- **Local GGUF Model** — Reuses Ollama or `llama-cli` when available. Otherwise downloads a `llama.cpp` runtime and the official `Qwen/Qwen3-1.7B-GGUF` `Q8_0` model (about 1.83 GB).
- **Few-Shot Templates** — Includes general, variable-driven, red-team review, and text-to-image prompt patterns.
- **Chat Participant** — Type `@promptopt` in VS Code Chat to optimize prompts conversationally.
- **Editor Command** — Select text and run the optimize command, or right-click for the context menu option.
- **Manual Input** — No selection needed. A prompt input box appears when no text is selected.
- **Multiple Output Options** — Replace selection, insert at cursor, copy to clipboard, or open as Markdown preview.
- **Resilient Fallback** — External API → VS Code Chat → Local GGUF model → Local Python template → Built-in template.

## Install

### From VS Code Marketplace (Recommended)

Search **"Prompt Optimizer Mini"** in VS Code Extensions, or install from [Marketplace page](https://marketplace.visualstudio.com/items?itemName=fullstack1ape.prompt-optimizer-mini).

### From Homebrew Tap

After the `v1.0.0` release and tap are published:

```bash
brew tap Lab-Overflow/prompt-optimizer
brew install prompt-optimizer-mini
promptopt install-extension
```

Run `promptopt` to see the ASCII startup animation and CLI commands. The longer `prompt-optimizer-mini` command is also available.

Agent-style usage in Codex or Claude Code:

```text
promptopt 帮我把这个需求优化成可执行 prompt：设计一个产品发布计划
```

### From Source

1. Clone and open this repo in VS Code.
2. Install dependencies and compile:

```bash
npm install
npm run compile
python3 -B -m unittest scripts/test_promptopt_stability.py scripts/test_agent_promptopt_contract.py scripts/test_local_model_manager.py
```

3. Press `F5` to launch **Extension Development Host**.

### Build and Install VSIX

```bash
npm run package
code --install-extension prompt-optimizer-mini-1.0.0.vsix
```

## Quick Demo

### Codex / Claude Code Adapter Setup

After installation, Prompt Optimizer Mini offers to enable managed workspace adapters. Confirm once to add or update small PromptOpt blocks in `AGENTS.md`, `CLAUDE.md`, and `.claude/commands/promptopt.md` without replacing unrelated project instructions.

You can also run:

```text
Prompt Optimizer Mini: Enable Codex / Claude Code Adapters
```

Reopen the Codex or Claude Code chat, then use:

```text
@promptopt 帮我把这个需求优化成可执行 prompt：设计一个产品发布计划
```

### Demo 1: Chat Workflow

In VS Code Chat, type:

```text
@promptopt Optimize this into an execution-ready prompt: build a customer service chatbot
```

The extension will use the current chat model to optimize your prompt.

### Demo 2: Editor Selection

1. Select any rough prompt text in your editor.
2. Run `Prompt Optimizer Mini: Optimize Prompt` from command palette.
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

## Model Router

Run these commands from the command palette:

| Command | Purpose |
|---------|---------|
| `Prompt Optimizer Mini: Choose Model Route` | Pick Auto, VS Code Chat, OpenAI-compatible API, Local Model, or Offline Template |
| `Prompt Optimizer Mini: Configure OpenAI-compatible Model` | Save base URL, model name, and API key |
| `Prompt Optimizer Mini: Setup Local Model` | Prepare the local runtime and GGUF before first use |
| `Prompt Optimizer Mini: Show Model Status` | Inspect current route and local model readiness |

The default `auto` route uses:

| Priority | Method | When |
|----------|--------|------|
| 1st | OpenAI-compatible API | When configured through the command palette |
| 2nd | VS Code chat model | When exposed by VS Code extension APIs |
| 3rd | Local GGUF model | Reuses Ollama or `llama-cli`; otherwise downloads runtime and model on demand |
| 4th | Local Python script (`scripts/fallback_optimize.py`) | Fast dependency-free structured formatter |
| 5th | Built-in template | When Python is unavailable |

## Local Model

The default local model is the official [`Qwen/Qwen3-1.7B-GGUF`](https://huggingface.co/Qwen/Qwen3-1.7B-GGUF) `Q8_0` file. It is intentionally compact enough for common 8 GB Apple Silicon Macs and laptops with 6 GB or more VRAM. The bootstrap script uses only the Python standard library and downloads files into the user cache directory, not the extension install directory.

Test local status and prompt rendering without downloading model weights:

```bash
python3 scripts/local_model_manager.py status
python3 scripts/local_model_manager.py render-prompt --input "请作为红队审查这个产品发布计划"
python3 scripts/fallback_optimize.py --input "build a customer service chatbot prompt"
python3 scripts/smoke_test_fallback.py
python3 -m unittest scripts/test_local_model_manager.py
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `promptOptimizerLite.replaceSelection` | boolean | `false` | Auto-replace selected text with optimized result |
| `promptOptimizerLite.fallbackPythonCommand` | string | `""` | Custom Python command (e.g., `/usr/bin/python3`) |
| `promptOptimizerLite.modelRoute` | string | `"auto"` | Model router strategy |
| `promptOptimizerLite.externalBaseUrl` | string | `""` | OpenAI-compatible API base URL |
| `promptOptimizerLite.externalModel` | string | `""` | OpenAI-compatible model name |
| `promptOptimizerLite.autoDownloadLocalModel` | boolean | `true` | Prepare local runtime and GGUF on demand |
| `promptOptimizerLite.localTemplate` | string | `"auto"` | Few-shot template selection |
| `promptOptimizerLite.showOptimizationTrace` | boolean | `true` | Show original prompt and model route alongside the optimized prompt in chat and preview |
| `promptOptimizerLite.offerAgentAdapterSetup` | boolean | `true` | Offer to add managed Codex and Claude Code workspace adapters |

## Project Structure

```text
prompt-optimizer-mini/
├─ package.json
├─ tsconfig.json
├─ src/
│  └─ extension.ts
└─ scripts/
   ├─ fallback_optimize.py
   ├─ few_shot_templates.json
   ├─ local_model_manager.py
   └─ smoke_test_fallback.py
├─ bin/
│  └─ promptopt
└─ homebrew/
   └─ Formula/
      └─ prompt-optimizer-mini.rb
```

## Development

```bash
npm install
npm run compile
```

Press `F5` to run in Extension Development Host.

## Maintainer

This project is led and maintained by **Lab-Overflow**.

- Email: frank_fullstack@calculatorcaloriefree.com
- Issues: https://github.com/Lab-Overflow/prompt-optimizer-lite/issues
