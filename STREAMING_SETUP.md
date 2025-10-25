# SiteGuard Live Video Streaming Setup

This guide explains how to stream live object detection video from your YOLOv8 model to the SiteGuard web interface.

## 🎥 WEBCAM ONLY - Quick Start (Recommended)

**The simplest way to get webcam detection streaming:**

### Option 1: Using the Python launcher (Easiest!)
```bash
python start_webcam_detection.py
```

### Option 2: Manual command
```bash
python flask_stream_server.py --video_paths 0 --dfp bestt.dfp --post_model bestt_post.onnx
```

Then open: `SiteGaurd/live-view.html` in your browser

---

## 🚀 Detailed Setup

### 1. Install Flask Dependencies

```bash
pip install -r requirements_flask.txt
```

Or install manually:
```bash
pip install Flask flask-cors
```

### 2. Start the Flask Streaming Server

Run the Flask server with your object detection model:

```bash
python flask_stream_server.py --video_paths /dev/video0 --dfp bestt.dfp --post_model bestt_post.onnx
```

**Options:**
- `--video_paths`: Path to video source (default: `/dev/video0` for webcam)
  - For webcam: `--video_paths /dev/video0`
  - For video file: `--video_paths construct.mp4`
  - For multiple streams: `--video_paths /dev/video0 fire.mp4`
- `--dfp`: Path to your DFP model file (default: `bestt.dfp`)
- `--post_model`: Path to post-processing model (default: `bestt_post.onnx`)
- `--port`: Server port (default: `5000`)

### 3. Open the Web Interface

Open your browser and navigate to:
```
file:///Users/mohm/Documents/prog/SiteGuard/SiteGaurd/live-view.html
```

Or serve the HTML files with a simple HTTP server:
```bash
cd SiteGaurd
python -m http.server 8000
```

Then open: `http://localhost:8000/live-view.html`

## 📡 How It Works

1. **Flask Server** (`flask_stream_server.py`):
   - Runs your YOLOv8 object detection on video input
   - Processes frames and draws bounding boxes
   - Streams frames via HTTP using MJPEG format
   - Provides status API for FPS monitoring

2. **Web Interface** (`live-view.html`):
   - Displays the live video stream with detections
   - Shows real-time FPS
   - Monitors connection status

## 🔧 API Endpoints

Once the server is running, you can access:

- **Video Stream**: `http://localhost:5000/video_feed`
- **Status Check**: `http://localhost:5000/status`
- **Test Page**: `http://localhost:5000/`

## 🐛 Troubleshooting

### Stream not showing?
1. Check if Flask server is running: `curl http://localhost:5000/status`
2. Check browser console for errors (F12)
3. Make sure your video device is accessible: `ls -l /dev/video*`

### Port already in use?
Change the port:
```bash
python flask_stream_server.py --port 5001
```

Then update the HTML file to use the new port in line 115 and 178.

### Low FPS?
- Reduce video resolution
- Check system resources
- Ensure hardware acceleration is working

## 📝 Notes

- The Flask server uses MJPEG streaming (simple but higher bandwidth)
- For production, consider using WebRTC or HLS for better performance
- CORS is enabled for cross-origin requests
- The server runs on `0.0.0.0` to allow access from other devices on the network

## 🔄 Switching Back to Original OpenCV Display

To use the original OpenCV window display, run:
```bash
python run_objectiondetection.py --video_paths /dev/video0 --dfp bestt.dfp --post_model bestt_post.onnx
```














cd /Users/mohm/Documents/prog/SiteGuard && chmod +x start_webcam_stream.sh start_webcam_detection.py