# Network Share Integration Guide

## Overview
This guide explains how to access and serve files from the network share at `\\192.168.2.50\Users\HIS4\Desktop\Shared` through your Billing Portal application.

## 🎯 What You Can Do

1. **Copy files** from network share to your local project
2. **Serve files** through your Express server via browser
3. **Access HTML files, documents, and images** through API endpoints
4. **Auto-sync** files from network share periodically

---

## 📁 Directory Structure

After copying files, they will be organized locally:
```
ProjectBill/
├── shared/
│   ├── html/          # HTML files
│   ├── documents/     # PDF, DOC, DOCX, TXT, XLS, XLSX, CSV
│   └── images/        # JPG, PNG, GIF, SVG, etc.
```

---

## 🚀 Quick Start

### Step 1: Copy Files from Network Share

Run one of these commands:

```bash
# Copy all files (HTML, documents, images)
node copyFromNetworkShare.js

# Copy specific files only
node copyFromNetworkShare.js --files index.html logo.png report.pdf

# Auto-sync every 60 seconds
node copyFromNetworkShare.js --watch 60000
```

### Step 2: Start Your Server

Make sure your server includes the network share routes (see Integration section below).

```bash
node server.cjs
```

### Step 3: Access Files in Browser

Once files are copied and server is running, access them at:

**Local cached files (recommended):**
- HTML: `http://localhost:3000/api/network/local/html/index.html`
- Documents: `http://localhost:3000/api/network/local/documents/report.pdf`
- Images: `http://localhost:3000/api/network/local/images/logo.png`

**Direct from network share (if accessible):**
- `http://localhost:3000/api/network/direct/index.html`
- `http://localhost:3000/api/network/direct/subfolder/document.pdf`

---

## 🔌 Integration with server.cjs

Add these lines to your `server.cjs` file:

```javascript
// Add at the top with other requires
const networkShareRoutes = require('./networkShareRoutes');
const { ensureDirectories } = require('./networkShareConfig');

// Add after other middleware (around line 17)
ensureDirectories(); // Create local directories for cached files

// Add before your other routes
app.use('/api', networkShareRoutes);

// Optional: Serve static files from shared folder
app.use('/shared', express.static(path.join(__dirname, 'shared')));
```

---

## 🌐 API Endpoints

### 1. Check Network Share Status
```
GET /api/network/status
```

**Response:**
```json
{
  "networkShare": {
    "path": "\\\\192.168.2.50\\Users\\HIS4\\Desktop\\Shared",
    "accessible": true,
    "status": "online"
  },
  "localCache": {
    "path": "C:\\Users\\Lenovo\\Desktop\\ProjectBill\\shared",
    "exists": true
  }
}
```

### 2. List Available Files
```
GET /api/network/list?source=local&type=html
```

**Query Parameters:**
- `source`: `local` or `network` (default: `local`)
- `type`: `html`, `documents`, `images`, or omit for all

**Response:**
```json
{
  "source": "local",
  "totalFiles": 5,
  "files": [
    {
      "name": "index.html",
      "path": "index.html",
      "size": 2048,
      "modified": "2026-01-05T10:30:00.000Z",
      "extension": ".html"
    }
  ]
}
```

### 3. Serve File from Local Cache
```
GET /api/network/local/:type/:filename
```

**Examples:**
- `/api/network/local/html/index.html`
- `/api/network/local/documents/report.pdf`
- `/api/network/local/images/logo.png`

### 4. Serve File Directly from Network Share
```
GET /api/network/direct/:filepath
```

**Examples:**
- `/api/network/direct/index.html`
- `/api/network/direct/docs/report.pdf`

### 5. Trigger Manual Sync
```
POST /api/network/sync
```

**Response:**
```json
{
  "message": "Sync started in background",
  "status": "processing"
}
```

---

## 📝 Usage Examples

### Example 1: Display HTML Page in Browser

1. Copy HTML files:
```bash
node copyFromNetworkShare.js
```

2. Access in browser:
```
http://localhost:3000/api/network/local/html/index.html
```

### Example 2: Embed Image in Your Application

```html
<img src="http://localhost:3000/api/network/local/images/logo.png" alt="Logo">
```

### Example 3: Link to PDF Document

```html
<a href="http://localhost:3000/api/network/local/documents/report.pdf" target="_blank">
  View Report
</a>
```

### Example 4: Fetch File List with JavaScript

```javascript
fetch('http://localhost:3000/api/network/list?type=documents')
  .then(response => response.json())
  .then(data => {
    console.log('Available documents:', data.files);
  });
```

