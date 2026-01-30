// Network Share Configuration
const path = require('path');
const fs = require('fs');

// Network share path
const NETWORK_SHARE_PATH = '\\\\192.168.2.50\\Users\\HIS4\\Desktop\\Shared';

// Local directories for copied files
const LOCAL_DIRECTORIES = {
  html: path.join(__dirname, 'shared', 'html'),
  documents: path.join(__dirname, 'shared', 'documents'),
  images: path.join(__dirname, 'shared', 'images'),
  all: path.join(__dirname, 'shared')
};

// Ensure local directories exist
function ensureDirectories() {
  Object.values(LOCAL_DIRECTORIES).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Check if network share is accessible
function isNetworkShareAccessible() {
  try {
    return fs.existsSync(NETWORK_SHARE_PATH);
  } catch (error) {
    console.error('Network share not accessible:', error.message);
    return false;
  }
}

module.exports = {
  NETWORK_SHARE_PATH,
  LOCAL_DIRECTORIES,
  ensureDirectories,
  isNetworkShareAccessible
};
