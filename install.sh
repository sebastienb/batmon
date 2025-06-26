#!/bin/bash

# Install script for Hackberry Battery Monitor GNOME Extension

EXTENSION_UUID="hackberry-battery@batmon"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

echo "Installing Hackberry Battery Monitor extension..."

# Create extension directory
mkdir -p "$EXTENSION_DIR"

# Copy extension files
cp -r hackberry-battery@batmon/* "$EXTENSION_DIR/"

echo "Extension installed to: $EXTENSION_DIR"
echo ""
echo "To enable the extension:"
echo "1. Restart GNOME Shell (Alt+F2, type 'r', press Enter)"
echo "2. Enable the extension using:"
echo "   gnome-extensions enable $EXTENSION_UUID"
echo ""
echo "Or use GNOME Extensions app to enable it."
echo ""
echo "Note: Make sure python3-smbus2 is installed:"
echo "  sudo apt install python3-smbus2"