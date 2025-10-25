#!/usr/bin/env python3
"""
Simple launcher for SiteGuard Webcam Detection Stream
Run this to start streaming your webcam with YOLO detection to the web interface
"""

import sys
import os

print("=" * 70)
print("🎥 SiteGuard Webcam Object Detection Stream")
print("=" * 70)
print()

# Check if required files exist
required_files = {
    'bestt.dfp': 'DFP model file',
    'bestt_post.onnx': 'Post-processing model',
    'flask_stream_server.py': 'Flask server script'
}

missing_files = []
for file, description in required_files.items():
    if not os.path.exists(file):
        missing_files.append(f"  ❌ {file} ({description})")
    else:
        print(f"  ✅ {file} found")

if missing_files:
    print("\n⚠️ Missing required files:")
    for msg in missing_files:
        print(msg)
    print("\nPlease ensure all model files are in the current directory.")
    sys.exit(1)

print()
print("📋 Configuration:")
print("  - Input: Webcam (index 0)")
print("  - Model: bestt.dfp + bestt_post.onnx")
print("  - Server: http://localhost:5000")
print()
print("🌐 Once started, open in your browser:")
print(f"  - Main UI: file://{os.path.abspath('SiteGaurd/live-view.html')}")
print("  - Test page: http://localhost:5000/")
print()
print("💡 Press Ctrl+C to stop the server")
print("=" * 70)
print()

# Import and run
try:
    import argparse
    
    # Set up arguments
    class Args:
        video_paths = ['0']  # Webcam index 0
        dfp = 'bestt.dfp'
        post_model = 'bestt_post.onnx'
        port = 5000
    
    args = Args()
    
    # Import the server module
    from flask_stream_server import start_server
    
    print("🚀 Starting server...")
    print()
    
    # Start the server
    start_server(args)
    
except KeyboardInterrupt:
    print("\n\n⏹️  Server stopped by user")
    sys.exit(0)
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nTroubleshooting:")
    print("  1. Make sure Flask is installed: pip install Flask flask-cors")
    print("  2. Check webcam permissions in System Preferences > Security & Privacy")
    print("  3. Try running: python test_stream_simple.py (to test without YOLO)")
    sys.exit(1)

