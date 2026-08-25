#!/bin/bash

# PWA Asset Diagnostic Script

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PWA Asset Diagnostic ===${NC}\n"

# 1. Check for files in public/
assets=("app-logo.png" "icon-192.png" "icon-512.png" "favicon.png" "apple-touch-icon.png")

echo -e "Checking files in public/ folder:"
for asset in "${assets[@]}"; do
    if [ -f "public/$asset" ]; then
        SIZE=$(ls -lh "public/$asset" | awk '{print $5}')
        INFO=$(file "public/$asset" | cut -d: -f2)
        echo -e "  [${GREEN}FOUND${NC}] $asset ($SIZE) - $INFO"
    else
        echo -e "  [${RED}MISSING${NC}] $asset"
    fi
done

# 2. Check manifest configuration in vite.config.ts
echo -e "\nChecking PWA configuration in vite.config.ts:"
if grep -q "src: '/icon-192.png'" vite.config.ts; then
    echo -e "  [${GREEN}OK${NC}] icon-192.png path is correctly configured as absolute (/icon-192.png)"
else
    echo -e "  [${RED}WARNING${NC}] icon-192.png path might be incorrect in vite.config.ts"
fi

if grep -q "src: '/icon-512.png'" vite.config.ts; then
    echo -e "  [${GREEN}OK${NC}] icon-512.png path is correctly configured as absolute (/icon-512.png)"
else
    echo -e "  [${RED}WARNING${NC}] icon-512.png path might be incorrect in vite.config.ts"
fi

# 3. Check for manifest.json generation in dist (if exists)
if [ -d "dist" ]; then
    echo -e "\nChecking build output (dist/):"
    if [ -f "dist/manifest.json" ]; then
        echo -e "  [${GREEN}OK${NC}] manifest.json exists in dist/"
        # Check if icons are in manifest.json
        if grep -q "icon-192.png" dist/manifest.json; then
             echo -e "  [${GREEN}OK${NC}] Icons are included in built manifest.json"
        else
             echo -e "  [${RED}ERROR${NC}] Icons are MISSING in built manifest.json!"
        fi
    else
        echo -e "  [${RED}WARNING${NC}] manifest.json not found in dist/. Run 'npm run build' first."
    fi
else
    echo -e "\n[INFO] dist/ folder not found. Run 'npm run build' to check production output."
fi

echo -e "\n${BLUE}=== Diagnostic Complete ===${NC}"
