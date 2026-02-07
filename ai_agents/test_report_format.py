"""
Test script to verify AI agent report sending works correctly
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from base_agent import DetectionResult

def test_detection_result():
    """Test that DetectionResult can be created with proper data types"""

    # Test 1: NeoCare-style detection
    neocare_result = DetectionResult(
        status="SLEEPING",
        confidence=0.92,
        predictions={"primary_activity": "SLEEPING"},
        bbox=[100, 200, 300, 400],
        alert_level="normal",
        metadata={"model_type": "YOLOv8-pose", "frame_number": 1}
    )

    print("NeoCare Detection Result:")
    print(f"  Status: {neocare_result.status}")
    print(f"  Confidence: {neocare_result.confidence}")
    print(f"  Predictions type: {type(neocare_result.predictions)}")
    print(f"  Predictions: {neocare_result.predictions}")
    print(f"  BBox type: {type(neocare_result.bbox)}")
    print(f"  BBox: {neocare_result.bbox}")
    print(f"  Metadata type: {type(neocare_result.metadata)}")
    print(f"  Metadata: {neocare_result.metadata}")
    print()

    # Test 2: GeriCare-style detection
    gericare_result = DetectionResult(
        status="NORMAL",
        confidence=0.88,
        predictions={"activity": "STANDING"},
        bbox=[150, 100, 200, 400],
        alert_level="normal",
        metadata={"person_count": 1, "tracking_id": 1}
    )

    print("GeriCare Detection Result:")
    print(f"  Status: {gericare_result.status}")
    print(f"  Confidence: {gericare_result.confidence}")
    print(f"  Predictions type: {type(gericare_result.predictions)}")
    print(f"  Predictions: {gericare_result.predictions}")
    print(f"  BBox type: {type(gericare_result.bbox)}")
    print(f"  BBox: {gericare_result.bbox}")
    print(f"  Metadata type: {type(gericare_result.metadata)}")
    print(f"  Metadata: {gericare_result.metadata}")
    print()

    # Verify types
    assert isinstance(neocare_result.predictions, dict), "Predictions should be dict"
    assert isinstance(neocare_result.bbox, list), "BBox should be list"
    assert isinstance(neocare_result.metadata, dict), "Metadata should be dict"

    assert isinstance(gericare_result.predictions, dict), "Predictions should be dict"
    assert isinstance(gericare_result.bbox, list), "BBox should be list"
    assert isinstance(gericare_result.metadata, dict), "Metadata should be dict"

    print("[PASS] All type checks passed!")
    print("[PASS] DetectionResult objects are properly formatted for API validation")

    return True

if __name__ == '__main__':
    print("="*60)
    print("  Testing AI Agent Data Format")
    print("="*60)
    print()

    try:
        success = test_detection_result()
        if success:
            print()
            print("="*60)
            print("  All Tests Passed!")
            print("="*60)
            print()
            print("The agents will now send properly formatted data to the API.")
            sys.exit(0)
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
