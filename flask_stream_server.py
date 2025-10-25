"""
Flask Server for Streaming YOLOv8 Object Detection
This server creates a web endpoint to stream the live detection video
"""

from flask import Flask, Response, render_template_string
from flask_cors import CORS
import time
import argparse
import numpy as np
import cv2
from queue import Queue, Full
from threading import Thread
from memryx import MultiStreamAsyncAccl
from yolov8 import YoloV8 as YoloModel

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

class Yolo8sMxaStreamer:
    """
    A demo app to run YOLOv8s on the MemryX MXA with web streaming support.
    """

    def __init__(self, video_paths, model_type):
        """
        Initialization function.
        """
        # Display control and stream initialization
        self.done = False
        self.num_streams = len(video_paths)  # Number of streams

        # Stream-related containers and initialization
        self.streams = []
        self.streams_idx = [True] * self.num_streams
        self.cap_queue = {i: Queue(maxsize=4) for i in range(self.num_streams)}
        self.dets_queue = {i: Queue(maxsize=5) for i in range(self.num_streams)}
        self.outputs = {i: [] for i in range(self.num_streams)}
        self.dims = {}
        self.color_wheel = {}
        self.model = {}
        self.model_type = model_type

        # Timing and FPS related
        self.dt_index = {i: 0 for i in range(self.num_streams)}
        self.frame_end_time = {i: 0 for i in range(self.num_streams)}
        self.fps = {i: 0 for i in range(self.num_streams)}
        self.dt_array = {i: np.zeros(30) for i in range(self.num_streams)}
        self.srcs_are_cams = {i: True for i in range(self.num_streams)}

        # Store latest frames for web streaming
        self.latest_frames = {i: None for i in range(self.num_streams)}

        # Initialize video captures, models, and dimensions for each stream
        for i, video_path in enumerate(video_paths):
            # Detect if it's a webcam
            if "/dev/video" in video_path or video_path.isdigit():
                self.srcs_are_cams[i] = True
                # Convert to integer index if it's a number
                video_idx = int(video_path.split('video')[-1]) if "/dev/video" in video_path else int(video_path)
                vidcap = cv2.VideoCapture(video_idx)
                print(f"🎥 Opening webcam index {video_idx}...")
            else:
                self.srcs_are_cams[i] = False
                vidcap = cv2.VideoCapture(video_path)
                print(f"📁 Opening video file: {video_path}")
            
            if not vidcap.isOpened():
                print(f"❌ ERROR: Cannot open video source {video_path}")
                # Try alternative indices for webcam
                if self.srcs_are_cams[i]:
                    for alt_idx in [0, 1, 2]:
                        print(f"🔍 Trying alternative webcam index {alt_idx}...")
                        vidcap = cv2.VideoCapture(alt_idx)
                        if vidcap.isOpened():
                            print(f"✅ Success with index {alt_idx}!")
                            break
                
                if not vidcap.isOpened():
                    raise RuntimeError(f"Cannot open video source: {video_path}")
            
            # Set webcam properties for better performance
            if self.srcs_are_cams[i]:
                vidcap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                vidcap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                vidcap.set(cv2.CAP_PROP_FPS, 30)
                vidcap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize latency
            
            self.streams.append(vidcap)
            print(f"✅ Video source {i} opened successfully")

            # Get frame dimensions
            self.dims[i] = (int(vidcap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                            int(vidcap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
            self.color_wheel[i] = np.random.randint(0, 255, (20, 3)).astype(np.int32)

            # Initialize the YOLOv8 model
            self.model[i] = YoloModel(stream_img_size=(self.dims[i][1], self.dims[i][0], 3), model_type=self.model_type)

        # Start processing thread
        self.display_thread = Thread(target=self.process_frames)

    def run(self):
        """
        Start inference on the MXA using multiple streams.
        """
        accl = MultiStreamAsyncAccl(dfp=self.dfp)  # Initialize the accelerator with DFP
        print("YOLOv8s inference on MX3 started")
        accl.set_postprocessing_model(self.post_model, model_idx=0)  # Set the post-processing model

        self.display_thread.start()  # Start the processing thread

        # Connect input and output streams for the accelerator
        accl.connect_streams(self.capture_and_preprocess, self.postprocess, self.num_streams)
        accl.wait()

        self.done = True

        # Join display thread
        self.display_thread.join()

    def capture_and_preprocess(self, stream_idx):
        """
        Captures a frame for the video device and pre-processes it.
        """
        while True:
            got_frame, frame = self.streams[stream_idx].read()

            if not got_frame or self.done:
                self.streams_idx[stream_idx] = False
                return None

            if self.srcs_are_cams[stream_idx] and self.cap_queue[stream_idx].full():
                # drop frame
                continue
            else:
                try:
                    # Put the frame in the cap_queue to be processed later
                    self.cap_queue[stream_idx].put(frame, timeout=2)

                    # Pre-process the frame using the corresponding model
                    frame = self.model[stream_idx].preprocess(frame)
                    return frame

                except Full:
                    print('Dropped frame')
                    continue

    def postprocess(self, stream_idx, *mxa_output):
        """
        Post-process the output from MXA.
        """
        dets = self.model[stream_idx].postprocess(mxa_output)  # Get detection results

        # Queue detection results for display
        self.dets_queue[stream_idx].put(dets)

        # Calculate FPS
        self.dt_array[stream_idx][self.dt_index[stream_idx]] = time.time() - self.frame_end_time[stream_idx]
        self.dt_index[stream_idx] += 1

        if self.dt_index[stream_idx] % 15 == 0:
            self.fps[stream_idx] = 1 / np.average(self.dt_array[stream_idx])

        if self.dt_index[stream_idx] >= 30:
            self.dt_index[stream_idx] = 0

        self.frame_end_time[stream_idx] = time.time()

    def process_frames(self):
        """
        Processes the frames with detections and stores them for streaming.
        """
        while not self.done:
            # Iterate through each stream for processing frames
            for stream_idx in range(self.num_streams):
                if not self.cap_queue[stream_idx].empty() and not self.dets_queue[stream_idx].empty():
                    frame = self.cap_queue[stream_idx].get()
                    dets = self.dets_queue[stream_idx].get()

                    self.cap_queue[stream_idx].task_done()
                    self.dets_queue[stream_idx].task_done()

                    # Draw detection boxes
                    for d in dets:
                        x1, y1, w, h = d['bbox']
                        color = tuple(int(c) for c in self.color_wheel[stream_idx][d['class_id'] % 20])

                        # Draw bounding boxes
                        frame = cv2.rectangle(frame, (int(x1), int(y1)), (int(x1 + w), int(y1 + h)), color, 2)

                        # Add class label
                        frame = cv2.putText(frame, d['class'], (x1 + 2, y1 - 5),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                    # Add FPS to frame
                    fps_text = f"{self.model[stream_idx].name} - {self.fps[stream_idx]:.1f} FPS" if self.fps[stream_idx] > 1 else self.model[stream_idx].name
                    frame = cv2.putText(frame, fps_text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

                    # Store the latest frame for web streaming
                    self.latest_frames[stream_idx] = frame.copy()

        # Release resources after processing
        for stream in self.streams:
            stream.release()

    def get_frame(self, stream_idx=0):
        """
        Get the latest frame for a specific stream (JPEG encoded).
        """
        if self.latest_frames[stream_idx] is not None:
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', self.latest_frames[stream_idx])
            if ret:
                return buffer.tobytes()
        return None


# Global instance of the streamer
streamer = None


def generate_frames(stream_idx=0):
    """
    Generator function for streaming frames in MJPEG format.
    """
    global streamer
    while True:
        if streamer is not None:
            frame = streamer.get_frame(stream_idx)
            if frame is not None:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        time.sleep(0.01)  # Small delay to prevent overwhelming the server


@app.route('/video_feed')
@app.route('/video_feed/<int:stream_idx>')
def video_feed(stream_idx=0):
    """
    Video streaming route. Put this in the src attribute of an img tag.
    """
    return Response(generate_frames(stream_idx),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/status')
def status():
    """
    Status endpoint to check if the server is running.
    """
    global streamer
    if streamer is not None:
        return {
            'status': 'running',
            'streams': streamer.num_streams,
            'fps': {i: round(streamer.fps[i], 1) for i in range(streamer.num_streams)}
        }
    return {'status': 'not initialized'}


@app.route('/')
def index():
    """
    Simple index page to test the stream.
    """
    return render_template_string('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>SiteGuard Live Stream</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #1a1a1a;
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                img {
                    max-width: 90%;
                    border: 3px solid #4CAF50;
                    border-radius: 10px;
                    margin: 20px auto;
                }
                h1 { color: #4CAF50; }
            </style>
        </head>
        <body>
            <h1>🚁 SiteGuard Object Detection Stream</h1>
            <p>Live video feed with YOLOv8 object detection</p>
            <img src="{{ url_for('video_feed') }}" alt="Live Stream">
            <p><a href="/status" style="color: #4CAF50;">Check Status</a></p>
        </body>
        </html>
    ''')


def start_server(args):
    """
    Initialize the streamer and start the Flask server.
    """
    global streamer

    if args.post_model.endswith('.onnx'):
        model_type = 'onnx'
    elif args.post_model.endswith('.tflite'):
        model_type = 'tflite'
    else:
        raise ValueError(f"Unsupported post-processing model format: {args.post_model}")

    # Initialize the streamer with video paths
    streamer = Yolo8sMxaStreamer(video_paths=args.video_paths, model_type=model_type)
    streamer.dfp = args.dfp
    streamer.post_model = args.post_model

    # Start the inference in a separate thread
    inference_thread = Thread(target=streamer.run)
    inference_thread.daemon = True
    inference_thread.start()

    # Start the Flask server
    print(f"\n🌐 Flask server starting on http://0.0.0.0:{args.port}")
    print(f"📹 Video feed available at: http://localhost:{args.port}/video_feed")
    print(f"📊 Status endpoint: http://localhost:{args.port}/status")
    print(f"🏠 Test page: http://localhost:{args.port}/\n")
    
    app.run(host='0.0.0.0', port=args.port, threaded=True, debug=False)


if __name__ == "__main__":
    # Argument parser
    parser = argparse.ArgumentParser(description="\033[34mMemryX YoloV8s Web Streaming Server\033[0m")
    
    # Video input paths
    parser.add_argument('--video_paths', nargs='+', dest="video_paths", 
                        action="store", 
                        default=['/dev/video0'],
                        help="Path to video files for inference. Use '/dev/video0' for webcam. (Default:'/dev/video0')")

    # DFP model argument
    parser.add_argument('-d', '--dfp', type=str, 
                        default='bestt.dfp', 
                        help="Path to the compiled DFP file")

    # Post-processing model argument
    parser.add_argument('-p', '--post_model', type=str, 
                        default='bestt_post.onnx', 
                        help="Path to the post-processing ONNX file")

    # Port argument
    parser.add_argument('--port', type=int, 
                        default=5000, 
                        help="Port for the Flask server (default: 5000)")

    args = parser.parse_args()

    # Start the server
    start_server(args)

