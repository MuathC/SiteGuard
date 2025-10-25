// ===================================
// SiteGuard JavaScript Application
// Handles interactivity and simulated data
// Structured for easy Gazebo integration
// ===================================

// ===================================
// Configuration & Data Structures
// ===================================

// Drone Configuration (Ready for Gazebo integration)
const DRONE_CONFIG = {
    drones: [
        { 
            id: 1, 
            name: "Drone 1", 
            status: "Patrolling Zone A", 
            battery: 85, 
            signal: "Excellent",
            online: true,
            // Gazebo integration fields (to be populated later)
            gazebo_topic: "/drone_1/camera/image",
            telemetry_topic: "/drone_1/telemetry"
        },
        { 
            id: 2, 
            name: "Drone 2", 
            status: "Monitoring Fire Alert", 
            battery: 92, 
            signal: "Good",
            online: true,
            gazebo_topic: "/drone_2/camera/image",
            telemetry_topic: "/drone_2/telemetry"
        },
        { 
            id: 3, 
            name: "Drone 3", 
            status: "Low Battery - Charging", 
            battery: 23, 
            signal: "N/A",
            online: false,
            gazebo_topic: "/drone_3/camera/image",
            telemetry_topic: "/drone_3/telemetry"
        },
        { 
            id: 4, 
            name: "Drone 4", 
            status: "Perimeter Patrol", 
            battery: 78, 
            signal: "Excellent",
            online: true,
            gazebo_topic: "/drone_4/camera/image",
            telemetry_topic: "/drone_4/telemetry"
        },
        { 
            id: 5, 
            name: "Drone 5", 
            status: "Offline - Maintenance", 
            battery: 0, 
            signal: "N/A",
            online: false,
            gazebo_topic: "/drone_5/camera/image",
            telemetry_topic: "/drone_5/telemetry"
        }
    ],
    currentDrone: 1
};

// Simulated Activity Data
const ACTIVITY_TYPES = [
    { type: "Vehicle Detected", location: "Entrance Gate", description: "Construction vehicle entering site" },
    { type: "Worker Entering Zone", location: "Zone 4", description: "Worker with proper PPE detected" },
    { type: "Equipment Movement", location: "Zone 2", description: "Excavator in operation" },
    { type: "Perimeter Check", location: "North Fence", description: "Routine patrol complete" },
    { type: "PPE Compliance", location: "Loading Bay 1", description: "All workers properly equipped" },
    { type: "Fire Extinguisher Check", location: "Zone 3", description: "Equipment verified in position" },
    { type: "Drone Battery Check", location: "Charging Station", description: "Battery status nominal" },
    { type: "Worker Count Update", location: "Site-wide", description: "23 workers currently on site" }
];

// Simulated AI Detection Classes
const DETECTION_CLASSES = [
    { label: "Hard Hat", color: "#27ae60" },
    { label: "Safety Vest", color: "#27ae60" },
    { label: "Person", color: "#3498db" },
    { label: "Vehicle", color: "#9b59b6" },
    { label: "Excavator", color: "#e67e22" },
    { label: "Fire", color: "#e74c3c" },
    { label: "No PPE", color: "#e74c3c" }
];

