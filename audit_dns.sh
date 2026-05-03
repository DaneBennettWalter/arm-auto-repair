#!/bin/bash
set -a
source ~/.openclaw/workspace/.env
set +a

# Extract all domains from the API response
DOMAINS=$(curl -sS "https://api.namecheap.com/xml.response?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_USER}&Command=namecheap.domains.getList&ClientIp=${NAMECHEAP_CLIENT_IP}&PageSize=200" | grep -oP 'Name="\K[^"]+')

echo "# DNS Resolution Audit - $(date +%Y-%m-%d)" > dns_audit_results.md
echo "" >> dns_audit_results.md
echo "Analyzing 104 domains..." >> dns_audit_results.md
echo "" >> dns_audit_results.md

for domain in $DOMAINS; do
    # Split domain into SLD and TLD
    if [[ $domain == *.*.* ]]; then
        # Handle cases like foo.co.uk (not present here, but defensive)
        SLD=$(echo $domain | rev | cut -d'.' -f3- | rev)
        TLD=$(echo $domain | rev | cut -d'.' -f1-2 | rev)
    else
        SLD=$(echo $domain | cut -d'.' -f1)
        TLD=$(echo $domain | cut -d'.' -f2-)
    fi
    
    echo "Checking $domain..." >&2
    
    # Get DNS records from Namecheap
    DNS_RESPONSE=$(curl -sS "https://api.namecheap.com/xml.response?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_USER}&Command=namecheap.domains.dns.getHosts&ClientIp=${NAMECHEAP_CLIENT_IP}&SLD=${SLD}&TLD=${TLD}" 2>/dev/null)
    
    # Check if using external DNS
    IS_EXTERNAL=$(echo "$DNS_RESPONSE" | grep -oP 'IsUsingOurDNS="\K[^"]+' | head -1)
    
    if [[ "$IS_EXTERNAL" == "false" ]]; then
        echo "## $domain" >> dns_audit_results.md
        echo "**Status:** External DNS (not using Namecheap)" >> dns_audit_results.md
        echo "" >> dns_audit_results.md
        continue
    fi
    
    # Extract records
    RECORDS=$(echo "$DNS_RESPONSE" | grep -oP '<host[^>]+>' | while read -r line; do
        NAME=$(echo "$line" | grep -oP 'Name="\K[^"]+')
        TYPE=$(echo "$line" | grep -oP 'Type="\K[^"]+')
        ADDRESS=$(echo "$line" | grep -oP 'Address="\K[^"]+')
        echo "$NAME|$TYPE|$ADDRESS"
    done)
    
    echo "## $domain" >> dns_audit_results.md
    
    if [[ -z "$RECORDS" ]]; then
        echo "**Status:** No DNS records configured" >> dns_audit_results.md
    else
        echo "$RECORDS" | while IFS='|' read -r name type address; do
            FULL_HOST="$name"
            [[ "$name" == "@" ]] && FULL_HOST="$domain"
            [[ "$name" == "www" ]] && FULL_HOST="www.$domain"
            
            echo "- **${FULL_HOST}** → ${TYPE}: \`${address}\`" >> dns_audit_results.md
            
            # Identify platform
            PLATFORM="Unknown"
            if [[ "$TYPE" == "URL"* ]]; then
                PLATFORM="URL Forward → $address"
            elif [[ "$address" == *"github.io"* ]]; then
                PLATFORM="GitHub Pages"
            elif [[ "$address" == *"replit"* ]] || [[ "$address" == *"repl.co"* ]]; then
                PLATFORM="Replit"
            elif [[ "$TYPE" == "CNAME" ]]; then
                # Could be various platforms
                if [[ "$address" == *"vercel"* ]]; then
                    PLATFORM="Vercel"
                elif [[ "$address" == *"netlify"* ]]; then
                    PLATFORM="Netlify"
                elif [[ "$address" == *"cloudflare"* ]]; then
                    PLATFORM="Cloudflare"
                elif [[ "$address" == *"herokuapp"* ]]; then
                    PLATFORM="Heroku"
                else
                    PLATFORM="CNAME to $address"
                fi
            elif [[ "$TYPE" == "A" ]]; then
                # Check known DigitalOcean IP ranges (common ones)
                case "$address" in
                    159.89.*|167.99.*|138.197.*|165.227.*|188.166.*|134.209.*|142.93.*|206.189.*|178.128.*|209.97.*)
                        PLATFORM="Likely DigitalOcean Droplet"
                        ;;
                    185.199.108.*|185.199.109.*|185.199.110.*|185.199.111.*)
                        PLATFORM="GitHub Pages (A record)"
                        ;;
                    76.76.21.*)
                        PLATFORM="Vercel"
                        ;;
                    *)
                        PLATFORM="A record: $address"
                        ;;
                esac
            fi
            
            echo "  - Platform: **${PLATFORM}**" >> dns_audit_results.md
        done
    fi
    
    echo "" >> dns_audit_results.md
    
    # Rate limit to avoid API throttling
    sleep 0.5
done

echo "Audit complete. Results saved to dns_audit_results.md" >&2
