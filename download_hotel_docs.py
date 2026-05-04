#!/usr/bin/env python3
import os
import io
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
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

# Download the main rent roll
print("Downloading '601 E Ave A' (current rent roll)...")
file_id = '1bxVxbJ00ks3P8__WQWiwB16yjhxrqTJheDkCg6PN55w'
request = service.files().export_media(fileId=file_id, mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
fh = io.FileIO('hotel-brendle-rent-roll.xlsx', 'wb')
downloader = MediaIoBaseDownload(fh, request)
done = False
while not done:
    status, done = downloader.next_chunk()
    print(f"  Download {int(status.progress() * 100)}%")
fh.close()
print("✅ Saved: hotel-brendle-rent-roll.xlsx")

# Download the pro forma
print("\nDownloading 'Hotel Brendle Pro Forma 2025-2029'...")
file_id = '1NaM-kWLeMyy4Wnb9R3vVTHTgn7-5_89vvo8RFIZYRes'
request = service.files().export_media(fileId=file_id, mimeType='application/pdf')
fh = io.FileIO('hotel-brendle-pro-forma.pdf', 'wb')
downloader = MediaIoBaseDownload(fh, request)
done = False
while not done:
    status, done = downloader.next_chunk()
    print(f"  Download {int(status.progress() * 100)}%")
fh.close()
print("✅ Saved: hotel-brendle-pro-forma.pdf")

print("\n✅ Documents downloaded successfully")
