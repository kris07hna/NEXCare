"""
Professional AI Agent Configuration
Loads environment variables and provides configuration management
"""

import os
from dotenv import load_dotenv
import logging
from pathlib import Path
from datetime import datetime

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent

class AgentConfig:
    """AI Agent Configuration Class"""
    
    # ===== AGENT IDENTIFICATION =====
    AGENT_ID = os.getenv('AGENT_ID', 'neocare-agent-001')
    AGENT_NAME = os.getenv('AGENT_NAME', 'NeoCare-AI-Agent-1')
    MODULE = os.getenv('MODULE', 'NeoCare-AI')
    ROOM_ID = os.getenv('ROOM_ID', 'R2')
    PATIENT_ID = os.getenv('PATIENT_ID', 'P001')
    
    # ===== SERVER CONNECTION =====
    EDGE_SERVER_HOST = os.getenv('EDGE_SERVER_HOST', '10.107.51.130')
    EDGE_SERVER_PORT = int(os.getenv('EDGE_SERVER_PORT', 3000))
    EDGE_SERVER_URL = os.getenv('EDGE_SERVER_URL', f'http://{EDGE_SERVER_HOST}:{EDGE_SERVER_PORT}')
    
    BACKEND_SERVER_HOST = os.getenv('BACKEND_SERVER_HOST', '10.107.51.130')
    BACKEND_SERVER_PORT = int(os.getenv('BACKEND_SERVER_PORT', 5000))
    BACKEND_SERVER_URL = os.getenv('BACKEND_SERVER_URL', f'http://{BACKEND_SERVER_HOST}:{BACKEND_SERVER_PORT}')
    
    CONNECTION_TIMEOUT = int(os.getenv('CONNECTION_TIMEOUT', 5))
    RETRY_ATTEMPTS = int(os.getenv('RETRY_ATTEMPTS', 3))
    RETRY_DELAY = int(os.getenv('RETRY_DELAY', 5))
    
    # ===== ARDUINO CONFIGURATION =====
    ARDUINO_PORT = os.getenv('ARDUINO_PORT', 'COM6')
    ARDUINO_BAUDRATE = int(os.getenv('ARDUINO_BAUDRATE', 9600))
    ARDUINO_TIMEOUT = int(os.getenv('ARDUINO_TIMEOUT', 1))
    ARDUINO_FALLBACK_PORTS = os.getenv('ARDUINO_FALLBACK_PORTS', 'COM6,COM7,COM3,COM4,COM5').split(',')
    SENSOR_UPDATE_INTERVAL = float(os.getenv('SENSOR_UPDATE_INTERVAL', 0.01))
    
    # ===== CAMERA CONFIGURATION =====
    CAMERA_INDEX = int(os.getenv('CAMERA_INDEX', 0))
    CAMERA_FPS = int(os.getenv('CAMERA_FPS', 30))
    CAMERA_WIDTH = int(os.getenv('CAMERA_WIDTH', 640))
    CAMERA_HEIGHT = int(os.getenv('CAMERA_HEIGHT', 480))
    PROCESS_EVERY_NTH_FRAME = int(os.getenv('PROCESS_EVERY_NTH_FRAME', 1))
    SKIP_FRAMES = os.getenv('SKIP_FRAMES', 'False').lower() == 'true'
    
    # ===== AI/ML CONFIGURATION =====
    MEDIAPIPE_MAX_FACES = int(os.getenv('MEDIAPIPE_MAX_FACES', 1))
    MEDIAPIPE_REFINE_LANDMARKS = os.getenv('MEDIAPIPE_REFINE_LANDMARKS', 'True').lower() == 'true'
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE = float(os.getenv('MEDIAPIPE_MIN_DETECTION_CONFIDENCE', 0.5))
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE = float(os.getenv('MEDIAPIPE_MIN_TRACKING_CONFIDENCE', 0.5))
    
    EAR_THRESHOLD = float(os.getenv('EAR_THRESHOLD', 0.25))
    EAR_CONSEC_FRAMES = int(os.getenv('EAR_CONSEC_FRAMES', 3))
    
    YOLO_MODEL_PATH = os.getenv('YOLO_MODEL_PATH', 'yolov8n.pt')
    YOLO_CONFIDENCE_THRESHOLD = float(os.getenv('YOLO_CONFIDENCE_THRESHOLD', 0.5))
    
    # ===== DATA TRANSMISSION =====
    REPORT_INTERVAL = int(os.getenv('REPORT_INTERVAL', 2))
    BATCH_REPORTING = os.getenv('BATCH_REPORTING', 'False').lower() == 'true'
    BATCH_SIZE = int(os.getenv('BATCH_SIZE', 5))
    SEND_FRAMES = os.getenv('SEND_FRAMES', 'False').lower() == 'true'
    FRAME_QUALITY = int(os.getenv('FRAME_QUALITY', 85))
    
    # ===== ALERT CONFIGURATION =====
    TEMP_WARNING_LOW = float(os.getenv('TEMP_WARNING_LOW', 36.0))
    TEMP_WARNING_HIGH = float(os.getenv('TEMP_WARNING_HIGH', 37.8))
    TEMP_CRITICAL_LOW = float(os.getenv('TEMP_CRITICAL_LOW', 35.0))
    TEMP_CRITICAL_HIGH = float(os.getenv('TEMP_CRITICAL_HIGH', 38.5))
    
    BPM_WARNING_LOW = int(os.getenv('BPM_WARNING_LOW', 100))
    BPM_WARNING_HIGH = int(os.getenv('BPM_WARNING_HIGH', 160))
    BPM_CRITICAL_LOW = int(os.getenv('BPM_CRITICAL_LOW', 80))
    BPM_CRITICAL_HIGH = int(os.getenv('BPM_CRITICAL_HIGH', 180))
    
    # ===== LOGGING =====
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/neocare_agent.log')
    LOG_MAX_SIZE = int(os.getenv('LOG_MAX_SIZE', 10485760))
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    LOG_TO_CONSOLE = os.getenv('LOG_TO_CONSOLE', 'True').lower() == 'true'
    
    # ===== PERFORMANCE =====
    USE_THREADING = os.getenv('USE_THREADING', 'True').lower() == 'true'
    THREAD_POOL_SIZE = int(os.getenv('THREAD_POOL_SIZE', 4))
    MAX_FRAME_BUFFER = int(os.getenv('MAX_FRAME_BUFFER', 30))
    CLEAR_BUFFER_INTERVAL = int(os.getenv('CLEAR_BUFFER_INTERVAL', 100))
    
    # ===== NETWORK =====
    NETWORK_INTERFACE = os.getenv('NETWORK_INTERFACE', 'auto')
    COMPRESS_DATA = os.getenv('COMPRESS_DATA', 'True').lower() == 'true'
    COMPRESSION_LEVEL = int(os.getenv('COMPRESSION_LEVEL', 6))
    
    # ===== SECURITY =====
    API_TOKEN = os.getenv('API_TOKEN', '')
    API_KEY = os.getenv('API_KEY', '')
    USE_SSL = os.getenv('USE_SSL', 'False').lower() == 'true'
    SSL_CERT_PATH = os.getenv('SSL_CERT_PATH', '')
    SSL_KEY_PATH = os.getenv('SSL_KEY_PATH', '')
    
    # ===== MONITORING =====
    HEALTH_CHECK_INTERVAL = int(os.getenv('HEALTH_CHECK_INTERVAL', 60))
    HEARTBEAT_INTERVAL = int(os.getenv('HEARTBEAT_INTERVAL', 30))
    TRACK_FPS = os.getenv('TRACK_FPS', 'True').lower() == 'true'
    TRACK_LATENCY = os.getenv('TRACK_LATENCY', 'True').lower() == 'true'
    TRACK_CPU_USAGE = os.getenv('TRACK_CPU_USAGE', 'True').lower() == 'true'
    TRACK_MEMORY_USAGE = os.getenv('TRACK_MEMORY_USAGE', 'True').lower() == 'true'
    
    # ===== ERROR HANDLING =====
    AUTO_RESTART = os.getenv('AUTO_RESTART', 'True').lower() == 'true'
    MAX_RESTART_ATTEMPTS = int(os.getenv('MAX_RESTART_ATTEMPTS', 3))
    FAILSAFE_MODE = os.getenv('FAILSAFE_MODE', 'True').lower() == 'true'
    OFFLINE_STORAGE = os.getenv('OFFLINE_STORAGE', 'True').lower() == 'true'
    OFFLINE_STORAGE_PATH = os.getenv('OFFLINE_STORAGE_PATH', 'data/offline_reports')
    
    # ===== DISPLAY =====
    SHOW_VIDEO_WINDOW = os.getenv('SHOW_VIDEO_WINDOW', 'True').lower() == 'true'
    WINDOW_NAME = os.getenv('WINDOW_NAME', 'NeoCare AI Agent')
    SHOW_STATUS_OVERLAY = os.getenv('SHOW_STATUS_OVERLAY', 'True').lower() == 'true'
    SHOW_SENSOR_OVERLAY = os.getenv('SHOW_SENSOR_OVERLAY', 'True').lower() == 'true'
    SHOW_FPS = os.getenv('SHOW_FPS', 'True').lower() == 'true'
    
    # ===== MODULE SPECIFIC =====
    NEOCARE_SLEEP_DETECTION = os.getenv('NEOCARE_SLEEP_DETECTION', 'True').lower() == 'true'
    NEOCARE_CRY_DETECTION = os.getenv('NEOCARE_CRY_DETECTION', 'False').lower() == 'true'
    NEOCARE_MOVEMENT_DETECTION = os.getenv('NEOCARE_MOVEMENT_DETECTION', 'False').lower() == 'true'
    
    # ===== DEVELOPMENT =====
    DEV_MODE = os.getenv('DEV_MODE', 'False').lower() == 'true'
    SIMULATE_SENSORS = os.getenv('SIMULATE_SENSORS', 'False').lower() == 'true'
    SIMULATE_CAMERA = os.getenv('SIMULATE_CAMERA', 'False').lower() == 'true'
    TEST_MODE = os.getenv('TEST_MODE', 'False').lower() == 'true'
    TEST_DATA_PATH = os.getenv('TEST_DATA_PATH', 'test_data/')
    
    # ===== DEPLOYMENT INFO =====
    DEPLOYMENT_LOCATION = os.getenv('DEPLOYMENT_LOCATION', 'Laptop-1')
    DEPLOYMENT_DATE = os.getenv('DEPLOYMENT_DATE', '2026-02-08')
    ASSIGNED_WARD = os.getenv('ASSIGNED_WARD', 'NICU')
    
    @staticmethod
    def init_agent():
        """Initialize agent directories and logging"""
        # Create necessary directories
        directories = [
            BASE_DIR / 'logs',
            BASE_DIR / 'data',
            BASE_DIR / 'data' / 'offline_reports',
            BASE_DIR / 'models'
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Configure logging
        log_file = BASE_DIR / AgentConfig.LOG_FILE
        log_file.parent.mkdir(exist_ok=True)
        
        handlers = []
        if AgentConfig.LOG_TO_CONSOLE:
            handlers.append(logging.StreamHandler())
        handlers.append(logging.FileHandler(log_file))
        
        logging.basicConfig(
            level=getattr(logging, AgentConfig.LOG_LEVEL),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=handlers
        )
        
        logger = logging.getLogger(__name__)
        logger.info("=" * 60)
        logger.info(f"  {AgentConfig.AGENT_NAME} - Starting")
        logger.info("=" * 60)
        logger.info(f"Agent ID: {AgentConfig.AGENT_ID}")
        logger.info(f"Module: {AgentConfig.MODULE}")
        logger.info(f"Room: {AgentConfig.ROOM_ID} | Patient: {AgentConfig.PATIENT_ID}")
        logger.info(f"Edge Server: {AgentConfig.EDGE_SERVER_URL}")
        logger.info(f"Backend Server: {AgentConfig.BACKEND_SERVER_URL}")
        logger.info(f"Location: {AgentConfig.DEPLOYMENT_LOCATION}")
        logger.info(f"Ward: {AgentConfig.ASSIGNED_WARD}")
        logger.info("=" * 60)
        
        return logger
    
    @staticmethod
    def get_alert_level(temp, bpm):
        """Determine alert level based on vital signs"""
        if (temp < AgentConfig.TEMP_CRITICAL_LOW or temp > AgentConfig.TEMP_CRITICAL_HIGH or
            bpm < AgentConfig.BPM_CRITICAL_LOW or bpm > AgentConfig.BPM_CRITICAL_HIGH):
            return "critical"
        elif (temp < AgentConfig.TEMP_WARNING_LOW or temp > AgentConfig.TEMP_WARNING_HIGH or
              bpm < AgentConfig.BPM_WARNING_LOW or bpm > AgentConfig.BPM_WARNING_HIGH):
            return "warning"
        else:
            return "normal"
