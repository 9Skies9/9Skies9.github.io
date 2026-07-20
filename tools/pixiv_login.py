#!/usr/bin/env python3
"""pixiv_login.py — interactive Pixiv OAuth login -> PIXIV_REFRESH_TOKEN

No selenium needed. Uses the public pixiv-android OAuth client (the flow
documented in ZipFile's Pixiv OAuth gist, referenced by pixivpy's README):

  1. this script opens Pixiv's login page in your browser
  2. you log in normally
  3. the browser redirects to a pixiv:// URL that "fails" to load — that's
     expected; copy the `code` parameter from that URL
  4. paste it here; the script exchanges it for tokens and writes
     PIXIV_REFRESH_TOKEN into the repo's .env

Run:  .venv/bin/python tools/pixiv_login.py
"""

import base64
import hashlib
import json
import re
import secrets
import sys
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"

CLIENT_ID = "MOBrBDS8blbauoSck0ZfDbtuzpyT"
CLIENT_SECRET = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj"
LOGIN_URL = "https://app-api.pixiv.net/web/v1/login"
TOKEN_URL = "https://oauth.secure.pixiv.net/auth/token"
REDIRECT_URI = "https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def main():
    verifier = b64url(secrets.token_bytes(32))
    challenge = b64url(hashlib.sha256(verifier.encode()).digest())

    url = (f"{LOGIN_URL}?code_challenge={challenge}"
           "&code_challenge_method=S256&client=pixiv-android")

    print("1. Opening Pixiv login in your browser...")
    print("   (if it didn't open, visit this URL manually:)\n")
    print(f"   {url}\n")
    webbrowser.open(url)

    print("2. Log in to Pixiv.")
    print("   The page will then redirect to a pixiv:// address and show an")
    print("   error / blank page — THAT'S EXPECTED.")
    print("   Copy the full URL from the address bar (or DevTools -> Network,")
    print("   the request starting with pixiv://account/login?code=...).\n")

    raw = input("3. Paste the pixiv:// URL (or just the code) here: ").strip()
    m = re.search(r"code=([A-Za-z0-9_-]+)", raw)
    code = m.group(1) if m else raw
    if not code:
        sys.exit("error: empty code")

    body = "&".join([
        f"client_id={CLIENT_ID}",
        f"client_secret={CLIENT_SECRET}",
        "grant_type=authorization_code",
        f"code={code}",
        f"redirect_uri={REDIRECT_URI}",
        f"code_verifier={verifier}",
        "include_policy=true",
    ]).encode()
    req = urllib.request.Request(TOKEN_URL, data=body, headers={
        "User-Agent": "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)",
        "Content-Type": "application/x-www-form-urlencoded",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.load(res)
    except urllib.error.HTTPError as e:
        sys.exit(f"error: token exchange failed: {e.code} {e.read().decode()[:300]}")

    refresh = data.get("refresh_token")
    if not refresh:
        sys.exit(f"error: no refresh_token in response: {data}")

    # upsert PIXIV_REFRESH_TOKEN in .env
    lines = []
    if ENV_FILE.exists():
        lines = [l for l in ENV_FILE.read_text().splitlines()
                 if not l.startswith("PIXIV_REFRESH_TOKEN=")]
    lines.append(f"PIXIV_REFRESH_TOKEN={refresh}")
    ENV_FILE.write_text("\n".join(lines) + "\n")

    print(f"\nOK! refresh token written to {ENV_FILE}")
    print(f"PIXIV_REFRESH_TOKEN={refresh}")


if __name__ == "__main__":
    main()
