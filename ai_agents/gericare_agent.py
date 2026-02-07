"""
GeriCare-AI Agent - Elderly Fall Detection with YOLO
Production-grade AI agent for geriatric patient monitoring
"""

import cv2
import numpy as np
from typing import Optional, Any, List, Tuple
from base_agent import BaseAIAgent, AgentConfig, DetectionResult
import time


class GeriCareAgent(BaseAIAgent):
    """AI Agent for elderly fall detection and activity monitoring"""

    def __init__(self, config: AgentConfig):
        super().__init__(config)
        self.model = None
        self.tracker = None
        self.fall_history = []
        self.person_positions = {}  # Track person positions over time

        # Activity states
        self.states = {
            'NORMAL': 'Patient is in normal state',
            'STANDING': 'Patient is standing',
            'SITTING': 'Patient is sitting',
            'LYING': 'Patient is lying down',
            'WALKING': 'Patient is walking',
            'FALL_DETECTED': 'Potential fall detected!',
            'FALL_RECOVERY': 'Patient fell but is recovering',
            'EXTENDED_FALL': 'Patient on ground for extended period',
        }

        self.critical_statuses = ['FALL_DETECTED', 'EXTENDED_FALL']
        self.warning_statuses = ['FALL_RECOVERY', 'LYING']

    def initialize_model(self):
        """Load YOLO model and DeepSORT tracker for person detection"""
        try:
            self.logger.info("Loading YOLOv8 model for person detection...")

            # Try to load YOLO model
            try:
                from ultralytics import YOLO
                self.model = YOLO('yolov8n.pt')  # Nano model for speed
                self.logger.info(">> YOLOv8 model loaded successfully")

                # Try to initialize tracker
                try:
                    from deep_sort_realtime.deepsort_tracker import DeepSort
                    self.tracker = DeepSort(max_age=30)
                    self.logger.info(">> DeepSORT tracker initialized")
                except ImportError:
                    self.logger.warning("DeepSORT not available. Using basic tracking.")

            except ImportError:
                self.logger.warning("YOLOv8 not available. Using mock detection for demo.")
                self.model = None

        except Exception as e:
            self.logger.error(f"Failed to load model: {str(e)}")
            raise e

    def process_frame(self, frame: Any) -> DetectionResult:
        """Process video frame and detect falls/activities"""
        try:
            if frame is None or frame.size == 0:
                return DetectionResult(
                    status='NO_FRAME',
                    confidence=0.0,
                    predictions={},
                    alert_level='warning'
                )

            if self.model is not None:
                # Real YOLO detection
                detections = self.detect_persons(frame)

                if detections:
                    status, confidence, person_ids = self.analyze_fall_risk(detections, frame.shape[:2])
                else:
                    status = 'NO_DETECTION'
                    confidence = 0.0
                    person_ids = []
            else:
                # Mock detection for demo/testing
                status, confidence, person_ids = self.mock_detection()

            # Determine alert level
            alert_level = self.determine_alert_level(status, confidence)

            # Track fall history for extended fall detection
            self.update_fall_history(status)

            return DetectionResult(
                status=status,
                confidence=confidence,
                predictions={
                    'primary_status': status,
                    'description': self.states.get(status, 'Unknown'),
                    'person_count': len(person_ids) if person_ids else 0
                },
                alert_level=alert_level,
                metadata={
                    'person_ids': person_ids,
                    'fall_duration': self.get_fall_duration(),
                    'model_type': 'YOLOv8' if self.model else 'mock'
                }
            )

        except Exception as e:
            self.logger.error(f"Error processing frame: {str(e)}")
            return DetectionResult(
                status='ERROR',
                confidence=0.0,
                predictions={},
                alert_level='critical'
            )

    def detect_persons(self, frame) -> List:
        """Detect persons in frame using YOLO"""
        results = self.model(frame, classes=[0], verbose=False)  # class 0 is 'person'

        detections = []
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            confidences = results[0].boxes.conf.cpu().numpy()

            for box, conf in zip(boxes, confidences):
                if conf > self.config.confidence_threshold:
                    detections.append({
                        'bbox': box.tolist(),
                        'confidence': float(conf)
                    })

        return detections

    def analyze_fall_risk(self, detections: List, frame_shape: Tuple) -> Tuple[str, float, List]:
        """Analyze detected persons for fall risk"""
        if not detections:
            return 'NO_DETECTION', 0.0, []

        frame_height, frame_width = frame_shape
        person_ids = list(range(len(detections)))
        max_confidence = 0.0
        status = 'NORMAL'

        for idx, detection in enumerate(detections):
            bbox = detection['bbox']
            confidence = detection['confidence']
            max_confidence = max(max_confidence, confidence)

            # Calculate aspect ratio (width/height of bounding box)
            x1, y1, x2, y2 = bbox
            bbox_width = x2 - x1
            bbox_height = y2 - y1
            aspect_ratio = bbox_width / bbox_height if bbox_height > 0 else 0

            # Calculate position in frame (normalized 0-1)
            center_y = (y1 + y2) / 2 / frame_height
            center_x = (x1 + x2) / 2 / frame_width

            # Fall detection logic:
            # 1) Aspect ratio > 1.3 (person is wider than tall) = likely lying down
            # 2) Person is in lower 70% of frame = on ground
            # 3) Rapid position change (needs tracking over time)

            if aspect_ratio > 1.5 and center_y > 0.6:
                # Person is horizontal and near bottom = likely on ground
                status = 'FALL_DETECTED'
            elif aspect_ratio > 1.3:
                status = 'LYING'
            elif center_y < 0.4:
                # Person in upper part of frame = likely standing
                status = 'STANDING'
            elif center_y < 0.6:
                status = 'SITTING'
            else:
                status = 'NORMAL'

        return status, max_confidence, person_ids

    def mock_detection(self) -> Tuple[str, float, List]:
        """Mock detection for testing without real camera"""
        import random

        # Simulate realistic elderly monitoring
        statuses_weighted = [
            ('NORMAL', 0.50),
            ('SITTING', 0.25),
            ('STANDING', 0.15),
            ('WALKING', 0.06),
            ('LYING', 0.02),
            ('FALL_DETECTED', 0.01),
            ('EXTENDED_FALL', 0.005),
            ('FALL_RECOVERY', 0.005),
        ]

        status = random.choices(
            [s[0] for s in statuses_weighted],
            weights=[s[1] for s in statuses_weighted]
        )[0]

        confidence = random.uniform(0.80, 0.98)
        person_ids = [1]  # Single person

        return status, confidence, person_ids

    def update_fall_history(self, status: str):
        """Track fall events over time to detect extended falls"""
        current_time = time.time()

        if status in ['FALL_DETECTED', 'LYING']:
            self.fall_history.append(current_time)
        else:
            # Clear fall history if person is upright
            self.fall_history = []

        # Keep only last 60 seconds
        cutoff_time = current_time - 60
        self.fall_history = [t for t in self.fall_history if t > cutoff_time]

    def get_fall_duration(self) -> float:
        """Get how long person has been on ground (in seconds)"""
        if not self.fall_history:
            return 0.0

        return time.time() - self.fall_history[0]

    def determine_alert_level(self, status: str, confidence: float) -> str:
        """Determine alert level based on detected status"""
        # Extended fall (on ground > 10 seconds) is critical
        if self.get_fall_duration() > 10:
            return 'critical'

        if status in self.critical_statuses and confidence > self.config.confidence_threshold:
            return 'critical'
        elif status in self.warning_statuses and confidence > self.config.confidence_threshold:
            return 'warning'
        else:
            return 'normal'

    def get_frame(self) -> Optional[Any]:
        """Get frame from camera or video source"""
        if self.config.camera_url:
            # Try to read from camera
            try:
                if not hasattr(self, 'video_capture'):
                    self.video_capture = cv2.VideoCapture(self.config.camera_url)

                ret, frame = self.video_capture.read()
                if ret:
                    return frame
            except Exception as e:
                self.logger.error(f"Error reading from camera: {str(e)}")

        # Return mock frame for testing
        return np.zeros((480, 640, 3), dtype=np.uint8)

    def cleanup(self):
        """Cleanup resources"""
        super().cleanup()
        if hasattr(self, 'video_capture'):
            self.video_capture.release()


