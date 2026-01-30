# Google Sheets & Drive Integration Setup Guide

To enable the "Export to Google Sheets" and "Backup to Drive" features, you need to create a Service Account in Google Cloud and download a key file.

## Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Name it `ProjectBill-Hospital` and click **Create**.
4. Select the new project.

## Step 2: Enable APIs
1. In the search bar at the top, type **Google Drive API** and select it.
2. Click **Enable**.
3. Search for **Google Sheets API** and select it.
4. Click **Enable**.

## Step 3: Create Service Account & Key
1. Go to **IAM & Admin** > **Service Accounts**.
2. Click **+ CREATE SERVICE ACCOUNT**.
3. Name it `billing-exporter` and click **Create and Continue**.
4. For Role, select **Basic** > **Editor** (or file-specific roles if you prefer restriction). Click **Continue**.
5. Click **Done**.
6. Click on the newly created service account email (e.g., `billing-exporter@...`).
7. Go to the **Keys** tab.
8. Click **Add Key** > **Create new key**.
9. Select **JSON** and click **Create**.
10. A file will download automatically. **Rename this file to `service-account-key.json`**.

## Step 4: Add Key to Server
1. Copy the `service-account-key.json` file you just downloaded.
2. Paste it into the `projectbilling` folder on your server (where `server.cjs` is located).

## Step 5: Configure Environment
1. Open the `.env` file in the `projectbilling` folder.
2. Ensure it looks like this:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   GOOGLE_SHARE_EMAIL=ict@apmcaklan.com
   ```

## Step 6: Restart Server
1. In your terminal, stop the server (Ctrl+C).
2. Start it again: `node server.cjs`

## Verification
- Go to the Billing Dashboard.
- Click the **Export to Google Sheets** button.
- Check the inbox for `ict@apmcaklan.com` (or "Shared with me" in Drive) for the new spreadsheet.
