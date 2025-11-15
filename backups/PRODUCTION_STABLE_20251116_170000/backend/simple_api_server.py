#!/usr/bin/env python3
"""
Simple API Proxy Server for Celestial Signs

A stable HTTP server that proxies requests to FastAPI TestClient.
"""

import sys
import os
import json
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add backend to path
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

class SimpleAPIHandler(BaseHTTPRequestHandler):
    """Simple HTTP handler that proxies to TestClient."""

    def __init__(self, *args, client=None, **kwargs):
        self.client = client or TestClient(app)
        super().__init__(*args, **kwargs)

    def do_GET(self):
        """Handle GET requests."""
        self._proxy_request('GET')

    def do_POST(self):
        """Handle POST requests."""
        self._proxy_request('POST')

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def _proxy_request(self, method):
        """Proxy the request to TestClient."""
        try:
            # Parse URL
            parsed = urlparse(self.path)
            path = parsed.path
            query = parse_qs(parsed.query)

            # Convert query params
            params = {k: v[0] if v else '' for k, v in query.items()}

            # Make request
            response = self.client.request(method, path, params=params)

            # Send response
            self.send_response(response.status_code)
            self.send_header('Content-Type', response.headers.get('content-type', 'application/json'))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.end_headers()

            self.wfile.write(response.content)

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error = {'error': str(e)}
            self.wfile.write(json.dumps(error).encode())

    def log_message(self, format, *args):
        """Reduce log noise."""
        pass


def run_server(host='localhost', port=8070):
    """Run the simple proxy server."""
    print(f"🌟 Starting Celestial Signs API Proxy Server")
    print(f"📍 Server: http://{host}:{port}")
    print(f"🔧 Backend: FastAPI TestClient (stable)")

    # Test client
    client = TestClient(app)
    response = client.get('/health')
    if response.status_code != 200:
        print(f"❌ TestClient health check failed: {response.status_code}")
        return

    print("✅ TestClient ready")

    # Create handler with client
    class HandlerWithClient(SimpleAPIHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, client=client, **kwargs)

    # Start server
    server = HTTPServer((host, port), HandlerWithClient)
    print("🚀 Server running! Press Ctrl+C to stop")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
        server.shutdown()


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Simple API Proxy Server')
    parser.add_argument('--host', default='localhost', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8070, help='Port to bind to')

    args = parser.parse_args()

    # Change to backend directory
    os.chdir(backend_dir)

    run_server(args.host, args.port)