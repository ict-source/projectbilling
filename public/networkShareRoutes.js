// Express routes for serving files from network share
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { 
  NETWORK_SHARE_PATH, 
  LOCAL_DIRECTORIES,
  isNetworkShareAccessible 
} = require('./networkShareConfig');

// Serve files directly from network share (if accessible)
router.get('/network/direct/*', (req, res) => {
  if (!isNetworkShareAccessible()) {
    return res.status(503).json({ 
      error: 'Network share not accessible',
      message: 'The network share is currently unavailable. Please use local cached files instead.',
      alternativeEndpoint: '/network/local/*'
    });
  }

  const requestedPath = req.params[0];
  const filePath = path.join(NETWORK_SHARE_PATH, requestedPath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(NETWORK_SHARE_PATH)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Check if it's a file (not directory)
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    return res.status(400).json({ error: 'Not a file' });
  }

  // Serve the file
  res.sendFile(filePath);
});

// Serve files from local cached copy
router.get('/network/local/:type/*', (req, res) => {
  const { type } = req.params;
  const requestedPath = req.params[0];

  // Validate type
  if (!LOCAL_DIRECTORIES[type]) {
    return res.status(400).json({ 
      error: 'Invalid file type',
      validTypes: Object.keys(LOCAL_DIRECTORIES)
    });
  }

  const filePath = path.join(LOCAL_DIRECTORIES[type], requestedPath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(LOCAL_DIRECTORIES[type])) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      error: 'File not found',
      message: 'File may not have been synced yet. Run the sync script to copy files from network share.'
    });
  }

  // Serve the file
  res.sendFile(filePath);
});

// List available files in network share
router.get('/network/list', (req, res) => {
  const { type, source = 'local' } = req.query;

  try {
    let basePath;
    
    if (source === 'network') {
      if (!isNetworkShareAccessible()) {
        return res.status(503).json({ 
          error: 'Network share not accessible',
          message: 'Try using source=local to list cached files'
        });
      }
      basePath = NETWORK_SHARE_PATH;
    } else {
      basePath = type ? LOCAL_DIRECTORIES[type] : LOCAL_DIRECTORIES.all;
    }

    if (!fs.existsSync(basePath)) {
      return res.json({ files: [], message: 'Directory not found or empty' });
    }

    // Read directory
    const files = [];
    
    function readDirRecursive(dir, relativePath = '') {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const itemRelativePath = path.join(relativePath, item);
        
        if (stat.isDirectory()) {
          readDirRecursive(fullPath, itemRelativePath);
        } else {
          files.push({
            name: item,
            path: itemRelativePath.replace(/\\/g, '/'),
            size: stat.size,
            modified: stat.mtime,
            extension: path.extname(item)
          });
        }
      });
    }

    readDirRecursive(basePath);

    res.json({
      source,
      basePath,
      totalFiles: files.length,
      files
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to list files',
      message: error.message 
    });
  }
});

// Check network share status
router.get('/network/status', (req, res) => {
  const accessible = isNetworkShareAccessible();
  
  res.json({
    networkShare: {
      path: NETWORK_SHARE_PATH,
      accessible,
      status: accessible ? 'online' : 'offline'
    },
    localCache: {
      path: LOCAL_DIRECTORIES.all,
      exists: fs.existsSync(LOCAL_DIRECTORIES.all)
    }
  });
});

// Trigger manual sync (calls the copy script)
router.post('/network/sync', async (req, res) => {
  try {
    const { copyAllFiles } = require('./copyFromNetworkShare');
    
    // Run sync in background
    setTimeout(() => {
      copyAllFiles();
    }, 100);

    res.json({ 
      message: 'Sync started in background',
      status: 'processing'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to start sync',
      message: error.message 
    });
  }
});

module.exports = router;
