#!/usr/bin/env python3
import os
import requests
import xml.etree.ElementTree as ET
import time
from datetime import datetime

# Load environment variables
with open('.env') as f:
    for line in f:
        if line.strip() and not line.startswith('#'):
            key, value = line.strip().split('=', 1)
            os.environ[key] = value

API_USER = os.environ['NAMECHEAP_API_USER']
API_KEY = os.environ['NAMECHEAP_API_KEY']
USERNAME = os.environ['NAMECHEAP_USER']
CLIENT_IP = os.environ['NAMECHEAP_CLIENT_IP']

BASE_URL = 'https://api.namecheap.com/xml.response'

def get_domain_list():
    """Get all domains from Namecheap"""
    params = {
        'ApiUser': API_USER,
        'ApiKey': API_KEY,
        'UserName': USERNAME,
        'ClientIp': CLIENT_IP,
        'Command': 'namecheap.domains.getList',
        'PageSize': 100
    }
    response = requests.get(BASE_URL, params=params)
    root = ET.fromstring(response.text)
    
    domains = []
    # Namecheap API doesn't use namespace for Domain elements
    for domain in root.findall('.//{http://api.namecheap.com/xml.response}Domain'):
        domains.append({
            'name': domain.get('Name'),
            'is_our_dns': domain.get('IsOurDNS') == 'true'
        })
    return domains

def get_dns_records(domain_name):
    """Get DNS records for a specific domain"""
    parts = domain_name.split('.')
    sld = parts[0]
    tld = '.'.join(parts[1:])
    
    params = {
        'ApiUser': API_USER,
        'ApiKey': API_KEY,
        'UserName': USERNAME,
        'ClientIp': CLIENT_IP,
        'Command': 'namecheap.domains.dns.getHosts',
        'SLD': sld,
        'TLD': tld
    }
    
    try:
        response = requests.get(BASE_URL, params=params)
        root = ET.fromstring(response.text)
        
        # Namecheap API doesn't use namespace for host elements  
        hosts = root.findall('.//{http://api.namecheap.com/xml.response}host')
        
        records = []
        for host in hosts:
            records.append({
                'name': host.get('Name'),
                'type': host.get('Type'),
                'address': host.get('Address')
            })
        
        return records
    except Exception as e:
        print(f"Error getting DNS for {domain_name}: {e}")
        return []

def identify_platform(record_type, address):
    """Identify hosting platform based on DNS record"""
    if record_type.startswith('URL'):
        return f"URL Forward → {address}"
    
    if 'github.io' in address:
        return "GitHub Pages"
    
    if 'replit' in address or 'repl.co' in address:
        return "Replit"
    
    if record_type == 'CNAME':
        if 'vercel' in address:
            return "Vercel"
        elif 'netlify' in address:
            return "Netlify"
        elif 'cloudflare' in address:
            return "Cloudflare"
        elif 'herokuapp' in address:
            return "Heroku"
        else:
            return f"CNAME → {address}"
    
    if record_type == 'A':
        # GitHub Pages IPs
        if address.startswith('185.199.108.') or address.startswith('185.199.109.') or \
           address.startswith('185.199.110.') or address.startswith('185.199.111.'):
            return "GitHub Pages"
        
        # Common DigitalOcean ranges
        do_prefixes = ['159.89.', '167.99.', '138.197.', '165.227.', '188.166.',
                       '134.209.', '142.93.', '206.189.', '178.128.', '209.97.']
        for prefix in do_prefixes:
            if address.startswith(prefix):
                return f"DigitalOcean Droplet ({address})"
        
        # Vercel
        if address.startswith('76.76.21.'):
            return "Vercel"
        
        return f"A record → {address}"
    
    return "Unknown"

# Main execution
print("Fetching domain list...")
domains = get_domain_list()
print(f"Found {len(domains)} domains\n")

with open('dns_audit_results.md', 'w') as f:
    f.write(f"# DNS Resolution Audit - {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
    f.write(f"Total domains: {len(domains)}\n\n")
    f.write("---\n\n")
    
    # Group by platform
    platforms = {}
    external_dns = []
    no_records = []
    
    for i, domain in enumerate(domains, 1):
        print(f"[{i}/{len(domains)}] Checking {domain['name']}...")
        
        if not domain['is_our_dns']:
            external_dns.append(domain['name'])
            f.write(f"## {domain['name']}\n")
            f.write("**Status:** External DNS (not using Namecheap)\n\n")
            continue
        
        records = get_dns_records(domain['name'])
        
        if not records:
            no_records.append(domain['name'])
            f.write(f"## {domain['name']}\n")
            f.write("**Status:** No DNS records configured\n\n")
            continue
        
        f.write(f"## {domain['name']}\n\n")
        
        domain_platforms = set()
        for record in records:
            host_name = record['name']
            if host_name == '@':
                host_name = domain['name']
            elif host_name != '*':
                host_name = f"{host_name}.{domain['name']}"
            
            platform = identify_platform(record['type'], record['address'])
            domain_platforms.add(platform)
            
            f.write(f"- **{host_name}** → {record['type']}: `{record['address']}`\n")
            f.write(f"  - Platform: **{platform}**\n")
        
        f.write("\n")
        
        # Track platforms for summary
        for platform in domain_platforms:
            if platform not in platforms:
                platforms[platform] = []
            platforms[platform].append(domain['name'])
        
        # Rate limit
        time.sleep(0.3)
    
    # Write summary
    f.write("\n---\n\n")
    f.write("# Summary by Platform\n\n")
    
    for platform, domain_list in sorted(platforms.items()):
        f.write(f"## {platform}\n")
        f.write(f"**Count:** {len(domain_list)}\n\n")
        for d in sorted(domain_list):
            f.write(f"- {d}\n")
        f.write("\n")
    
    if external_dns:
        f.write(f"## External DNS ({len(external_dns)} domains)\n\n")
        for d in sorted(external_dns):
            f.write(f"- {d}\n")
        f.write("\n")
    
    if no_records:
        f.write(f"## No DNS Records ({len(no_records)} domains)\n\n")
        for d in sorted(no_records):
            f.write(f"- {d}\n")
        f.write("\n")

print("\nAudit complete! Results saved to dns_audit_results.md")
