#!/usr/bin/env python3
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Load from .env
with open('.env', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            key, value = line.strip().split('=', 1)
            os.environ[key] = value

# Try with the refresh token - use the scopes it was issued for
creds = Credentials(
    token=None,
    refresh_token=os.environ['GOOGLE_DRIVE_REFRESH_TOKEN'],
    token_uri='https://oauth2.googleapis.com/token',
    client_id=os.environ['GOOGLE_OAUTH_CLIENT_ID'],
    client_secret=os.environ['GOOGLE_OAUTH_CLIENT_SECRET'],
    scopes=['https://www.googleapis.com/auth/drive']  # Try single scope first
)

print("Refreshing credentials...")
creds.refresh(Request())
print("✅ Authentication successful!")

print("\nSearching for Hotel Brendle documents...")
service = build('drive', 'v3', credentials=creds)

# Search for files
query = "name contains '601' or name contains 'Brendle' or name contains 'rent'"
results = service.files().list(
    q=query,
    pageSize=20,
    fields="files(id, name, mimeType, modifiedTime, webViewLink, parents)"
).execute()

files = results.get('files', [])
print(f"\n📁 Found {len(files)} files:\n")

for item in files:
    print(f"📄 {item['name']}")
    print(f"   ID: {item['id']}")
    print(f"   Type: {item['mimeType']}")
    print(f"   Modified: {item.get('modifiedTime', 'N/A')}")
    print(f"   Link: {item.get('webViewLink', 'N/A')}")
    print()
