const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create icons in different sizes
const sizes = [16, 48, 128];

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#ef4444'); // red-500
    gradient.addColorStop(1, '#f97316'); // orange-500
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw shield shape
    ctx.fillStyle = 'white';
    const margin = size * 0.2;
    const shieldWidth = size - (margin * 2);
    const shieldHeight = size - (margin * 2);
    
    // Shield path
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin + shieldWidth, margin);
    ctx.lineTo(margin + shieldWidth, margin + shieldHeight * 0.6);
    ctx.lineTo(margin + shieldWidth/2, margin + shieldHeight);
    ctx.lineTo(margin, margin + shieldHeight * 0.6);
    ctx.closePath();
    ctx.fill();

    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'assets', `icon${size}.png`), buffer);
}

// Generate icons for all sizes
sizes.forEach(size => generateIcon(size));

console.log('Icons generated successfully!');