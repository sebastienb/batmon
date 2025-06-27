#!/bin/bash

# Hackberry Battery Monitor Extension Install/Update Script
# This script handles both fresh installation and updates

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Extension directory
EXTENSION_NAME="hackberry-battery@batmon"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_NAME"

echo -e "${GREEN}Hackberry Battery Monitor - Install/Update Script${NC}"
echo "================================================="

# Always try to disable the extension first, even if we think it's a fresh install
# This prevents issues if the extension is partially installed or in a bad state
if command -v gnome-extensions &> /dev/null; then
    echo "Ensuring extension is disabled before installation/update..."
    
    # Force disable, ignoring errors
    gnome-extensions disable "$EXTENSION_NAME" 2>/dev/null || true
    
    # Give GNOME Shell plenty of time to process
    echo "Waiting for GNOME Shell to fully disable the extension..."
    sleep 5  # Increased wait time
    
    # Double-check and try again if needed
    if gnome-extensions list --enabled 2>/dev/null | grep -q "$EXTENSION_NAME"; then
        echo -e "${YELLOW}Extension still enabled, trying harder...${NC}"
        # Try to unload it more forcefully
        gnome-extensions reset "$EXTENSION_NAME" 2>/dev/null || true
        sleep 3
    fi
fi

# Check if this is an update or fresh install
if [ -d "$EXTENSION_DIR" ]; then
    echo -e "${YELLOW}Existing installation detected. Updating...${NC}"
    MODE="update"
else
    echo -e "${GREEN}No existing installation found. Installing fresh...${NC}"
    MODE="install"
fi

# Create extension directory if it doesn't exist
mkdir -p "$EXTENSION_DIR"

# Final safety check before copying
if command -v gnome-extensions &> /dev/null; then
    if gnome-extensions list --enabled 2>/dev/null | grep -q "$EXTENSION_NAME"; then
        echo -e "${RED}ERROR: Extension is still enabled!${NC}"
        echo "This could cause GUI crashes. Please manually disable it:"
        echo "  gnome-extensions disable $EXTENSION_NAME"
        echo "Or restart GNOME Shell (Alt+F2, type 'r', press Enter)"
        echo "Then run this script again."
        exit 1
    fi
fi

# Copy extension files
echo "Copying extension files..."
cp -r hackberry-battery@batmon/* "$EXTENSION_DIR/"

# Make battery reader executable
chmod +x "$EXTENSION_DIR/battery-reader.py"

# Check Python dependencies
echo -e "\n${YELLOW}Checking Python dependencies...${NC}"
if ! python3 -c "import smbus2" 2>/dev/null; then
    echo -e "${RED}Missing Python dependency: smbus2${NC}"
    echo "Please install it with: sudo apt install python3-smbus2"
    exit 1
else
    echo -e "${GREEN}✓ Python dependencies satisfied${NC}"
fi

# Check if I2C is available
echo -e "\n${YELLOW}Checking I2C availability...${NC}"
if ls /dev/i2c-* 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓ I2C devices found (automatic detection enabled)${NC}"
else
    echo -e "${YELLOW}Warning: No I2C devices found${NC}"
    echo "Make sure I2C is enabled on your Hackberry CM5"
    echo "You can enable it with: sudo raspi-config"
fi

# Enable extension if gnome-extensions command is available
if command -v gnome-extensions &> /dev/null; then
    echo -e "\n${YELLOW}Enabling extension...${NC}"
    sleep 2  # Give GNOME Shell time to process file changes
    gnome-extensions enable "$EXTENSION_NAME" 2>/dev/null || {
        echo -e "${YELLOW}Could not enable extension automatically.${NC}"
        echo "You may need to restart GNOME Shell first."
    }
fi

# Success message
echo -e "\n${GREEN}Installation/Update complete!${NC}"

if [ "$MODE" = "update" ]; then
    echo -e "\n${YELLOW}What's new in this update:${NC}"
    echo "- Added battery charging detection"
    echo "- Shows charging icon when plugged in"
    echo "- Displays charge/discharge rate in menu"
    echo "- Improved status indicators"
fi

echo -e "\n${YELLOW}To apply changes:${NC}"
echo "1. Restart GNOME Shell:"
echo "   - Press Alt+F2"
echo "   - Type 'r' and press Enter"
echo "   - Or log out and log back in"
echo ""
echo "2. If the extension doesn't appear, enable it manually:"
echo "   gnome-extensions enable $EXTENSION_NAME"
echo ""
echo "3. Check the extension status:"
echo "   gnome-extensions info $EXTENSION_NAME"

# Test battery reader if possible
echo -e "\n${YELLOW}Testing battery reader...${NC}"
if python3 "$EXTENSION_DIR/battery-reader.py" 2>/dev/null; then
    echo -e "${GREEN}✓ Battery reader test successful${NC}"
else
    echo -e "${YELLOW}Battery reader test failed (this is normal if I2C is not available)${NC}"
fi

echo -e "\n${GREEN}Done!${NC}"