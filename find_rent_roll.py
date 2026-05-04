#!/usr/bin/env python3
import os
import json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Load credentials from .env
with open('.env', 'r') as f:
    env_vars = {}
    for line in f:
        if '=' in line and not line.startswith('#'):
            key, value = line.strip().split('=', 1)
            env_vars[key] = value

# Set up OAuth credentials
creds = Credentials(
    token=None,
    refresh_token=env_vars.get('GOOGLE_DRIVE_REFRESH_TOKEN'),
    token_uri='https://oauth2.googleapis.com/token',
    client_id=env_vars.get('GOOGLE_OAUTH_CLIENT_ID'),
    client_secret=env_vars.get('GOOGLE_OAUTH_CLIENT_SECRET'),
    scopes=['https://www.googleapis.com/auth/drive.readonly', 
            'https://www.googleapis.com/auth/spreadsheets.readonly']
)

# Refresh the token
if creds.refresh_token:
    creds.refresh(Request())
    
    # Build the service
    service = build('drive', 'v3', credentials=creds)
    
    # Search for files with "601" in the name
    print("Searching Google Drive for rent roll...")
    results = service.files().list(
        q="name contains '601' or name contains 'rent roll' or name contains 'Hotel Brendle'",
        pageSize=20,
        fields="files(id, name, mimeType, modifiedTime, webViewLink)"
    ).execute()
    
    files = results.get('files', [])
    
    if not files:
        print('No files found.')
    else:
        print(f'\nFound {len(files)} files:\n')
        for item in files:
            print(f"Name: {item['name']}")
            print(f"  ID: {item['id']}")
            print(f"  Type: {item['mimeType']}")
            print(f"  Modified: {item.get('modifiedTime', 'N/A')}")
            print(f"  Link: {item.get('webViewLink', 'N/A')}")
            print()
else:
    print("No refresh token found")