// ===================================
// Utility Functions
// ===================================

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTimeAgo(minutes) {
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===================================
// Dashboard Functions (index.html)
// ===================================

function initializeDashboard() {
    if (!document.getElementById('activityLog')) return; // Not on dashboard page
    
    // Generate initial activity log
    generateActivityLog();
    
    // Update activity log every 10 seconds
    setInterval(addNewActivity, 10000);
    
    // Update time displays
    updateAlertTimes();
    setInterval(updateAlertTimes, 60000); // Update every minute
    
    console.log("Dashboard initialized");
}

function generateActivityLog() {
    const activityLog = document.getElementById('activityLog');
    if (!activityLog) return;
    
    activityLog.innerHTML = '';
    
    // Generate 15 recent activities
    for (let i = 0; i < 15; i++) {
        const activity = ACTIVITY_TYPES[getRandomInt(0, ACTIVITY_TYPES.length - 1)];
        const minutesAgo = getRandomInt(i * 2, i * 2 + 5);
        addActivityItem(activity, minutesAgo);
    }
}

function addActivityItem(activity, minutesAgo) {
    const activityLog = document.getElementById('activityLog');
    if (!activityLog) return;
    
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <div class="activity-time">${formatTimeAgo(minutesAgo)}</div>
        <div class="activity-type">${activity.type}</div>
        <div class="activity-location">📍 ${activity.location}</div>
        <div class="activity-description">${activity.description}</div>
    `;
    
    activityLog.insertBefore(item, activityLog.firstChild);
    
    // Keep only last 20 items
    while (activityLog.children.length > 20) {
        activityLog.removeChild(activityLog.lastChild);
    }
}

function addNewActivity() {
    const activity = ACTIVITY_TYPES[getRandomInt(0, ACTIVITY_TYPES.length - 1)];
    addActivityItem(activity, 0);
}

function updateAlertTimes() {
    // These could be updated based on actual alert data in production
    const fireTime = document.getElementById('fire-time');
    const ppeTime = document.getElementById('ppe-time');
    const intruderTime = document.getElementById('intruder-time');
    
    if (fireTime) fireTime.textContent = formatTimeAgo(2);
    if (ppeTime) ppeTime.textContent = formatTimeAgo(8);
    if (intruderTime) intruderTime.textContent = formatTimeAgo(15);
}

function viewLiveFeed(droneId) {
    // Store the drone ID and navigate to live view
    localStorage.setItem('selectedDrone', droneId);
    window.location.href = 'live-view.html';
}

// ===================================
// Live View Functions (live-view.html)
// ===================================

function initializeLiveView() {
    if (!document.getElementById('videoContainer')) return; // Not on live view page
    
    // Check if a specific drone was selected
    const selectedDrone = localStorage.getItem('selectedDrone');
    if (selectedDrone) {
        DRONE_CONFIG.currentDrone = parseInt(selectedDrone);
        localStorage.removeItem('selectedDrone');
    }
    
    // Highlight active drone
    updateActiveDrone(DRONE_CONFIG.currentDrone);
    
    // Generate event stream
    generateEventStream(DRONE_CONFIG.currentDrone);
    
    // Simulate AI detections on video feed
    simulateDetections();
    
    // Update detections every 3 seconds
    setInterval(simulateDetections, 3000);
    
    // Add new events every 8 seconds
    setInterval(() => {
        addNewEvent(DRONE_CONFIG.currentDrone);
    }, 8000);
    
    // Simulate telemetry updates
    setInterval(updateTelemetry, 2000);
    
    console.log("Live View initialized - Drone", DRONE_CONFIG.currentDrone);
}

function switchDrone(droneId) {
    DRONE_CONFIG.currentDrone = droneId;
    
    // Update UI
    updateActiveDrone(droneId);
    updateVideoFeed(droneId);
    generateEventStream(droneId);
    
    console.log("Switched to Drone", droneId);
}

function updateActiveDrone(droneId) {
    // Remove active class from all drone items
    document.querySelectorAll('.drone-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected drone
    const selectedDrone = document.querySelector(`.drone-item[data-drone-id="${droneId}"]`);
    if (selectedDrone) {
        selectedDrone.classList.add('active');
    }
    
    // Update title
    const titleElement = document.getElementById('currentDroneTitle');
    if (titleElement) {
        titleElement.textContent = `Drone ${droneId} - Live Feed`;
    }
}

function updateVideoFeed(droneId) {
    const videoImage = document.getElementById('videoImage');
    const streamSource = document.getElementById('streamSource');
    
    if (videoImage) {
        videoImage.src = `https://via.placeholder.com/1280x720/34495e/ffffff?text=Drone+${droneId}+Feed+-+Ready+for+Gazebo+Integration`;
        videoImage.alt = `Drone ${droneId} Feed`;
    }
    
    if (streamSource) {
        const drone = DRONE_CONFIG.drones.find(d => d.id === droneId);
        streamSource.textContent = `Placeholder (Gazebo Topic: ${drone?.gazebo_topic || 'N/A'})`;
    }
    
    // Clear and regenerate detections for new feed
    const overlays = document.getElementById('detectionOverlays');
    if (overlays) {
        overlays.innerHTML = '';
    }
    simulateDetections();
}

