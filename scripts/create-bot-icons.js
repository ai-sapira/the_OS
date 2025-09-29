const { createCanvas, CanvasRenderingContext2D } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create teams-manifest directory if it doesn't exist
const manifestDir = path.join(__dirname, '../teams-manifest');
if (!fs.existsSync(manifestDir)) {
  fs.mkdirSync(manifestDir, { recursive: true });
}

// Create color icon (192x192)
function createColorIcon() {
  const canvas = createCanvas(192, 192);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 192, 192);
  gradient.addColorStop(0, '#0078D4');  // Microsoft Blue
  gradient.addColorStop(1, '#106EBE');  // Darker Blue
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 192, 192);
  
  // Add rounded corners
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#000';
  ctx.roundRect(0, 0, 192, 192, 20);
  ctx.fill();
  
  ctx.globalCompositeOperation = 'source-over';
  
  // Add robot icon (simplified)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🤖', 96, 96);
  
  // Add "S" for Sapira
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px Arial';
  ctx.fillText('S', 96, 140);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(manifestDir, 'color-icon.png'), buffer);
  console.log('✅ Created color-icon.png (192x192)');
}

// Create outline icon (32x32)
function createOutlineIcon() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');
  
  // Transparent background
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 32, 32);
  
  // White outline robot
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'transparent';
  
  // Simple robot head outline
  ctx.beginPath();
  ctx.roundRect(6, 8, 20, 16, 4);
  ctx.stroke();
  
  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(12, 14, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(20, 14, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(16, 18, 3, 0, Math.PI);
  ctx.stroke();
  
  // Antenna
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.lineTo(16, 4);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(16, 4, 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(manifestDir, 'outline-icon.png'), buffer);
  console.log('✅ Created outline-icon.png (32x32)');
}

// Helper function for rounded rectangles
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.arcTo(x + width, y, x + width, y + radius, radius);
  this.lineTo(x + width, y + height - radius);
  this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  this.lineTo(x + radius, y + height);
  this.arcTo(x, y + height, x, y + height - radius, radius);
  this.lineTo(x, y + radius);
  this.arcTo(x, y, x + radius, y, radius);
  this.closePath();
};

// Create both icons
try {
  createColorIcon();
  createOutlineIcon();
  console.log('\n🎉 Bot icons created successfully!');
  console.log('📁 Files created in teams-manifest/:');
  console.log('   - color-icon.png (192x192)');
  console.log('   - outline-icon.png (32x32)');
} catch (error) {
  console.error('❌ Error creating icons:', error);
}
