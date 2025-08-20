#!/bin/bash

# Script to publish all @metrixlabs packages
echo "Publishing all @metrixlabs packages..."

# Get all package.json files with @metrixlabs namespace
PACKAGES=$(find packages -name "package.json" -exec grep -l '"name": "@metrixlabs/' {} \;)

# Counter for published packages
PUBLISHED=0
TOTAL=$(echo "$PACKAGES" | wc -l)

echo "Found $TOTAL packages to publish"

for package in $PACKAGES; do
    # Get package directory
    PACKAGE_DIR=$(dirname "$package")
    PACKAGE_NAME=$(grep '"name"' "$package" | sed 's/.*"name": "@metrixlabs\/\([^"]*\)".*/\1/')
    
    echo "[$((++PUBLISHED))/$TOTAL] Publishing @metrixlabs/$PACKAGE_NAME from $PACKAGE_DIR"
    
    # Navigate to package directory and publish
    cd "$PACKAGE_DIR"
    npm publish --access public --tag experimental
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully published @metrixlabs/$PACKAGE_NAME"
    else
        echo "❌ Failed to publish @metrixlabs/$PACKAGE_NAME"
    fi
    
    # Go back to root
    cd ../../..
done

echo "Publishing complete! Published $PUBLISHED packages."