---

## 🔄 Auto-Sync Setup

To keep files synchronized automatically:

### Option 1: Run as Separate Process
```bash
node copyFromNetworkShare.js --watch 60000
```

### Option 2: Integrate into Server

Add to `server.cjs`:
```javascript
const { watchAndSync } = require('./copyFromNetworkShare');

// Start auto-sync every 5 minutes (300000ms)
watchAndSync(300000);
```

---

## ⚠️ Important Notes

### Network Share Access
- The network share path `\\192.168.2.50\Users\HIS4\Desktop\Shared` must be accessible from your computer
- You need proper permissions to read files from the network share
- If the network is down, use local cached files instead

### File Types Supported
- **HTML**: `.html`, `.htm`
- **Documents**: `.pdf`, `.doc`, `.docx`, `.txt`, `.xls`, `.xlsx`, `.csv`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`, `.webp`

### Security
- Directory traversal protection is built-in
- Only files within the network share path can be accessed
- Consider adding authentication for production use

### Performance
- **Local cached files** are faster and more reliable
- **Direct network access** depends on network speed and availability
- Use local cache for production, direct access for development

---

## 🛠️ Troubleshooting

### Network Share Not Accessible

**Error:** "Network share not accessible"

**Solutions:**
1. Check if the network path is correct: `\\192.168.2.50\Users\HIS4\Desktop\Shared`
2. Verify you have permission to access the share
3. Try accessing the path in Windows Explorer first
4. Check if the network drive is connected
5. Use local cached files as fallback

### Files Not Found

**Error:** "File not found"

**Solutions:**
1. Run the copy script first: `node copyFromNetworkShare.js`
2. Check if files exist in the network share
3. Verify file names and paths are correct
4. Check the file type is supported

### Sync Not Working

**Solutions:**
1. Check network share accessibility
2. Verify you have write permissions to the local `shared` folder
3. Check console for error messages
4. Try manual copy first before auto-sync

---

## 📦 NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "sync": "node copyFromNetworkShare.js",
    "sync:watch": "node copyFromNetworkShare.js --watch 60000",
    "sync:specific": "node copyFromNetworkShare.js --files"
  }
}
```

Usage:
```bash
npm run sync              # Copy all files once
npm run sync:watch        # Auto-sync every 60 seconds
npm run sync:specific -- index.html logo.png  # Copy specific files
```

---

## 🎨 Frontend Integration Example

Create a simple HTML page to browse and display files:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Network Share Browser</title>
</head>
<body>
    <h1>Network Share Files</h1>
    
    <button onclick="checkStatus()">Check Status</button>
    <button onclick="syncFiles()">Sync Files</button>
    <button onclick="listFiles('html')">List HTML</button>
    <button onclick="listFiles('documents')">List Documents</button>
    <button onclick="listFiles('images')">List Images</button>
    
    <div id="status"></div>
    <div id="files"></div>

    <script>
        const API_BASE = 'http://localhost:3000/api';

        async function checkStatus() {
            const response = await fetch(`${API_BASE}/network/status`);
            const data = await response.json();
            document.getElementById('status').innerHTML = 
                `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }

        async function syncFiles() {
            const response = await fetch(`${API_BASE}/network/sync`, {
                method: 'POST'
            });
            const data = await response.json();
            alert(data.message);
        }

        async function listFiles(type) {
            const response = await fetch(`${API_BASE}/network/list?type=${type}`);
            const data = await response.json();
            
            let html = `<h2>${type} Files (${data.totalFiles})</h2><ul>`;
            data.files.forEach(file => {
                const url = `${API_BASE}/network/local/${type}/${file.path}`;
                html += `<li><a href="${url}" target="_blank">${file.name}</a> (${file.size} bytes)</li>`;
            });
            html += '</ul>';
            
            document.getElementById('files').innerHTML = html;
        }
    </script>
</body>
</html>
```

---

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify network share accessibility in Windows Explorer
3. Ensure all dependencies are installed: `npm install`
4. Check file permissions on both network share and local directories

---

## ✅ Checklist

- [ ] Network share is accessible from your computer
- [ ] Files copied successfully using `node copyFromNetworkShare.js`
- [ ] Server routes integrated into `server.cjs`
- [ ] Server running on port 3000
- [ ] Can access files via browser at `http://localhost:3000/api/network/local/...`
- [ ] (Optional) Auto-sync configured and running

---

**Ready to go!** 🚀

Start by running `node copyFromNetworkShare.js` to copy files, then access them through your browser!