function simulateDetections() {
    const overlays = document.getElementById('detectionOverlays');
    if (!overlays) return;
    
    // Clear existing detections
    overlays.innerHTML = '';
    
    // Generate 2-5 random detections
    const numDetections = getRandomInt(2, 5);
    
    for (let i = 0; i < numDetections; i++) {
        const detection = DETECTION_CLASSES[getRandomInt(0, DETECTION_CLASSES.length - 1)];
        const confidence = getRandomInt(85, 99);
        
        // Random position (as percentage)
        const left = getRandomInt(10, 70);
        const top = getRandomInt(10, 70);
        const width = getRandomInt(10, 20);
        const height = getRandomInt(15, 25);
        
        createDetectionBox(detection, confidence, left, top, width, height);
    }
}

function createDetectionBox(detection, confidence, left, top, width, height) {
    const overlays = document.getElementById('detectionOverlays');
    if (!overlays) return;
    
    const box = document.createElement('div');
    box.className = 'detection-box';
    box.style.left = `${left}%`;
    box.style.top = `${top}%`;
    box.style.width = `${width}%`;
    box.style.height = `${height}%`;
    box.style.borderColor = detection.color;
    
    const label = document.createElement('div');
    label.className = 'detection-label';
    label.style.backgroundColor = detection.color;
    label.innerHTML = `${detection.label} <span class="detection-confidence">${confidence}%</span>`;
    
    box.appendChild(label);
    overlays.appendChild(box);
}

function updateTelemetry() {
    const altitudeEl = document.getElementById('altitude');
    const speedEl = document.getElementById('speed');
    const batteryEl = document.getElementById('battery');
    const gpsEl = document.getElementById('gps');
    
    if (!altitudeEl) return;
    
    const drone = DRONE_CONFIG.drones.find(d => d.id === DRONE_CONFIG.currentDrone);
    
    // Simulate slight variations in telemetry
    const altitude = getRandomInt(45, 55);
    const speed = getRandomInt(8, 12);
    const battery = drone ? drone.battery : 85;
    
    altitudeEl.textContent = `${altitude}m`;
    speedEl.textContent = `${speed} m/s`;
    batteryEl.textContent = `${battery}%`;
    gpsEl.textContent = `37.${getRandomInt(7700, 7799)}, -122.${getRandomInt(4100, 4199)}`;
}

function generateEventStream(droneId) {
    const eventList = document.getElementById('eventList');
    const eventDroneLabel = document.getElementById('eventDroneLabel');
    
    if (!eventList) return;
    
    eventList.innerHTML = '';
    if (eventDroneLabel) {
        eventDroneLabel.textContent = `Drone ${droneId}`;
    }
    
    // Generate 10 recent events for this drone
    for (let i = 0; i < 10; i++) {
        const activity = ACTIVITY_TYPES[getRandomInt(0, ACTIVITY_TYPES.length - 1)];
        const minutesAgo = getRandomInt(i, i + 2);
        addEventItem(activity, minutesAgo);
    }
}

function addEventItem(activity, minutesAgo) {
    const eventList = document.getElementById('eventList');
    if (!eventList) return;
    
    const item = document.createElement('div');
    item.className = 'event-item';
    item.innerHTML = `
        <div class="event-item-time">${getCurrentTime()} (${formatTimeAgo(minutesAgo)})</div>
        <div class="event-item-type">${activity.type}</div>
        <div class="event-item-desc">${activity.description}</div>
    `;
    
    eventList.insertBefore(item, eventList.firstChild);
    
    // Keep only last 15 items
    while (eventList.children.length > 15) {
        eventList.removeChild(eventList.lastChild);
    }
}

function addNewEvent(droneId) {
    const activity = ACTIVITY_TYPES[getRandomInt(0, ACTIVITY_TYPES.length - 1)];
    addEventItem(activity, 0);
}

