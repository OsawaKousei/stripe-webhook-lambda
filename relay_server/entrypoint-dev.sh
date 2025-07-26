#!/bin/bash
set -e

# プロジェクトのライブラリをインストール
cd /app
uv sync --all-extras

# FastAPIサーバーを起動
cd /app
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload