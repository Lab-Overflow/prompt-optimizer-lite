import * as path from 'node:path';
import { spawn } from 'node:child_process';
import * as vscode from 'vscode';

const PARTICIPANT_ID = 'prompt-optimizer-lite.promptOptimizer';
const COMMAND_OPTIMIZE_SELECTION = 'promptOptimizerLite.optimizeSelection';

const SENIOR_PROMPT_ENGINEER_INSTRUCTION = `你是一位资深 Prompt 工程师。你的任务是把用户输入的粗糙需求，优化成可直接给大模型使用的高质量提示词。

必须遵守：
1. 保留用户核心意图，不改变任务目标。
2. 自动补齐执行上下文：目标、输入、约束、输出格式、验收标准。
3. 输出结构清晰、可执行，避免空泛措辞。
4. 不回答任务本身，只输出“优化后的提示词”。
5. 默认使用中文输出，除非用户原文明确要求英文。`;

export function activate(context: vscode.ExtensionContext): void {
  const participant = vscode.chat.createChatParticipant(
    PARTICIPANT_ID,
    async (request, _chatContext, stream, token) => {
      const sourcePrompt = request.prompt.trim();

      if (!sourcePrompt) {
        stream.markdown('请先输入你要优化的原始 prompt。');
        return;
      }

      try {
        const optimized = await optimizeWithModel(request.model, sourcePrompt, token);
        stream.markdown(optimized);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        stream.markdown(`模型调用失败，切换本地 fallback：\`${escapeInlineCode(msg)}\``);
      }

      try {
        const fallback = await optimizeWithPythonFallback(context.extensionUri, sourcePrompt);
        stream.markdown(fallback);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        stream.markdown(`Python fallback 失败，切换内置兜底模板：\`${escapeInlineCode(msg)}\``);
        stream.markdown(buildEmergencyFallback(sourcePrompt));
      }
    }
  );

  context.subscriptions.push(participant);

  const optimizeSelectionCmd = vscode.commands.registerCommand(
    COMMAND_OPTIMIZE_SELECTION,
    async () => {
      const editor = vscode.window.activeTextEditor;
      let sourcePrompt = '';
      let selectionForReplace: vscode.Selection | undefined;

      if (editor && !editor.selection.isEmpty) {
        const selectedText = editor.document.getText(editor.selection).trim();
        if (selectedText) {
          sourcePrompt = selectedText;
          selectionForReplace = editor.selection;
        } else {
          vscode.window.showWarningMessage('选中内容为空，将改为手动输入。');
        }
      }

      if (!sourcePrompt) {
        const manualInput = await vscode.window.showInputBox({
          title: 'Prompt Optimizer Lite',
          prompt: 'Paste or type the raw prompt you want to optimize',
          placeHolder: 'Example: 帮我写一个可执行的客服机器人提示词',
          ignoreFocusOut: true
        });

        if (!manualInput?.trim()) {
          vscode.window.showWarningMessage('没有可优化的输入内容。');
          return;
        }

        sourcePrompt = manualInput.trim();
      }

      const optimized = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Prompt Optimizer Lite: Optimizing...'
        },
        async () => optimizeForEditorCommand(context.extensionUri, sourcePrompt)
      );

      const replaceSelection = vscode.workspace
        .getConfiguration('promptOptimizerLite')
        .get<boolean>('replaceSelection', false);

      if (replaceSelection && editor && selectionForReplace) {
        await editor.edit((editBuilder) => {
          editBuilder.replace(selectionForReplace, optimized);
        });
        return;
      }

      const actions: string[] = [];
      if (editor && selectionForReplace) {
        actions.push('Replace Selection');
      }
      if (editor) {
        actions.push('Insert At Cursor');
      }
      actions.push('Copy To Clipboard', 'Open Preview');

      const action = await vscode.window.showQuickPick(
        actions,
        {
          placeHolder:
            selectionForReplace && editor
              ? 'Choose what to do with optimized prompt'
              : 'No selection found. Choose where to put optimized prompt'
        }
      );

      if (action === 'Replace Selection' && editor && selectionForReplace) {
        await editor.edit((editBuilder) => {
          editBuilder.replace(selectionForReplace, optimized);
        });
        return;
      }

      if (action === 'Insert At Cursor' && editor) {
        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, optimized);
        });
        return;
      }

      if (action === 'Copy To Clipboard') {
        await vscode.env.clipboard.writeText(optimized);
        vscode.window.showInformationMessage('Optimized prompt copied to clipboard.');
        return;
      }

      if (action === 'Open Preview') {
        const doc = await vscode.workspace.openTextDocument({
          language: 'markdown',
          content: optimized
        });
        await vscode.window.showTextDocument(doc, { preview: true });
      }
    }
  );

  context.subscriptions.push(optimizeSelectionCmd);
}

