#!/usr/bin/env python3
"""
Local fallback optimizer for Prompt Optimizer Lite.

This script is intentionally dependency-free so it works in constrained
environments when LM API calls fail (authorization/network/quota issues).
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from typing import List


@dataclass
class PromptParts:
    objective: str
    constraints: List[str]
    output_format: List[str]
    context_hints: List[str]


def has_cjk(text: str) -> bool:
    return bool(re.search(r"[\u4e00-\u9fff]", text))


def clean_lines(text: str) -> List[str]:
    lines = [ln.strip() for ln in text.replace("\r\n", "\n").split("\n")]
    return [ln for ln in lines if ln]


def extract_parts(raw: str) -> PromptParts:
    lines = clean_lines(raw)
    objective = lines[0] if lines else "完成用户请求并产出高质量结果"

    constraints: List[str] = []
    context_hints: List[str] = []
    output_format: List[str] = []

    bullet_pat = re.compile(r"^[-*•]\s+(.+)$")
    numbered_pat = re.compile(r"^\d+\.\s+(.+)$")

    for line in lines[1:]:
        bullet = bullet_pat.match(line) or numbered_pat.match(line)
        payload = bullet.group(1).strip() if bullet else line

        lower = payload.lower()
        if any(k in lower for k in ("json", "markdown", "table", "yaml", "csv")):
            output_format.append(payload)
            continue

        if any(
            k in lower
            for k in ("must", "should", "不能", "必须", "限制", "约束", "不要", "strict", "required")
        ):
            constraints.append(payload)
            continue

        if len(payload) <= 120:
            context_hints.append(payload)

    if not constraints:
        constraints = [
            "保留用户原始意图，不擅自改变目标。",
            "结论必须可执行、可验证，避免空泛描述。",
            "信息不足时先声明关键假设，再继续输出。"
        ]

    if not output_format:
        output_format = [
            "先给出简明结果摘要（3-5条）。",
            "再给出分步骤执行方案。",
            "最后给出验收标准与风险提示。"
        ]

    if not context_hints:
        context_hints = ["如有领域约定，优先遵循该领域最佳实践。"]

    return PromptParts(
        objective=objective,
        constraints=constraints,
        output_format=output_format,
        context_hints=context_hints,
    )


def render_zh(parts: PromptParts, raw: str) -> str:
    constraints = "\n".join(f"- {x}" for x in parts.constraints)
    outfmt = "\n".join(f"- {x}" for x in parts.output_format)
    ctx = "\n".join(f"- {x}" for x in parts.context_hints)

    return f"""# 角色
你是一位资深 Prompt 工程师与任务规划专家，擅长把模糊需求改写为可执行提示词。

# 目标
{parts.objective}

# 原始需求
{raw.strip()}

# 上下文补充
{ctx}

# 约束条件
{constraints}

# 输出格式要求
{outfmt}

# 执行步骤
1. 先复述任务目标与边界，确保与用户意图一致。
2. 将任务拆分为可执行子步骤，并明确每步输入与产出。
3. 对关键决策给出理由；若存在不确定性，列出假设与备选方案。
4. 在结尾给出可检查的验收标准（Definition of Done）。

# 输出规则
- 只输出优化后的提示词正文，不要解释你在做什么。
- 默认中文输出；若用户明确要求英文则切换英文。"""


def render_en(parts: PromptParts, raw: str) -> str:
    constraints = "\n".join(f"- {x}" for x in parts.constraints)
    outfmt = "\n".join(f"- {x}" for x in parts.output_format)
    ctx = "\n".join(f"- {x}" for x in parts.context_hints)

    return f"""# Role
You are a senior prompt engineer and execution planner who rewrites vague requests into production-ready prompts.

# Objective
{parts.objective}

# Original Request
{raw.strip()}

# Context Additions
{ctx}

# Constraints
{constraints}

# Output Format
{outfmt}

# Workflow
1. Restate the task objective and boundaries.
2. Break down the task into executable steps with explicit inputs and outputs.
3. Provide rationale for key decisions; list assumptions where data is missing.
4. End with measurable acceptance criteria.

# Output Rules
- Output only the optimized prompt body.
- Keep language concise, actionable, and testable."""


def main() -> int:
    parser = argparse.ArgumentParser(description="Fallback prompt optimizer")
    parser.add_argument("--stdin", action="store_true", help="Read source prompt from stdin")
    parser.add_argument("--input", default="", help="Source prompt text")
    args = parser.parse_args()

    source = args.input
    if args.stdin:
        source = sys.stdin.read()

    source = (source or "").strip()
    if not source:
        print("Input prompt is empty.", file=sys.stderr)
        return 2

    parts = extract_parts(source)
    if has_cjk(source):
        print(render_zh(parts, source))
    else:
        print(render_en(parts, source))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
