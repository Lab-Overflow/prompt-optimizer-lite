#!/usr/bin/env python3
"""
Simple smoke test for fallback optimizer.
"""

from __future__ import annotations

import subprocess
from pathlib import Path


def main() -> int:
    script = Path(__file__).parent / "fallback_optimize.py"
    sample = """帮我写一个后端接口
- 必须返回 JSON
- 要有错误处理
- 需要给出测试方案"""

    proc = subprocess.run(
        ["python3", str(script), "--input", sample],
        capture_output=True,
        text=True,
        check=False,
    )
    print("exit:", proc.returncode)
    print("--- stdout ---")
    print(proc.stdout[:800])
    print("--- stderr ---")
    print(proc.stderr[:800])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
