# Claude Code Memory - Batmon Extension

## Project Overview
- Hackberry Battery Monitor GNOME extension (`hackberry-battery@batmon`)
- Located at: `/home/sebs/.local/share/gnome-shell/extensions/hackberry-battery@batmon/`
- Successfully fixed and working

## Extension Features
- Shows battery percentage in top panel
- Updates every 30 seconds
- Shows voltage and status in dropdown menu
- Uses `battery-reader.py` script to read battery data

## Resolved Issues
- ✅ Fixed ES6 module syntax incompatibility with GNOME Shell 43
- ✅ Fixed memory leak (2025-06-25): Timer duplication issue resolved

## Useful Commands
```bash
# Check extension status
gnome-extensions show hackberry-battery@batmon

# Enable/disable extension
gnome-extensions disable hackberry-battery@batmon
gnome-extensions enable hackberry-battery@batmon

# Check logs for debugging
journalctl -xe | grep -A5 -B5 "hackberry-battery"
```