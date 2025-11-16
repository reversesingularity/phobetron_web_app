#!/usr/bin/env python3
"""
HTTP Proxy Server for Celestial Signs API

This server provides a stable HTTP interface to the FastAPI application
by using TestClient internally, bypassing uvicorn stability issues.
"""

import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
import threading
import time

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from app.main import app

class APIProxyHandler(BaseHTTPRequestHandler):
    """HTTP request handler that proxies to FastAPI TestClient."""

    def __init__(self, *args, client=None, **kwargs):
        self.client = client
        super().__init__(*args, **kwargs)

    def do_GET(self):
        """Handle GET requests."""
        self._handle_request('GET')

    def do_POST(self):
        """Handle POST requests."""
        self._handle_request('POST')

    def do_PUT(self):
        """Handle PUT requests."""
        self._handle_request('PUT')

    def do_DELETE(self):
        """Handle DELETE requests."""
        self._handle_request('DELETE')

    def do_OPTIONS(self):
        """Handle OPTIONS requests."""
        self._handle_request('OPTIONS')

    def _handle_request(self, method):
        """Handle HTTP request by proxying to TestClient."""
        try:
            # Parse the request
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            query_params = parse_qs(parsed_url.query)

            # Convert query params to dict (take first value for each param)
            params = {k: v[0] for k, v in query_params.items()}

            # Make request to TestClient
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
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            error_response = {
                'error': 'Proxy server error',
                'message': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode())

    def log_message(self, format, *args):
        """Override to reduce log noise."""
        if 'health' not in format:  # Don't log health checks
            super().log_message(format, *args)


def run_proxy_server(host='localhost', port=8020):
    """Run the HTTP proxy server."""
    print(f"Starting Celestial Signs API Proxy Server on {host}:{port}")
    print("This server uses FastAPI TestClient internally for stability.")

    # Create TestClient
    client = TestClient(app)

    # Test the client
    try:
        response = client.get('/health')
        if response.status_code == 200:
            print("✓ TestClient connection successful")
        else:
            print(f"✗ TestClient health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"✗ TestClient initialization failed: {e}")
        return

    # Create custom handler class with client
    class HandlerWithClient(APIProxyHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, client=client, **kwargs)

    # Start server
    try:
        server = HTTPServer((host, port), HandlerWithClient)
        print(f"🚀 Server running at http://{host}:{port}")
        print("Press Ctrl+C to stop")

        server.serve_forever()

    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()
    except Exception as e:
        print(f"Server error: {e}")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Celestial Signs API Proxy Server')
    parser.add_argument('--host', default='localhost', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8020, help='Port to bind to')

    args = parser.parse_args()

    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
    os.chdir(backend_dir)

    run_proxy_server(args.host, args.port)