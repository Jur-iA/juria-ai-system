#!/usr/bin/env node

// Robust server entry point for Render deployment
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting JurIA Backend Server...');
console.log('📍 Current directory:', process.cwd());
console.log('📁 Files in current directory:', fs.readdirSync('.'));

// Set PORT from environment or default
const PORT = parseInt(process.env.PORT) || 10000;
console.log('🔌 Using PORT:', PORT);
console.log('🔌 PORT type:', typeof PORT);

// Try to load the main app from different possible locations
let app;
const possiblePaths = [
  './app.js',
  './src/app.js', 
  './backend/app.js',
  './app',
  './src/app',
  './backend/app'
];

console.log('🔍 Searching for app.js...');

for (const appPath of possiblePaths) {
  try {
    console.log(`📂 Trying to load: ${appPath}`);
    app = require(appPath);
    console.log(`✅ Successfully loaded app from: ${appPath}`);
    break;
  } catch (err) {
    console.log(`❌ Failed to load ${appPath}:`, err.message);
  }
}

if (!app) {
  console.error('💥 Could not find app.js in any expected location');
  console.log('📁 Available files:', fs.readdirSync('.', { withFileTypes: true })
    .map(dirent => dirent.isDirectory() ? `${dirent.name}/` : dirent.name));
  process.exit(1);
}

// Ensure app is an Express app with listen method
if (typeof app.listen !== 'function') {
  console.error('💥 Loaded module is not an Express app');
  process.exit(1);
}

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 JurIA Backend running successfully!`);
  console.log(`📡 Server URL: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Public URL: https://juria-ai-project.onrender.com`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🔌 Server listening on port ${PORT} (type: ${typeof PORT})`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🔄 Server setup complete, waiting for connections...');
