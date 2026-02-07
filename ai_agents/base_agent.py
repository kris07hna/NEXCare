"""
Base AI Agent for EdgeCare-5G
Production-grade base class with retry logic, error handling, and logging
"""

import os
import sys
import time
import json
import logging
import requests
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
import traceback
from functools import wraps
import signal


@dataclass
class AgentConfig:
    """Agent configuration"""
    agent_name: str
    room_id: str
    module: str
    server_url: str = "http://localhost:3000"
    camera_url: Optional[str] = None
    confidence_threshold: float = 0.7
    alert_threshold: int = 3
    check_interval: int = 5
    max_retries: int = 3
    retry_backoff: float = 2.0
    timeout: int = 30
    log_level: str = "INFO"


@dataclass
class DetectionResult:
    """Detection result structure"""
    status: str
    confidence: float
    predictions: Dict[str, Any]
    bbox: Optional[List[float]] = None
    alert_level: str = "normal"
    metadata: Optional[Dict[str, Any]] = None


class CircuitBreaker:
    """Circuit breaker pattern for fault tolerance"""

    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half_open

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "half_open"
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = func(*args, **kwargs)
            if self.state == "half_open":
                self.reset()
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.failure_count >= self.failure_threshold:
                self.state = "open"

            raise e

    def reset(self):
        self.failure_count = 0
        self.state = "closed"


def retry_with_backoff(max_retries: int = 3, backoff_factor: float = 2.0):
    """Decorator for retry logic with exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 0
            while attempt < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempt += 1
                    if attempt >= max_retries:
                        raise e

                    wait_time = backoff_factor ** attempt
                    logging.warning(
                        f"Attempt {attempt}/{max_retries} failed: {str(e)}. "
                        f"Retrying in {wait_time:.1f}s..."
                    )
                    time.sleep(wait_time)

            raise Exception(f"Failed after {max_retries} attempts")

        return wrapper
    return decorator


class BaseAIAgent(ABC):
    """Base class for all AI agents"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.running = False
        self.circuit_breaker = CircuitBreaker()
        self.consecutive_alerts = 0
        self.last_alert_time = None

        # Setup logging
        self.setup_logging()

        # Signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.shutdown_handler)
        signal.signal(signal.SIGTERM, self.shutdown_handler)

        self.logger.info(f"Initialized {config.agent_name} for {config.room_id}")

    def setup_logging(self):
        """Configure logging with rotating file handler"""
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)

        log_file = os.path.join(
            log_dir,
            f"{self.config.agent_name}_{self.config.room_id}_{datetime.now().strftime('%Y%m%d')}.log"
        )

        # Create logger
        self.logger = logging.getLogger(f"{self.config.agent_name}-{self.config.room_id}")
        self.logger.setLevel(getattr(logging, self.config.log_level))

        # File handler (with UTF-8 encoding)
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)

        # Console handler (with UTF-8 encoding for Windows)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        # Fix Windows console encoding for emojis
        if sys.platform == 'win32':
            import codecs
            sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        # Add handlers
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)

    @abstractmethod
    def process_frame(self, frame: Any) -> DetectionResult:
        """Process a single frame and return detection result"""
        pass

    @abstractmethod
    def initialize_model(self):
        """Load and initialize the AI model"""
        pass

    @retry_with_backoff(max_retries=3, backoff_factor=2.0)
    def send_report(self, result: DetectionResult) -> bool:
        """Send detection report to server with retry logic"""
        try:
            endpoint = f"{self.config.server_url}/api/reports"

            payload = {
                "room_id": self.config.room_id,
                "module": self.config.module,
                "status": result.status,
                "confidence": result.confidence,
                "timestamp": time.time(),
                "predictions": result.predictions if result.predictions else {},
                "bbox": result.bbox if result.bbox else None,
                "alert_level": result.alert_level,
                "metadata": result.metadata if result.metadata else {},
            }

            response = self.circuit_breaker.call(
                requests.post,
                endpoint,
                json=payload,
                timeout=self.config.timeout,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code in [200, 201]:
                self.logger.info(f">> Report sent: {result.status} (conf: {result.confidence:.2f})")
                return True
            else:
                self.logger.error(f"Failed to send report: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"Error sending report: {str(e)}\n{traceback.format_exc()}")
            raise e

    @retry_with_backoff(max_retries=3, backoff_factor=2.0)
    def check_server_health(self) -> bool:
        """Check if server is healthy"""
        try:
            response = self.circuit_breaker.call(
                requests.get,
                f"{self.config.server_url}/api/health",
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            self.logger.warning(f"Server health check failed: {str(e)}")
            return False

    def handle_alert(self, result: DetectionResult):
        """Handle alert logic with consecutive alert tracking"""
        if result.alert_level in ["warning", "critical"]:
            self.consecutive_alerts += 1

            if self.consecutive_alerts >= self.config.alert_threshold:
                self.logger.warning(
                    f"!! ALERT TRIGGERED: {result.status} "
                    f"(Confidence: {result.confidence:.2%}, "
                    f"Consecutive: {self.consecutive_alerts})"
                )
                self.last_alert_time = time.time()
                # Force send report on alert
                self.send_report(result)
                # Reset counter after sending alert
                self.consecutive_alerts = 0
        else:
            # Reset on normal status
            self.consecutive_alerts = 0

    def run(self):
        """Main agent loop"""
        self.running = True
        self.logger.info(f">> Starting {self.config.agent_name} for {self.config.room_id}")

        # Check server connectivity
        if not self.check_server_health():
            self.logger.error("Server is not reachable. Exiting...")
            return

        # Initialize AI model
        try:
            self.initialize_model()
            self.logger.info(">> Model initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize model: {str(e)}")
            return

        frame_count = 0
        error_count = 0
        max_errors = 10

        while self.running:
            try:
                start_time = time.time()

                # Get frame (implementation in subclass)
                frame = self.get_frame()

                if frame is not None:
                    # Process frame
                    result = self.process_frame(frame)

                    # Handle alerts
                    self.handle_alert(result)

                    # Send report (every N frames or on alert)
                    if frame_count % 10 == 0 or result.alert_level != "normal":
                        self.send_report(result)

                    frame_count += 1
                    error_count = 0  # Reset error counter on success

                    # Log progress every 100 frames
                    if frame_count % 100 == 0:
                        self.logger.info(f"Processed {frame_count} frames")

                # Sleep to maintain check interval
                elapsed = time.time() - start_time
                sleep_time = max(0, self.config.check_interval - elapsed)
                time.sleep(sleep_time)

            except KeyboardInterrupt:
                self.logger.info("Received keyboard interrupt")
                break
            except Exception as e:
                error_count += 1
                self.logger.error(f"Error in main loop: {str(e)}\n{traceback.format_exc()}")

                if error_count >= max_errors:
                    self.logger.critical(f"Too many errors ({error_count}). Shutting down...")
                    break

                time.sleep(5)  # Wait before retrying

        self.cleanup()

    @abstractmethod
    def get_frame(self) -> Optional[Any]:
        """Get next frame from camera/source"""
        pass

    def cleanup(self):
        """Cleanup resources"""
        self.logger.info(f">> Shutting down {self.config.agent_name}")
        self.running = False

    def shutdown_handler(self, signum, frame):
        """Handle shutdown signals"""
        self.logger.info(f"Received signal {signum}")
        self.running = False
