# SiteGuard - Intelligent Site Monitoring System

A modern, responsive web application for drone-based AI monitoring of construction and industrial sites. Built with pure HTML5, CSS3, and JavaScript - no frameworks required for easy deployment.

## 🚀 Features

- **Real-time Dashboard** - Critical alerts, site-wide drone activity map, operational metrics
- **Live Drone Feeds** - Multi-drone video feed management with AI detection overlays
- **Business Solutions** - Showcase benefits, use cases, and technology overview
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode UI** - Professional dashboard aesthetic optimized for operations centers
- **Gazebo-Ready** - Pre-structured for easy integration with Gazebo simulator

## 📁 Project Structure

```
SiteGaurd/
├── index.html          # Main dashboard page
├── live-view.html      # Live drone camera feeds
├── solutions.html      # Business value & use cases
├── styles.css          # Complete styling (responsive + dark mode)
├── app.js              # JavaScript logic & Gazebo integration template
├── readme.txt          # Original project requirements
└── README.md           # This file
```

## 🎯 Getting Started

### Quick Start

1. Simply open `index.html` in any modern web browser
2. No build process or dependencies required!
3. Navigate between pages using the top navigation bar

### Local Development

For a better development experience with live reload:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Then open: http://localhost:8000
```

## 🤖 Gazebo Integration Guide

The application is pre-structured for easy Gazebo integration. Here's how to connect your Gazebo drone simulation:

### Prerequisites

1. Gazebo simulator running with drone models
2. ROS (Robot Operating System) installed
3. rosbridge_server for WebSocket communication

### Setup Steps

1. **Install rosbridge**:
```bash
sudo apt-get install ros-<distro>-rosbridge-server
```

2. **Launch rosbridge** (in your ROS environment):
```bash
roslaunch rosbridge_server rosbridge_websocket.launch
```

3. **Include roslibjs in your HTML** (add to `<head>` of `live-view.html`):
```html
<script src="https://cdn.jsdelivr.net/npm/roslib@1/build/roslib.min.js"></script>
```

4. **Uncomment Gazebo integration code** in `app.js`:
   - Locate the `GAZEBO INTEGRATION TEMPLATE` section
   - Uncomment the `GazeboConnection` class
   - Initialize the connection at the bottom of the file

5. **Configure your topics**:
   - Edit `DRONE_CONFIG` in `app.js`
   - Set the correct `gazebo_topic` and `telemetry_topic` for each drone
   - Default format: `/drone_1/camera/image`, `/drone_1/telemetry`

### Drone Configuration Example

```javascript
// In app.js - DRONE_CONFIG
{
    id: 1,
    name: "Drone 1",
    gazebo_topic: "/drone_1/camera/image_raw",  // Your Gazebo topic
    telemetry_topic: "/drone_1/odom",           // Your telemetry topic
    // ... other fields
}
```

### Video Stream Integration

The video feed uses a placeholder by default. To connect Gazebo:

1. **Option A: ROS Image Topic**
   - Subscribe to `sensor_msgs/Image` topic
   - Convert to canvas/image element
   - Template provided in `GazeboConnection` class

2. **Option B: MJPEG Stream**
   - Use `web_video_server` package
   - Replace video source with stream URL:
   ```javascript
   videoImage.src = "http://localhost:8080/stream?topic=/drone_1/camera/image_raw";
   ```

3. **Option C: WebRTC** (lowest latency)
   - Implement WebRTC video streaming
   - Best for real-time applications

### Telemetry Integration

The telemetry overlay receives data from ROS odometry messages:

```javascript
// Subscribe to /drone_X/odom (nav_msgs/Odometry)
// Extract: position.z (altitude), twist.linear (velocity)
// Update display elements accordingly
```

### Testing Without Gazebo

The application works standalone with simulated data:
- Simulated video feeds (placeholder images)
- Random AI detections
- Mock telemetry data
- Automated activity logs

Perfect for demos and UI development before Gazebo integration!

## 🎨 Customization

### Colors & Branding

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-blue: #2980b9;
    --accent-yellow: #f39c12;
    --dark-bg: #1a1a2e;
    /* ... customize as needed */
}
```

### Drone Configuration

Edit `DRONE_CONFIG` in `app.js`:
- Add/remove drones
- Change status messages
- Update battery levels
- Configure Gazebo topics

### AI Detection Classes

Modify `DETECTION_CLASSES` in `app.js` to match your AI model:

```javascript
const DETECTION_CLASSES = [
    { label: "Hard Hat", color: "#27ae60" },
    { label: "Safety Vest", color: "#27ae60" },
    // Add your custom detection classes
];
```

## 📱 Pages Overview

### 1. Dashboard (index.html)
- **Critical Alerts**: Fire detection, PPE violations, intruder alerts
- **Site Map**: Interactive map with drone positions and alert markers
- **Metrics**: Drone status, safety incidents, compliance rates
- **Activity Log**: Real-time event feed

### 2. Live View (live-view.html)
- **Drone Panel**: Switch between multiple drone feeds
- **Video Feed**: Main camera view with AI detection overlays
- **Telemetry**: Altitude, speed, battery, GPS coordinates
- **Event Stream**: Drone-specific detection log

### 3. Solutions (solutions.html)
- **Benefits**: Safety, security, efficiency, cost savings
- **Use Cases**: Construction, industrial, solar farms, emergency response
- **Technology**: Edge AI processing capabilities
- **Call to Action**: Demo request and contact information

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup, responsive structure
- **CSS3**: Flexbox/Grid layouts, animations, gradients
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Google Fonts**: Inter font family

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- Lightweight (~50KB total size without images)
- No external dependencies for core functionality
- Optimized for 60fps animations
- Lazy-loaded images for fast initial load

## 🚦 Simulated Data

The application includes realistic simulated data for testing:

- **Activity Events**: 10 different event types with random generation
- **AI Detections**: 7 detection classes with confidence scores
- **Telemetry**: Realistic altitude, speed, battery variations
- **Time Updates**: Relative timestamps ("2 minutes ago")

## 📊 Future Enhancements

Potential additions for production deployment:

- [ ] Real-time WebSocket connection to backend
- [ ] Historical data playback
- [ ] Alert notification system (push notifications)
- [ ] User authentication & role-based access
- [ ] Export reports (PDF/CSV)
- [ ] Multi-site management
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] AI model configuration interface

## 🐛 Troubleshooting

### Gazebo Connection Issues

**Problem**: Cannot connect to ROS bridge
```
Solution: Ensure rosbridge_server is running on ws://localhost:9090
Check: rosnode list | grep rosbridge
```

**Problem**: Video feed not displaying
```
Solution: Verify image topic is publishing
Check: rostopic list | grep camera
       rostopic hz /drone_1/camera/image_raw
```

**Problem**: CORS errors in browser console
```
Solution: Start rosbridge with --unregister_timeout=0
Or configure CORS headers properly
```

### General Issues

**Problem**: Styles not loading
```
Solution: Ensure all files are in the same directory
Check browser console for 404 errors
```

**Problem**: JavaScript not working
```
Solution: Check browser console for errors
Ensure you're using a modern browser
Try hard refresh (Ctrl+Shift+R)
```

## 📄 License

This project is open source. Feel free to modify and adapt for your needs.

## 🤝 Support

For issues or questions:
- Check the inline code comments
- Review the Gazebo integration template in `app.js`
- Verify ROS topics are publishing correctly
- Test with simulated data first before connecting Gazebo

---

**Built for easy integration, maximum flexibility, and professional deployment.**

Ready to transform site operations with intelligent drone monitoring! 🚁✨

