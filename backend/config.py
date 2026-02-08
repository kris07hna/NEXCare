"""
Professional Backend Server Configuration
Loads environment variables and provides configuration management
"""

import os
from dotenv import load_dotenv
import logging
from pathlib import Path

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent

class Config:
    """Base configuration class"""
    
    # ===== SERVER CONFIGURATION =====
    SERVER_HOST = os.getenv('SERVER_HOST', '0.0.0.0')
    SERVER_PORT = int(os.getenv('SERVER_PORT', 5000))
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # ===== NETWORK CONFIGURATION =====
    CENTRAL_SERVER_IP = os.getenv('CENTRAL_SERVER_IP', '10.107.51.130')
    CENTRAL_SERVER_PORT = int(os.getenv('CENTRAL_SERVER_PORT', 3000))
    CENTRAL_SERVER_URL = os.getenv('CENTRAL_SERVER_URL', f'http://{CENTRAL_SERVER_IP}:{CENTRAL_SERVER_PORT}')
    NETWORK_INTERFACE = os.getenv('NETWORK_INTERFACE', '0.0.0.0')
    
    # ===== ARDUINO CONFIGURATION =====
    ARDUINO_PORT = os.getenv('ARDUINO_PORT', 'COM6')
    ARDUINO_BAUDRATE = int(os.getenv('ARDUINO_BAUDRATE', 9600))
    ARDUINO_TIMEOUT = int(os.getenv('ARDUINO_TIMEOUT', 1))
    ARDUINO_FALLBACK_PORTS = os.getenv('ARDUINO_FALLBACK_PORTS', 'COM7,COM6,COM3,COM4,COM5').split(',')
    
    # ===== CAMERA CONFIGURATION =====
    CAMERA_INDEX = int(os.getenv('CAMERA_INDEX', 0))
    CAMERA_FPS = int(os.getenv('CAMERA_FPS', 30))
    CAMERA_WIDTH = int(os.getenv('CAMERA_WIDTH', 640))
    CAMERA_HEIGHT = int(os.getenv('CAMERA_HEIGHT', 480))
    
    # ===== AI/ML CONFIGURATION =====
    MEDIAPIPE_MAX_FACES = int(os.getenv('MEDIAPIPE_MAX_FACES', 1))
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE = float(os.getenv('MEDIAPIPE_MIN_DETECTION_CONFIDENCE', 0.5))
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE = float(os.getenv('MEDIAPIPE_MIN_TRACKING_CONFIDENCE', 0.5))
    EAR_THRESHOLD = float(os.getenv('EAR_THRESHOLD', 0.25))
    
    # ===== CORS CONFIGURATION =====
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # ===== SECURITY =====
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    API_TOKEN = os.getenv('API_TOKEN', '')
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))
    
    # ===== LOGGING =====
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/backend.log')
    LOG_MAX_SIZE = int(os.getenv('LOG_MAX_SIZE', 10485760))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    
    # ===== DATABASE =====
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///neocare.db')
    
    # ===== MONITORING =====
    HEALTH_CHECK_ENABLED = os.getenv('HEALTH_CHECK_ENABLED', 'true').lower() == 'true'
    HEALTH_CHECK_INTERVAL = int(os.getenv('HEALTH_CHECK_INTERVAL', 60))
    METRICS_ENABLED = os.getenv('METRICS_ENABLED', 'true').lower() == 'true'
    METRICS_PORT = int(os.getenv('METRICS_PORT', 9090))
    
    # ===== PERFORMANCE =====
    WORKER_THREADS = int(os.getenv('WORKER_THREADS', 4))
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 30))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16777216))  # 16MB
    
    # ===== DEPLOYMENT INFO =====
    SERVER_NAME = os.getenv('SERVER_NAME', 'NeoCare-BackendServer')
    SERVER_LOCATION = os.getenv('SERVER_LOCATION', 'EdgeServer-2')
    DEPLOYMENT_DATE = os.getenv('DEPLOYMENT_DATE', '2026-02-08')
    
    @staticmethod
    def init_app():
        """Initialize application directories and logging"""
        # Create necessary directories
        directories = [
            BASE_DIR / 'logs',
            BASE_DIR / 'data',
            BASE_DIR / 'uploads'
        ]
        
        for directory in directories:
            directory.mkdir(exist_ok=True)
        
        # Configure logging
        log_file = BASE_DIR / Config.LOG_FILE
        log_file.parent.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=getattr(logging, Config.LOG_LEVEL),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        logger = logging.getLogger(__name__)
        logger.info("=" * 60)
        logger.info(f"  {Config.SERVER_NAME} - Starting")
        logger.info("=" * 60)
        logger.info(f"Environment: {Config.FLASK_ENV}")
        logger.info(f"Debug Mode: {Config.DEBUG}")
        logger.info(f"Server: {Config.SERVER_HOST}:{Config.SERVER_PORT}")
        logger.info(f"Central Server: {Config.CENTRAL_SERVER_URL}")
        logger.info(f"Log Level: {Config.LOG_LEVEL}")
        logger.info("=" * 60)
        
        return logger

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}
