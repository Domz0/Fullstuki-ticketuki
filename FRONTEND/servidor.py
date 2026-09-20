"""
Servidor de desarrollo para el frontend.

Igual que `python3 -m http.server`, pero mandando Cache-Control: no-store en
cada respuesta. Sin esa cabecera el navegador guarda el CSS y el JS y sigue
mostrando la version vieja aunque el archivo ya haya cambiado en disco.

Uso:
    python3 servidor.py          # queda en http://localhost:5500
    python3 servidor.py 5501     # en otro puerto
"""

import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class SinCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
    print(f"Frontend en http://localhost:{puerto}  (sin cache) — Ctrl+C para parar")
    HTTPServer(("", puerto), SinCache).serve_forever()
