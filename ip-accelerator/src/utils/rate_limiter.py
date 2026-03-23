"""Rate limiter for API calls."""

import time
import threading


class RateLimiter:
    """Thread-safe rate limiter using token bucket algorithm."""

    def __init__(self, calls_per_second: float = 0.33):
        """Initialize rate limiter.

        Args:
            calls_per_second: Maximum number of calls per second.
        """
        self.min_interval = 1.0 / calls_per_second
        self._lock = threading.Lock()
        self._last_call = 0.0

    def wait(self):
        """Block until a call is allowed under the rate limit."""
        with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_call
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)
            self._last_call = time.monotonic()
