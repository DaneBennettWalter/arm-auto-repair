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

creds = Credentials(
    token=None,
    refresh_token=os.environ['GOOGLE_DRIVE_REFRESH_TOKEN'],
    token_uri='https://oauth2.googleapis.com/token',
    client_id=os.environ['GOOGLE_OAUTH_CLIENT_ID'],
    client_secret=os.environ['GOOGLE_OAUTH_CLIENT_SECRET'],
    scopes=['https://www.googleapis.com/auth/drive']
)

creds.refresh(Request())
service = build('drive', 'v3', credentials=creds)

# Get files in Bank folder
bank_folder_id = service.files().list(
    q="name='Bank' and mimeType='application/vnd.google-apps.folder'",
    fields="files(id)"
).execute()['files'][0]['id']

print(f"📁 Bank folder ID: {bank_folder_id}\n")
print("Files in Bank folder:\n")

results = service.files().list(
    q=f"'{bank_folder_id}' in parents",
    pageSize=100,
    fields="files(id, name, mimeType, modifiedTime, size, webViewLink)"
).execute()

files = results.get('files', [])
print(f"Found {len(files)} files:\n")

for item in files:
    size_mb = int(item.get('size', 0)) / (1024*1024) if item.get('size') else 0
    print(f"📄 {item['name']}")
    print(f"   ID: {item['id']}")
    print(f"   Type: {item['mimeType']}")
    if size_mb > 0:
        print(f"   Size: {size_mb:.2f} MB")
    print(f"   Modified: {item.get('modifiedTime', 'N/A')}")
    print(f"   Link: {item.get('webViewLink', 'N/A')}")
    print()
