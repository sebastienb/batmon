# Claude Code Memory - Batmon Extension Troubleshooting

## Current Status
- Working on fixing the Hackberry Battery Monitor GNOME extension (`hackberry-battery@batmon`)
- Extension is installed but showing ERROR state
- Located at: `/home/sebs/.local/share/gnome-shell/extensions/hackberry-battery@batmon/`

## Issue
- Extension was using modern ES6 module syntax incompatible with GNOME Shell 43
- Fixed by reverting to older import syntax and adding GObject.registerClass
- Extension code has been updated but GNOME Shell needs to be restarted to load the changes

## Files Modified
- `/home/sebs/.local/share/gnome-shell/extensions/hackberry-battery@batmon/extension.js` - Updated to use GNOME 43 compatible syntax
- Fixed memory leak (2025-06-25): Timer was being duplicated every 30 seconds causing exponential growth

## Next Steps
1. Log out and log back in (or restart GNOME Shell with Alt+F2 → 'r' → Enter)
2. After restart, the extension should appear in the top panel
3. If still not working, check with:
   - `gnome-extensions show hackberry-battery@batmon` (should show State: ENABLED)
   - `journalctl -b -g "hackberry-battery@batmon"` (to check for any new errors)

## Extension Features
- Shows battery percentage in top panel
- Updates every 30 seconds
- Shows voltage and status in dropdown menu
- Uses `battery-reader.py` script to read battery data

## Commands to Run After Restart
```bash
# Check if extension is enabled
gnome-extensions show hackberry-battery@batmon

# If not visible, try enabling again
gnome-extensions disable hackberry-battery@batmon
gnome-extensions enable hackberry-battery@batmon

# Check for errors if still not working
journalctl -xe | grep -A5 -B5 "hackberry-battery"
```