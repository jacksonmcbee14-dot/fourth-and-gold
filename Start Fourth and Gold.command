#!/bin/bash
# Double-click this file in Finder to run Fourth & Gold locally.
cd "$(dirname "$0")" || exit 1
python3 tools/serve.py
