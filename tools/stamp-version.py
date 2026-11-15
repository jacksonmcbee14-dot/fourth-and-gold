#!/usr/bin/env python3
"""Give every style and script file in index.html a fresh version tag (?v=...).

Run this right before publishing:   python3 tools/stamp-version.py
Phones then fetch the new files instead of reusing old saved copies, so they never
mix old and new pieces of the app.
"""
import os
import re
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(ROOT, "index.html")
version = time.strftime("%Y%m%d%H%M%S")
with open(path, encoding="utf-8") as f:
    html = f.read()
html, n = re.subn(r'((?:href|src)="(?:css|js)/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?"', r'\1?v=' + version + '"', html)
with open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("Stamped %d files with version %s" % (n, version))
