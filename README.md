# Hackberry Battery Monitor

A GNOME Shell extension for monitoring battery state on Hackberry Pi CM5 devices using the MAX17048 fuel gauge IC. Displays battery percentage and voltage in the GNOME top panel.

![Batmon for HackberryPi CM5](https://github.com/sebastienb/batmon/blob/main/screencast.gif?raw=true)

This is built with claude code using the python sample provided by https://github.com/ZitaoTech/HackberryPiCM5

## Version 0.2.2 (2025-06-26)

### What's New
- **Configurable refresh interval** (5-60 seconds) via settings UI
- **Settings UI** accessible through GNOME Extensions app preferences
- **Improved charging detection** with lower threshold (0.2%/hr)
- **Faster default refresh** (15 seconds instead of 30)
- **Fixed install script** to prevent GUI freezing during updates

## Features

- Real-time battery percentage and voltage monitoring
- Charging detection with visual indicators (lightning bolt icon)
- Configurable refresh interval (5-60 seconds) via settings UI
- GNOME Shell integration with panel indicator
- Dynamic battery icon based on charge level
- Dropdown menu showing voltage, status, and charge/discharge rate
- Automatic I2C bus detection (no more hardcoded bus numbers!)
- Support for GNOME Shell versions 42-47

## Requirements

- Hackberry Pi CM5 or compatible device with MAX17048 fuel gauge
- GNOME Shell 42 or later
- Python 3 with smbus2 module
- I2C enabled on your system

## Installation

### 1. Install Dependencies

```bash
sudo apt update
sudo apt install python3-smbus2
```

### 2. Enable I2C

Ensure I2C is enabled on your system. On Raspberry Pi OS:

```bash
sudo raspi-config
# Navigate to Interface Options > I2C > Enable
```

### 3. Install the Extension

Clone the repository and run the installation script:

```bash
git clone https://github.com/sebastienb/batmon.git
cd batmon
./install-or-update.sh
```

### Updating the Extension

To update to the latest version:

```bash
cd batmon
git pull
./install-or-update.sh
```

The script will automatically handle the update process and preserve your settings.

### 4. Enable the Extension

After installation, restart GNOME Shell:
- Press `Alt+F2`
- Type `r` and press Enter

Then enable the extension:

```bash
gnome-extensions enable hackberry-battery@batmon
```

Alternatively, use the GNOME Extensions app to enable it.

## Testing

To test the battery voltage reading independently:

```bash
python3 get_battery_voltage.py
```

This will continuously display the battery voltage. Press `Ctrl+C` to stop.

## Configuration

The extension uses the following default settings:
- I2C Bus: Auto-detected (scans available buses)
- I2C Address: 0x36 (MAX17048 default)
- Update Interval: 15 seconds (configurable 5-60 seconds)

### Settings UI

Access extension preferences by:
1. Opening GNOME Extensions app
2. Finding "Hackberry Battery Monitor"
3. Clicking the settings/gear icon
4. Adjust refresh interval to your preference

### Battery Status Levels
- **Full**: > 80%
- **Good**: 60-80%
- **Medium**: 40-60%
- **Low**: 20-40%
- **Critical**: < 20%

## File Structure

```
batmon/
├── get_battery_voltage.py          # Standalone battery voltage reader
├── install.sh                      # Legacy installation script
├── install-or-update.sh            # Install/Update script (recommended)
├── README.md                       # This file
└── hackberry-battery@batmon/       # GNOME extension files
    ├── extension.js                # Main extension code
    ├── metadata.json               # Extension metadata
    ├── battery-reader.py           # Python script with charging detection
    ├── prefs.js                    # Settings UI
    └── schemas/                    # GSettings schema files
        └── org.gnome.shell.extensions.hackberry-battery.gschema.xml
```

## Uninstallation

To remove the extension:

```bash
gnome-extensions uninstall hackberry-battery@batmon
```

Or manually remove:

```bash
rm -rf ~/.local/share/gnome-shell/extensions/hackberry-battery@batmon
```

## Troubleshooting

### Extension not showing up
- Ensure GNOME Shell was restarted after installation
- Check extension is enabled: `gnome-extensions list`
- View logs: `journalctl -f -o cat /usr/bin/gnome-shell`

### I2C Permission Issues
If you get permission errors, add your user to the i2c group:

```bash
sudo usermod -a -G i2c $USER
```

Then log out and back in.

### Battery Reading Errors
- Verify I2C is enabled: `ls /dev/i2c*`
- Check I2C device is detected: `sudo i2cdetect -y [bus_number]` (try different bus numbers)
- Ensure MAX17048 is at address 0x36
- Check extension logs: `journalctl -xe | grep hackberry-battery`

## License

This project is open source. Please check the repository for license details.

## Contributing

Contributions are welcome! Please submit issues and pull requests on GitHub.