export function deactivate(): void {
  // no-op
}

async function optimizeForEditorCommand(
  extensionUri: vscode.Uri,
  sourcePrompt: string
): Promise<string> {
  try {
    const models = await vscode.lm.selectChatModels({});
    if (models.length === 0) {
      throw new Error('No chat model is available to extension APIs.');
    }

    const cts = new vscode.CancellationTokenSource();
    try {
      return await optimizeWithModel(models[0], sourcePrompt, cts.token);
    } finally {
      cts.dispose();
    }
  } catch {
    try {
      return await optimizeWithPythonFallback(extensionUri, sourcePrompt);
    } catch {
      return buildEmergencyFallback(sourcePrompt);
    }
  }
}

async function optimizeWithModel(
  model: vscode.LanguageModelChat,
  sourcePrompt: string,
  token: vscode.CancellationToken
): Promise<string> {
  const messages: vscode.LanguageModelChatMessage[] = [
    vscode.LanguageModelChatMessage.User(SENIOR_PROMPT_ENGINEER_INSTRUCTION),
    vscode.LanguageModelChatMessage.User(
      `请优化以下原始 prompt，并严格只输出优化后的提示词正文，不要额外解释。\n\n原始 prompt：\n${sourcePrompt}`
    )
  ];

  const response = await model.sendRequest(messages, {}, token);
  let text = '';

  for await (const chunk of response.text) {
    text += chunk;
  }

  const normalized = text.trim();
  if (!normalized) {
    throw new Error('Model response is empty.');
  }

  return normalized;
}

async function optimizeWithPythonFallback(
  extensionUri: vscode.Uri,
  sourcePrompt: string
): Promise<string> {
  const scriptPath = path.join(extensionUri.fsPath, 'scripts', 'fallback_optimize.py');
  const configuredPython = vscode.workspace
    .getConfiguration('promptOptimizerLite')
    .get<string>('fallbackPythonCommand', '')
    .trim();

  const candidates = configuredPython ? [configuredPython] : ['python3', 'python'];
  const failures: string[] = [];

  for (const cmd of candidates) {
    try {
      const out = await runPython(cmd, scriptPath, sourcePrompt);
      if (out.trim()) {
        return out.trim();
      }
      failures.push(`${cmd}: empty output`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${cmd}: ${msg}`);
    }
  }

  throw new Error(failures.join(' | '));
}

function runPython(command: string, scriptPath: string, sourcePrompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [scriptPath, '--stdin'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      const detail = stderr.trim() || `exit code ${code ?? 'unknown'}`;
      reject(new Error(detail));
    });

    child.stdin.write(sourcePrompt);
    child.stdin.end();
  });
}

function buildEmergencyFallback(sourcePrompt: string): string {
  return `# 角色
你是一名资深领域专家，面向有经验的执行者提供可落地方案。

# 任务
基于以下需求完成高质量输出：
${sourcePrompt}

# 上下文
- 如信息缺失，先列出关键假设并继续完成任务。
- 优先使用可验证、可执行、可复现的方法。

# 约束
- 不偏离用户核心目标。
- 结论要有依据，避免空泛表述。
- 输出中显式给出边界条件与风险点。

# 输出格式
1. 结果摘要（3-5条）
2. 详细方案（按步骤）
3. 可执行清单（含优先级）
4. 验收标准

# 质量检查
- 是否保留原始意图
- 是否可直接执行
- 是否包含验收标准`;
}

function escapeInlineCode(text: string): string {
  return text.replace(/`/g, '\\`');
}
