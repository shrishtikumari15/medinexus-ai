import sys
from pathlib import Path

# Ensure the parent ml-service directory is in sys.path
service_dir = str(Path(__file__).resolve().parent.parent)
if service_dir not in sys.path:
    sys.path.insert(0, service_dir)

from main import app  # noqa: F401
