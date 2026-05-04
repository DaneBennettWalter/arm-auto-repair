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

# Search for loan-related documents
print("Searching for loan/financing documents...")
queries = [
    "name contains 'loan'",
    "name contains 'financing'",
    "name contains 'bank'",
    "name contains 'lender'",
    "name contains 'underwriting'"
]

all_files = []
for query in queries:
    results = service.files().list(
        q=query,
        pageSize=50,
        fields="files(id, name, mimeType, modifiedTime)"
    ).execute()
    all_files.extend(results.get('files', []))

# Remove duplicates
seen = set()
unique_files = []
for f in all_files:
    if f['id'] not in seen:
        seen.add(f['id'])
        unique_files.append(f)

print(f"\nFound {len(unique_files)} loan-related files:\n")
for item in unique_files[:30]:  # Show first 30
    print(f"📄 {item['name']}")
    print(f"   Type: {item['mimeType']}")
    print(f"   Modified: {item.get('modifiedTime', 'N/A')}")
    print()
