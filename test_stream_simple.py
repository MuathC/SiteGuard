"""
Simple test script to verify the streaming setup works
"""

from flask import Flask, Response
from flask_cors import CORS
import cv2
import time

app = Flask(__name__)
CORS(app)

def generate_test_frames():
    """Generate simple test frames to verify streaming works"""
    # Try different webcam indices
    cap = None
    for idx in [0, 1, 2]:
        print(f"🔍 Trying webcam index {idx}...")
        cap = cv2.VideoCapture(idx)
        if cap.isOpened():
            print(f"✅ Webcam opened successfully on index {idx}!")
            break
        cap.release()
    
    if cap is None or not cap.isOpened():
        print("❌ Cannot open any webcam! Make sure your webcam is connected.")
        print("💡 Tip: Check 'System Preferences > Security & Privacy > Camera'")
        return
    
    # Set webcam properties for better performance
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️ Cannot read frame from webcam!")
            time.sleep(0.1)
            continue
        
        frame_count += 1
        
        # Add text to verify frame is being processed
        cv2.putText(frame, 'TEST STREAM WORKING', (50, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, time.strftime('%H:%M:%S'), (50, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS

@app.route('/video_feed')
def video_feed():
    return Response(generate_test_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/test')
def test():
    return '''
    <html>
        <head><title>Stream Test</title></head>
        <body style="background: #000; color: #fff; text-align: center; padding: 50px;">
            <h1>🎥 Stream Test Page</h1>
            <p>If you see a video below, streaming works!</p>
            <img src="/video_feed" style="max-width: 90%; border: 3px solid lime;">
        </body>
    </html>
    '''

@app.route('/')
def index():
    return '''
    <html>
        <body style="font-family: Arial; padding: 20px;">
            <h1>✅ Flask Server is Running!</h1>
            <p><a href="/test">Click here to test the video stream</a></p>
            <p>Server Status: <strong style="color: green;">ONLINE</strong></p>
        </body>
    </html>
    '''

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🧪 SIMPLE STREAM TEST SERVER")
    print("="*60)
    print("🌐 Server: http://localhost:5000")
    print("📹 Stream: http://localhost:5000/video_feed")
    print("🧪 Test Page: http://localhost:5000/test")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)

