#!/usr/bin/env python3
"""
Fetch GSC URL inspection & indexing status.
Requires: pip install google-api-python-client oauth2client
"""

import argparse
import json
import datetime
import sys
import os

SERVICE_ACCOUNT_FILE = "gsc-service-account.json"
SITE_URL = "sc-domain:daoessentia.com"

def get_credentials():
    try:
        from oauth2client.service_account import ServiceAccountCredentials
    except ImportError:
        print("ERROR: pip install oauth2client google-api-python-client", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"ERROR: {SERVICE_ACCOUNT_FILE} not found", file=sys.stderr)
        sys.exit(1)

    creds = ServiceAccountCredentials.from_json_keyfile_name(
        SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/webmasters"]
    )
    return creds

def main():
    parser = argparse.ArgumentParser(description="Fetch GSC URL submission/inspection data")
    parser.add_argument("--url", type=str, help="Single URL to inspect")
    parser.add_argument("--list", action="store_true", help="List latest submitted URLs from sitemap")
    parser.add_argument("--check-indexing", action="store_true", help="Check indexing status of sitemap URLs")
    args = parser.parse_args()

    creds = get_credentials()
    from googleapiclient.discovery import build
    service = build('webmasters', 'v3', credentials=creds)

    if args.url:
        # Use URL Inspection API
        from googleapiclient.errors import HttpError
        try:
            result = service.urlInspection().index().inspect(
                body={
                    "inspectionUrl": args.url,
                    "siteUrl": SITE_URL
                }
            ).execute()
            print(json.dumps(result, indent=2, ensure_ascii=False))
        except HttpError as e:
            print(f"Error: {e}")
    elif args.list or args.check_indexing:
        # Fetch sitemap URLs and check their status
        sitemaps = service.sitemaps().list(siteUrl=SITE_URL).execute()
        print(f"Found {len(sitemaps.get('sitemap', []))} sitemaps")
        for s in sitemaps.get('sitemap', []):
            print(f"  - {s['path']} ({s.get('lastSubmitted', 'N/A')})")
    else:
        print("Use --url <url> to inspect a URL, or --list to list sitemaps")
        print("\nNote: GSC doesn't have a 'submission history' API.")
        print("For URL submission history, check GSC web UI: https://search.google.com/search-console")

if __name__ == "__main__":
    main()
