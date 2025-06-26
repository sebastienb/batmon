# Claude Code Memory - Batmon Extension

## Project Overview
- Hackberry Battery Monitor GNOME extension (`hackberry-battery@batmon`)
- Located at: `/home/sebs/.local/share/gnome-shell/extensions/hackberry-battery@batmon/`
- Current version: **v0.2.1** (released 2025-06-26)
- GitHub: https://github.com/sebastienb/batmon

## Latest Updates (v0.2.1)
- ✅ Fixed I2C bus detection (changed from bus 11 to bus 13)
- ✅ Fixed GNOME Shell 43 compatibility with GObject.registerClass syntax
- ✅ Extension now properly displays battery values

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
- Updates every 30 seconds
- Dropdown menu shows:
  - Voltage
  - Status (Charging/Discharging/Idle/Full/Good/Medium/Low/Critical)
  - Charge Rate
  - Version number

## Technical Details
- Uses MAX17048 fuel gauge IC on I2C bus 13, address 0x36
- Reads voltage (registers 0x02-0x03), SOC (0x04-0x05), and CRATE (0x16)
- `battery-reader.py` returns JSON with voltage, percentage, status, charging, and charge_rate

## Resolved Issues
- ✅ Fixed I2C bus detection issue (v0.2.1): Changed from bus 11 to bus 13
- ✅ Fixed GNOME Shell 43 compatibility (v0.2.1): Used GObject.registerClass syntax
- ✅ Fixed ES6 module syntax incompatibility with GNOME Shell 43
- ✅ Fixed memory leak (2025-06-25): Timer duplication issue resolved

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

## Next Steps After Login
- Check if extension shows charging status correctly
- Verify version number appears in dropdown
- Test with charger plugged/unplugged if possible