# Example usage
if __name__ == '__main__':
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='GeriCare-AI Agent for Fall Detection')
    parser.add_argument('--room', type=str, default='R5', help='Room ID (e.g., R5)')
    parser.add_argument('--server', type=str, default='http://localhost:3000', help='Server URL')
    parser.add_argument('--camera', type=str, default=None, help='Camera URL (optional)')
    parser.add_argument('--mock', action='store_true', help='Use mock detection mode (no camera required)')
    parser.add_argument('--interval', type=int, default=1, help='Check interval in seconds')
    parser.add_argument('--log-level', type=str, default='INFO', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'], help='Logging level')

    args = parser.parse_args()

    # Create agent configuration
    config = AgentConfig(
        agent_name='GeriCare-AI',
        room_id=args.room,
        module='GeriCare-AI',
        server_url=args.server,
        camera_url=args.camera,
        confidence_threshold=0.70,
        alert_threshold=2,  # Alert after 2 consecutive fall detections
        check_interval=args.interval,
        max_retries=5,
        log_level=args.log_level
    )

    # Create and run agent
    agent = GeriCareAgent(config)

    print(f"\n{'='*60}")
    print(f"  GeriCare-AI Agent Starting")
    print(f"{'='*60}")
    print(f"  Room ID:      {args.room}")
    print(f"  Server:       {args.server}")
    print(f"  Mock Mode:    {args.mock}")
    print(f"  Interval:     {args.interval}s")
    print(f"  Log Level:    {args.log_level}")
    print(f"{'='*60}\n")

    agent.run()
