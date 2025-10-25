#!/bin/bash

echo "🎥 Starting SiteGuard Webcam Stream with YOLO Detection"
echo "======================================================="
echo ""

# Default values
DFP_MODEL="bestt.dfp"
POST_MODEL="bestt_post.onnx"
PORT=5000

# Check if models exist
if [ ! -f "$DFP_MODEL" ]; then
    echo "❌ Error: $DFP_MODEL not found!"
    echo "Please make sure your model files are in the current directory."
    exit 1
fi

if [ ! -f "$POST_MODEL" ]; then
    echo "❌ Error: $POST_MODEL not found!"
    exit 1
fi

echo "✅ Model files found"
echo "🎥 Using webcam as input"
echo "🌐 Starting Flask server on port $PORT"
echo ""
echo "📺 Open your browser to:"
echo "   - Live View: file://$(pwd)/SiteGaurd/live-view.html"
echo "   - Test Page: http://localhost:$PORT/"
echo ""
echo "Press Ctrl+C to stop"
echo "======================================================="
echo ""

# Start the Flask server with webcam only
python flask_stream_server.py \
    --video_paths 0 \
    --dfp "$DFP_MODEL" \
    --post_model "$POST_MODEL" \
    --port $PORT

