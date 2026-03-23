"""Simple JSON file cache with TTL support."""

import json
import hashlib
import time
from pathlib import Path
from typing import Any, Optional


CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / ".cache"


class FileCache:
    """File-based cache with TTL expiration."""

    def __init__(self, ttl_hours: float = 24.0, cache_dir: Optional[Path] = None):
        """Initialize cache.

        Args:
            ttl_hours: Time-to-live in hours for cached entries.
            cache_dir: Directory to store cache files.
        """
        self.ttl_seconds = ttl_hours * 3600
        self.cache_dir = cache_dir or CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _key_path(self, key: str) -> Path:
        """Get file path for a cache key."""
        hashed = hashlib.sha256(key.encode()).hexdigest()[:16]
        return self.cache_dir / f"{hashed}.json"

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a cached value if it exists and hasn't expired.

        Args:
            key: Cache key string.

        Returns:
            Cached value or None if miss/expired.
        """
        path = self._key_path(key)
        if not path.exists():
            return None
        try:
            with open(path, "r") as f:
                entry = json.load(f)
            if time.time() - entry["timestamp"] > self.ttl_seconds:
                path.unlink(missing_ok=True)
                return None
            return entry["data"]
        except (json.JSONDecodeError, KeyError):
            path.unlink(missing_ok=True)
            return None

    def set(self, key: str, data: Any):
        """Store a value in the cache.

        Args:
            key: Cache key string.
            data: JSON-serializable data to cache.
        """
        path = self._key_path(key)
        with open(path, "w") as f:
            json.dump({"timestamp": time.time(), "data": data}, f)

    def clear(self):
        """Remove all cached entries."""
        for p in self.cache_dir.glob("*.json"):
            p.unlink(missing_ok=True)