function toggleFullscreen() {
    const videoContainer = document.getElementById('videoContainer');
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// ===================================
// Gazebo Integration Functions
// (Template for future implementation)
// ===================================

/**
 * GAZEBO INTEGRATION TEMPLATE
 * 
 * These functions provide a template for integrating with Gazebo
 * through ROS bridge or direct video streaming.
 * 
 * To integrate:
 * 1. Include roslibjs library: <script src="https://cdn.jsdelivr.net/npm/roslib@1/build/roslib.min.js"></script>
 * 2. Set up ROS bridge server in Gazebo environment
 * 3. Uncomment and configure the functions below
 * 4. Replace placeholder video feeds with actual stream data
 */

/*
// ROS Connection Manager
class GazeboConnection {
    constructor(rosbridgeUrl) {
        this.ros = new ROSLIB.Ros({ url: rosbridgeUrl });
        this.videoTopics = {};
        this.telemetryTopics = {};
        
        this.ros.on('connection', () => {
            console.log('Connected to Gazebo via ROS bridge');
            this.initializeTopics();
        });
        
        this.ros.on('error', (error) => {
            console.error('Error connecting to ROS bridge:', error);
        });
        
        this.ros.on('close', () => {
            console.log('Connection to ROS bridge closed');
        });
    }
    
    initializeTopics() {
        // Subscribe to all drone camera topics
        DRONE_CONFIG.drones.forEach(drone => {
            this.subscribeToVideoTopic(drone);
            this.subscribeToTelemetryTopic(drone);
        });
    }
    
    subscribeToVideoTopic(drone) {
        const videoTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: drone.gazebo_topic,
            messageType: 'sensor_msgs/Image'
        });
        
        videoTopic.subscribe((message) => {
            this.updateVideoFromROS(drone.id, message);
        });
        
        this.videoTopics[drone.id] = videoTopic;
    }
    
    subscribeToTelemetryTopic(drone) {
        const telemetryTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: drone.telemetry_topic,
            messageType: 'nav_msgs/Odometry'
        });
        
        telemetryTopic.subscribe((message) => {
            this.updateTelemetryFromROS(drone.id, message);
        });
        
        this.telemetryTopics[drone.id] = telemetryTopic;
    }
    
    updateVideoFromROS(droneId, imageMessage) {
        // Convert ROS Image message to displayable format
        // This would decode the image data and update the video feed
        if (droneId === DRONE_CONFIG.currentDrone) {
            const videoImage = document.getElementById('videoImage');
            if (videoImage) {
                // Convert image message to data URL or use WebRTC
                const imageData = this.convertROSImageToDataURL(imageMessage);
                videoImage.src = imageData;
            }
        }
    }
    
    updateTelemetryFromROS(droneId, telemetryMessage) {
        // Update telemetry display from ROS odometry message
        if (droneId === DRONE_CONFIG.currentDrone) {
            const altitude = telemetryMessage.pose.pose.position.z;
            const velocity = Math.sqrt(
                Math.pow(telemetryMessage.twist.twist.linear.x, 2) +
                Math.pow(telemetryMessage.twist.twist.linear.y, 2)
            );
            
            document.getElementById('altitude').textContent = `${altitude.toFixed(1)}m`;
            document.getElementById('speed').textContent = `${velocity.toFixed(1)} m/s`;
            // GPS would come from a different topic typically
        }
    }
    
    convertROSImageToDataURL(imageMessage) {
        // Implementation depends on image encoding
        // Common encodings: rgb8, bgr8, mono8, jpeg, png
        // This is a placeholder - actual implementation would handle different encodings
        return 'data:image/jpeg;base64,' + imageMessage.data;
    }
}

// Initialize Gazebo connection
// Uncomment when ready to connect
// const gazeboConnection = new GazeboConnection('ws://localhost:9090');
*/

// ===================================
// Page-Specific Initialization
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("SiteGuard Application Starting...");
    
    // Initialize based on current page
    initializeDashboard();
    initializeLiveView();
    initializeDashboardPage();
    
    // Make functions globally accessible
    window.switchDrone = switchDrone;
    window.viewLiveFeed = viewLiveFeed;
    window.toggleFullscreen = toggleFullscreen;
    window.initializeDashboardPage = initializeDashboardPage;
    
    console.log("SiteGuard Application Ready");
});

