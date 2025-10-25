# 🔧 Troubleshooting Black Screen Issue

## Quick Diagnosis Steps

### Step 1: Test if Flask can run at all

Run this simple test server first:

```bash
python test_stream_simple.py
```

Then open in your browser: **http://localhost:5000/test**

- ✅ If you see video → Flask streaming works, issue is with the full app
- ❌ If black screen → Issue with Flask/OpenCV/Video source

---

### Step 2: Check what's failing

Open browser console (F12) and check for errors:
- `ERR_CONNECTION_REFUSED` → Server not running
- `Failed to load resource` → Wrong URL or port
- CORS error → Need flask-cors installed

---

### Step 3: Verify video source

Test if your video source is accessible:

```bash
# For webcam
ls -l /dev/video*

# Test with OpenCV directly
python -c "import cv2; cap = cv2.VideoCapture(0); print('Webcam:', cap.isOpened())"
```

---

## Common Issues & Solutions

### Issue 1: Server Not Running
**Symptom:** Connection refused, black screen

**Solution:**
```bash
# Make sure Flask is installed
pip install Flask flask-cors

# Start the test server
python test_stream_simple.py
```

### Issue 2: Video Source Not Available
**Symptom:** Server runs but no video appears

**Solution:** Use a video file instead of webcam:
```bash
python test_stream_simple.py
```

The test script will automatically try `construct.mp4` if webcam fails.

### Issue 3: MemryX Dependencies Missing
**Symptom:** Error about `memryx` module

**Solution:** The full app needs MemryX SDK. For testing without it:
```bash
# Use the simple test server (doesn't need memryx)
python test_stream_simple.py
```

### Issue 4: CORS Errors
**Symptom:** CORS policy error in console

**Solution:**
```bash
pip install flask-cors
```

### Issue 5: Port Already in Use
**Symptom:** "Address already in use" error

**Solution:**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process or use a different port
python test_stream_simple.py  # Will suggest a different port
```

---

## Step-by-Step Testing Approach

### Test 1: Basic Flask Server
```bash
python -c "from flask import Flask; app = Flask(__name__); print('Flask works!')"
```

### Test 2: OpenCV Can Read Video
```bash
python -c "import cv2; cap = cv2.VideoCapture('construct.mp4'); ret, frame = cap.read(); print(f'Video read: {ret}, Frame shape: {frame.shape if ret else None}')"
```

### Test 3: Simple Stream Server
```bash
python test_stream_simple.py
# Then open http://localhost:5000/test
```

### Test 4: Full Detection Server (if above works)
```bash
python flask_stream_server.py --video_paths construct.mp4
```

---

## What to Check in Browser

1. **Open browser console** (F12 → Console tab)
2. **Look for errors** (red text)
3. **Check Network tab** (should see requests to localhost:5000)
4. **Right-click the image** → "Open image in new tab" → See actual error

---

## Quick Test Commands

```bash
# Test 1: Is Flask installed?
python -c "import flask; print('Flask version:', flask.__version__)"

# Test 2: Is OpenCV working?
python -c "import cv2; print('OpenCV version:', cv2.__version__)"

# Test 3: Can we open the video file?
python -c "import cv2; cap = cv2.VideoCapture('construct.mp4'); print('Opened:', cap.isOpened())"

# Test 4: Start simple test server
python test_stream_simple.py
```

---

## Still Black Screen?

If the simple test also shows black screen:

1. **Check the image URL directly**: Open `http://localhost:5000/video_feed` in browser
   - Should show a live MJPEG stream
   - If it downloads instead of showing, browser might not support MJPEG

2. **Try different browser**: Chrome/Firefox/Safari handle MJPEG differently

3. **Check server logs**: Look at terminal where server is running for errors

4. **Test with curl**:
   ```bash
   curl -I http://localhost:5000/video_feed
   # Should return: Content-Type: multipart/x-mixed-replace
   ```

---

## Need More Help?

Share the output of:
```bash
python test_stream_simple.py
```

And any errors you see in:
- Terminal (where server runs)
- Browser console (F12)

