// Simple server entry point for Render deployment
const path = require('path');

// Try to load the main app from different possible locations
let app;
try {
  app = require('./app');
} catch (err) {
  try {
    app = require('./src/app');
  } catch (err2) {
    try {
      app = require('./backend/app');
    } catch (err3) {
      console.error('Could not find app.js in any expected location');
      process.exit(1);
    }
  }
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 JurIA Backend running on port ${PORT}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
});
