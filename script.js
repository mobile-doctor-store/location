// Generate tracking link
document.getElementById('generateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const linkName = document.getElementById('linkName').value || 'Unnamed Link';
    const redirectUrl = document.getElementById('redirectUrl').value || 'https://google.com';
    
    // Generate unique tracking ID
    const trackingId = generateTrackingId();
    
    // Create tracking link
    const trackingUrl = `${window.location.origin}/track.html?id=${trackingId}&redirect=${encodeURIComponent(redirectUrl)}`;
    
    // Save link data
    const linkData = {
        id: trackingId,
        name: linkName,
        redirectUrl: redirectUrl,
        createdAt: new Date().toISOString(),
        clicks: 0
    };
    
    // Save to localStorage (in production, save to server)
    saveTrackingLink(linkData);
    
    // Display generated link
    document.getElementById('trackingUrl').value = trackingUrl;
    document.getElementById('generatedLink').classList.remove('hidden');
    
    // Update recent links
    updateRecentLinks();
});

function generateTrackingId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveTrackingLink(linkData) {
    let links = JSON.parse(localStorage.getItem('trackingLinks') || '[]');
    links.unshift(linkData);
    localStorage.setItem('trackingLinks', JSON.stringify(links));
}

function copyLink() {
    const trackingUrl = document.getElementById('trackingUrl');
    trackingUrl.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = '#28a745';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

function viewDashboard() {
    window.location.href = 'dashboard.html';
}

function generateNew() {
    document.getElementById('generateForm').reset();
    document.getElementById('generatedLink').classList.add('hidden');
}

function updateRecentLinks() {
    const links = JSON.parse(localStorage.getItem('trackingLinks') || '[]');
    const container = document.getElementById('recentLinks');
    
    if (links.length === 0) {
        container.innerHTML = '<p class="no-data">No tracking links generated yet.</p>';
        return;
    }
    
    container.innerHTML = links.slice(0, 5).map(link => `
        <div class="location-item">
            <div class="location-header">
                <strong>${link.name}</strong>
                <span class="timestamp">${new Date(link.createdAt).toLocaleString()}</span>
            </div>
            <div class="location-details">
                <p><strong>Link ID:</strong> ${link.id}</p>
                <p><strong>Clicks:</strong> ${link.clicks}</p>
                <div class="location-actions">
                    <button onclick="copyLinkById('${link.id}')" class="btn-small">Copy Link</button>
                </div>
            </div>
        </div>
    `).join('');
}

function copyLinkById(linkId) {
    const trackingUrl = `${window.location.origin}/track.html?id=${linkId}`;
    navigator.clipboard.writeText(trackingUrl).then(() => {
        alert('Link copied to clipboard!');
    });
}

// Load recent links on page load
document.addEventListener('DOMContentLoaded', function() {
    updateRecentLinks();
});
