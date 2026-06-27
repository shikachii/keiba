#!/usr/bin/env python3
"""
競馬JSONサーバー — Chrome拡張からのデータをkeiba/races/以下に保存する
使い方: python3 tools/server.py
"""
import json
import pathlib
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 3500
BASE = pathlib.Path(__file__).parent.parent  # keiba/


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._cors(200)

    def do_POST(self):
        if self.path != '/save':
            self._cors(404)
            return

        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))

        rel_path = body.get('path', '')
        data     = body.get('data')

        if not rel_path or data is None:
            self._respond(400, {'ok': False, 'error': 'path / data が必要です'})
            return

        dest = BASE / 'races' / rel_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

        print(f'✅ 保存: {dest}')
        self._respond(200, {'ok': True, 'path': str(dest)})

    def _respond(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self._cors(code)
        self.wfile.write(body)

    def _cors(self, code):
        self.send_response(code)
        self.send_header('Access-Control-Allow-Origin',  '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def log_message(self, fmt, *args):
        pass  # アクセスログを抑制


if __name__ == '__main__':
    print(f'🏇 競馬JSONサーバー起動 → http://localhost:{PORT}')
    print(f'   保存先: {BASE / "races"}')
    HTTPServer(('localhost', PORT), Handler).serve_forever()
