// Script to copy files from network share to local project
const fs = require('fs');
const path = require('path');
const { 
  NETWORK_SHARE_PATH, 
  LOCAL_DIRECTORIES, 
  ensureDirectories,
  isNetworkShareAccessible 
} = require('./networkShareConfig');

// File type mappings
const FILE_TYPES = {
  html: ['.html', '.htm'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']
};

// Copy a single file
function copyFile(sourcePath, destPath) {
  try {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied: ${path.basename(sourcePath)} -> ${destPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to copy ${sourcePath}:`, error.message);
    return false;
  }
}

// Get file category based on extension
function getFileCategory(filename) {
  const ext = path.extname(filename).toLowerCase();
  for (const [category, extensions] of Object.entries(FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return null;
}

// Copy all files from network share
function copyAllFiles(options = {}) {
  const { 
    recursive = true, 
    fileTypes = ['html', 'documents', 'images'],
    specificFiles = null 
  } = options;

  console.log('\n=== Starting File Copy from Network Share ===\n');

  // Check network share accessibility
  if (!isNetworkShareAccessible()) {
    console.error('❌ Network share is not accessible!');
    console.error(`   Path: ${NETWORK_SHARE_PATH}`);
    console.error('   Make sure:');
    console.error('   1. The network path is correct');
    console.error('   2. You have permission to access it');
    console.error('   3. The network drive is connected');
    return false;
  }

  console.log(`✓ Network share accessible: ${NETWORK_SHARE_PATH}\n`);

  // Ensure local directories exist
  ensureDirectories();

  let copiedCount = 0;
  let failedCount = 0;

  // Function to process directory recursively
  function processDirectory(sourceDir, relativeDir = '') {
    try {
      const items = fs.readdirSync(sourceDir);

      items.forEach(item => {
        const sourcePath = path.join(sourceDir, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory() && recursive) {
          // Process subdirectory
          processDirectory(sourcePath, path.join(relativeDir, item));
        } else if (stat.isFile()) {
          // Check if specific files are requested
          if (specificFiles && !specificFiles.includes(item)) {
            return;
          }

          const category = getFileCategory(item);
          
          // Check if file type should be copied
          if (category && fileTypes.includes(category)) {
            const destPath = path.join(
              LOCAL_DIRECTORIES[category], 
              relativeDir, 
              item
            );
            
            if (copyFile(sourcePath, destPath)) {
              copiedCount++;
            } else {
              failedCount++;
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error processing directory ${sourceDir}:`, error.message);
    }
  }

  // Start copying
  processDirectory(NETWORK_SHARE_PATH);

  console.log('\n=== Copy Complete ===');
  console.log(`✓ Successfully copied: ${copiedCount} files`);
  if (failedCount > 0) {
    console.log(`✗ Failed: ${failedCount} files`);
  }
  console.log(`\nFiles copied to: ${LOCAL_DIRECTORIES.all}\n`);

  return copiedCount > 0;
}

// Copy specific files
function copySpecificFiles(fileNames) {
  return copyAllFiles({ specificFiles: fileNames });
}

// Watch for changes and auto-sync (optional)
function watchAndSync(interval = 60000) {
  console.log(`\n📡 Starting auto-sync every ${interval/1000} seconds...\n`);
  
  // Initial copy
  copyAllFiles();
  
  // Set up interval
  setInterval(() => {
    console.log('\n🔄 Auto-syncing...');
    copyAllFiles();
  }, interval);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--watch')) {
    const interval = parseInt(args[args.indexOf('--watch') + 1]) || 60000;
    watchAndSync(interval);
  } else if (args.includes('--files')) {
    const filesIndex = args.indexOf('--files');
    const files = args.slice(filesIndex + 1);
    copySpecificFiles(files);
  } else {
    copyAllFiles();
  }
}

module.exports = {
  copyAllFiles,
  copySpecificFiles,
  watchAndSync,
  copyFile
};