// ===================================
// ===================================
// Dashboard Page Functions (dashboard.html)
// ===================================

function initializeDashboardPage() {
    if (!document.getElementById('droneFleetGrid')) return; // Not on dashboard page
    
    // Update current date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Populate drone fleet
    populateDroneFleet();
    
    // Populate alerts summary
    populateAlertsSummary();
    
    // Populate activity feed
    populateActivityFeed();
    
    // Update activity feed every 10 seconds
    setInterval(addNewActivityFeedItem, 10000);
    
    console.log("Dashboard page initialized");
}

function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

function populateDroneFleet() {
    const fleetGrid = document.getElementById('droneFleetGrid');
    if (!fleetGrid) return;
    
    fleetGrid.innerHTML = '';
    
    DRONE_CONFIG.drones.forEach(drone => {
        const item = document.createElement('div');
        item.className = 'fleet-drone-item';
        
        const statusClass = drone.online ? 'active' : (drone.battery > 0 ? 'charging' : 'offline');
        
        item.innerHTML = `
            <div class="fleet-drone-status ${statusClass}"></div>
            <div class="fleet-drone-info">
                <div class="fleet-drone-name">${drone.name}</div>
                <div class="fleet-drone-detail">
                    <span class="fleet-drone-battery">${drone.battery}%</span> • ${drone.status}
                </div>
            </div>
        `;
        
        item.style.cursor = 'pointer';
        item.onclick = () => {
            localStorage.setItem('selectedDrone', drone.id);
            window.location.href = 'live-view.html';
        };
        
        fleetGrid.appendChild(item);
    });
}

function populateAlertsSummary() {
    const alertsList = document.getElementById('alertsSummaryList');
    if (!alertsList) return;
    
    const alerts = [
        { icon: '🔥', title: 'Fire detected in Zone 3', time: '2 smin ago', type: 'critical' },
        { icon: '⚠️', title: 'PPE violation - Loading Bay 2', time: '8 min ago', type: 'warning' },
        { icon: '🦺', title: 'Safety check completed', time: '22 min ago', type: '' },
    ];
    
    alertsList.innerHTML = '';
    
    alerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = `alert-summary-item ${alert.type}`;
        item.innerHTML = `
            <span class="alert-summary-icon">${alert.icon}</span>
            <div class="alert-summary-info">
                <div class="alert-summary-title">${alert.title}</div>
                <div class="alert-summary-time">${alert.time}</div>
            </div>
        `;
        alertsList.appendChild(item);
    });
}

function populateActivityFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    feed.innerHTML = '';
    
    // Generate 10 recent activities
    for (let i = 0; i < 10; i++) {
        const activity = ACTIVITY_TYPES[getRandomInt(0, ACTIVITY_TYPES.length - 1)];
        const minutesAgo = getRandomInt(i, i + 5);
        addActivityFeedItemDirect(activity, minutesAgo);
    }
}

function addActivityFeedItemDirect(activity, minutesAgo) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    const item = document.createElement('div');
    item.className = 'activity-feed-item';
    item.innerHTML = `
        <div class="activity-feed-time">${formatTimeAgo(minutesAgo)}</div>
        <div class="activity-feed-text">${activity.type} - ${activity.location}</div>
    `;
    
    feed.insertBefore(item, feed.firstChild);
    
    // Keep only last 15 items
    while (feed.children.length > 15) {
        feed.removeChild(feed.lastChild);
    }
}

function addNewActivityFeedItem() {
    const activity = ACTIVITY_TYPES[getRandomInt(0, ACTIVITY_TYPES.length - 1)];
    addActivityFeedItemDirect(activity, 0);
}

// ===================================
// Export for ES6 Modules (if needed)
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DRONE_CONFIG,
        switchDrone,
        viewLiveFeed,
        toggleFullscreen,
        initializeDashboardPage
    };
}

