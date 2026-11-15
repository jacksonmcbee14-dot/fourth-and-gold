#!/usr/bin/env python3
"""Run Fourth & Gold locally so you can test it on this computer and your phone.

Usage (from the project folder):   python3 tools/serve.py
Stop it with Control-C.

It serves the project folder, tells the browser never to cache (so your edits
always show up on reload), and prints the address to type on your phone.
Your phone must be on the same Wi-Fi as this computer.
"""
import functools
import http.server
import os
import socket
import socketserver
import sys
import webbrowser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTS = [8000, 8001, 8002, 8080, 8888]


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript",
        ".svg": "image/svg+xml",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep the window quiet except for errors
        if args and str(args[1]).startswith(("4", "5")):
            sys.stderr.write("  ! %s %s\n" % (args[1], args[0]))


def lan_ip():
    """Best guess at this computer's address on the Wi-Fi network."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # no data is sent
            return s.getsockname()[0]
    except OSError:
        return None


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    for port in PORTS:
        try:
            httpd = Server(("0.0.0.0", port), handler)
            break
        except OSError:
            continue
    else:
        sys.exit("Couldn't find a free port. Is Fourth & Gold already running in another window?")

    ip = lan_ip()
    print()
    print("  Fourth & Gold is running.")
    print()
    print("  On this computer:  http://localhost:%d" % port)
    if ip:
        print("  On your phone:     http://%s:%d   (same Wi-Fi)" % (ip, port))
    print()
    print("  Leave this window open while you play. Press Control-C to stop.")
    print()
    if "--no-open" not in sys.argv:
        webbrowser.open("http://localhost:%d" % port)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.")


if __name__ == "__main__":
    main()
