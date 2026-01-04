#!/bin/bash
# Quick update script for Firefox Add-on

echo "Firefox Add-on Update Script"
echo "=============================="
echo ""

# Step 1: Remind about version
echo "1. Update version in manifest.json (current: 1.0.0 → suggested: 1.1.0)"
read -p "Press Enter after updating version..."

# Step 2: Disable debug mode
echo ""
echo "2. Set DEBUG_MODE: false in content.js line 9"
read -p "Press Enter after disabling debug mode..."

# Step 3: Run tests
echo ""
echo "3. Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed! Fix errors before continuing."
    exit 1
fi

# Step 4: Lint
echo ""
echo "4. Running lint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "Lint errors found! Fix before continuing."
    exit 1
fi

# Step 5: Build
echo ""
echo "5. Building extension..."
npm run build

echo ""
echo "=============================="
echo "Build complete!"
echo ""
echo "Next steps:"
echo "1. Test the .zip file in Firefox (about:debugging)"
echo "2. Go to https://addons.mozilla.org/developers/"
echo "3. Upload the .zip from web-ext-artifacts/"
echo "4. Fill in version notes (see UPDATE_GUIDE.md)"
echo "5. Submit for review"
echo ""
echo "The .zip file is ready at:"
ls -lh web-ext-artifacts/*.zip | tail -1
