#!/usr/bin/env python3
"""
One-time helper to obtain a Spotify refresh token for the now-playing API.

1. Create an app at https://developer.spotify.com/dashboard
2. Add redirect URI: http://127.0.0.1:8888/callback
3. Run: python screener/spotify_get_refresh_token.py
4. Paste Client ID and Client Secret when prompted
5. Authorize in the browser; copy the refresh token into Vercel env vars
"""

from __future__ import annotations

import base64
import json
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

REDIRECT_URI = "http://127.0.0.1:8888/callback"
SCOPES = "user-read-currently-playing user-read-recently-played"


class CallbackHandler(BaseHTTPRequestHandler):
    code: str | None = None

    def do_GET(self) -> None:
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        if "code" in params:
            CallbackHandler.code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                b"<h1>Spotify authorized</h1><p>You can close this tab and return to the terminal.</p>"
            )
        else:
            self.send_response(400)
            self.end_headers()

    def log_message(self, format: str, *args) -> None:
        return


def main() -> None:
    client_id = input("Spotify Client ID: ").strip()
    client_secret = input("Spotify Client Secret: ").strip()

    auth_params = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "response_type": "code",
            "redirect_uri": REDIRECT_URI,
            "scope": SCOPES,
        }
    )
    auth_url = f"https://accounts.spotify.com/authorize?{auth_params}"
    print("\nOpening browser for Spotify login...")
    webbrowser.open(auth_url)

    server = HTTPServer(("127.0.0.1", 8888), CallbackHandler)
    print("Waiting for authorization callback on http://127.0.0.1:8888/callback ...")
    while CallbackHandler.code is None:
        server.handle_request()

    code = CallbackHandler.code
    body = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
        }
    ).encode()

    auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    req = urllib.request.Request(
        "https://accounts.spotify.com/api/token",
        data=body,
        headers={
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        print(exc.read().decode())
        raise SystemExit(1) from exc

    refresh = data.get("refresh_token")
    if not refresh:
        print("No refresh token returned. Response:", json.dumps(data, indent=2))
        raise SystemExit(1)

    print("\n--- Add these to Vercel (Settings → Environment Variables) ---")
    print(f"SPOTIFY_CLIENT_ID={client_id}")
    print(f"SPOTIFY_CLIENT_SECRET={client_secret}")
    print(f"SPOTIFY_REFRESH_TOKEN={refresh}")
    print("\nThen set index.html meta spotify-api to your deployed URL, e.g.")
    print("https://your-project.vercel.app/api/now-playing")


if __name__ == "__main__":
    main()
