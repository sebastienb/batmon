# Claude Code Memory - Batmon Extension

## Project Overview
- Hackberry Battery Monitor GNOME extension (`hackberry-battery@batmon`)
- Located at: `/home/sebs/.local/share/gnome-shell/extensions/hackberry-battery@batmon/`
- Current version: **v0.2.2** (released 2025-06-26)
- GitHub: https://github.com/sebastienb/batmon

## Latest Updates (v0.2.2)
- ✅ **NEW**: Added configurable refresh interval (5-60 seconds) via settings UI
- ✅ **NEW**: Extension preferences accessible through GNOME Extensions app
- ✅ **NEW**: GSettings integration for persistent configuration
- ✅ Changed default refresh interval from 30s to 15s for better responsiveness
- ✅ Added automatic I2C bus detection - no more hardcoded bus numbers!
- ✅ Fixed I2C bus detection (changed from bus 11 to bus 13)
- ✅ Fixed GNOME Shell 43 compatibility with GObject.registerClass syntax

## Previous Updates (v0.2.0)
- ✅ Added charging detection using MAX17048 CRATE register
- ✅ Shows lightning bolt icon when charging
- ✅ Displays charge/discharge rate in dropdown (e.g., "+5.2%/hr")
- ✅ Added version number to dropdown menu
- ✅ Created `install-or-update.sh` script for easy updates
- ✅ Published GitHub release: https://github.com/sebastienb/batmon/releases/tag/v0.2.0

## Extension Features
- Shows battery percentage in top panel
- Dynamic battery icon based on charge level
- Charging icon (lightning bolt) when plugged in
- **Configurable refresh interval** (5-60 seconds, default 15s)
- **Settings UI** accessible via GNOME Extensions app preferences
- Dropdown menu shows:
  - Voltage
  - Status (Charging/Discharging/Idle/Full/Good/Medium/Low/Critical)
  - Charge Rate
  - Version number

## Technical Details
- Uses MAX17048 fuel gauge IC at address 0x36 with **automatic I2C bus detection**
- Scans `/dev/i2c-*` devices to find the correct bus (currently bus 13)
- Reads voltage (registers 0x02-0x03), SOC (0x04-0x05), and CRATE (0x16)
- `battery-reader.py` returns JSON with voltage, percentage, status, charging, and charge_rate
- Debug output shows which I2C bus was detected

## Resolved Issues
- ✅ **MAJOR**: Implemented automatic I2C bus detection (v0.2.1+) - prevents future bus numbering issues
- ✅ Fixed I2C bus detection issue (v0.2.1): Changed from bus 11 to bus 13
- ✅ Fixed GNOME Shell 43 compatibility (v0.2.1): Used GObject.registerClass syntax
- ✅ Fixed ES6 module syntax incompatibility with GNOME Shell 43
- ✅ Fixed memory leak (2025-06-25): Timer duplication issue resolved
- ✅ **FIXED (2025-06-26)**: Lightning bolt charging icon not showing - lowered threshold from 1.0%/hr to 0.2%/hr
- ✅ **FIXED (2025-06-26)**: Slow charging detection - uses configurable refresh interval (default 15s, down from 30s)
- ✅ **FIXED (2025-06-26)**: Install script GUI freeze - added proper disable/enable delays and verification

## Useful Commands
```bash
# Install/Update the extension
cd /home/sebs/Projects/batmon
./install-or-update.sh

# Check extension status
gnome-extensions show hackberry-battery@batmon

# Check logs for debugging
journalctl -xe | grep -A5 -B5 "hackberry-battery"
```

## Release History
- **v0.2.2** (2025-06-26): Added settings UI, configurable refresh interval, improved charging detection
- **v0.2.1** (2025-06-26): Fixed I2C bus detection, GNOME Shell 43 compatibility
- **v0.2.0** (2025-06-25): Added charging detection, version tracking, install script

## ⚠️ CRITICAL CODING REMINDERS
**ALWAYS remember these to prevent GType errors:**

1. **NEVER modify class constructors without GObject.registerClass**
   - Any class that extends St.Widget, PanelMenu.Button, or other GObject classes MUST use `GObject.registerClass()`
   - Example: `const BatteryIndicator = GObject.registerClass(class BatteryIndicator extends PanelMenu.Button { ... });`

2. **NEVER add new properties to GObject classes without declaring them**
   - Use `GObject.ParamSpec` for new properties or avoid adding properties entirely
   - Prefer using regular JavaScript variables instead of GObject properties

3. **COMMON GType ERROR TRIGGERS:**
   - Changing constructor parameters
   - Adding instance variables directly to `this` in GObject classes
   - Modifying class inheritance without updating registerClass
   - Adding methods that conflict with parent class methods

4. **SAFE APPROACH:**
   - Keep existing constructor signatures unchanged
   - Use local variables instead of instance properties when possible
   - Test immediately after any class-related changes
   - If GType errors occur, revert and use simpler approach