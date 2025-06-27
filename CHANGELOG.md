# Changelog

All notable changes to the Hackberry Battery Monitor extension will be documented in this file.

## [0.2.3] - 2025-06-27

### Fixed
- **CRITICAL**: Fixed GUI freeze bug caused by timer accumulation - timers were being created without canceling previous ones, leading to exponential resource usage and system freezes
- Added proper timer cleanup in the `_updateBattery()` method to prevent resource leaks

### Added
- I2C bus caching to improve performance - stores last known bus location to avoid scanning all buses on every update
- 2-second timeout protection for I2C operations to prevent indefinite hangs

### Changed
- Enhanced install script to more aggressively disable extension before updates, preventing GUI freezes during installation

## [0.2.2] - 2025-06-26

### Added
- Configurable refresh interval (5-60 seconds) via settings UI
- Extension preferences accessible through GNOME Extensions app
- GSettings integration for persistent configuration

### Changed
- Default refresh interval from 30s to 15s for better responsiveness

### Fixed
- Lightning bolt charging icon threshold lowered from 1.0%/hr to 0.2%/hr for better detection
- Install script GUI freeze with proper disable/enable delays and verification

## [0.2.1] - 2025-06-26

### Fixed
- I2C bus detection issue - changed from hardcoded bus 11 to automatic detection (currently bus 13)
- GNOME Shell 43 compatibility using GObject.registerClass syntax

### Added
- Automatic I2C bus detection to prevent future bus numbering issues

## [0.2.0] - 2025-06-26

### Added
- Battery charging detection using MAX17048 CRATE register
- Visual charging indicators (lightning bolt icon) when plugged in
- Charge/discharge rate display in dropdown menu (e.g., "+5.2%/hr")
- Dynamic charging status: "Charging", "Discharging", or "Idle"
- Version number display in dropdown menu
- Smart install/update script (`install-or-update.sh`)
- Update instructions in README

### Changed
- Updated extension description to mention charging detection
- Improved status indicators with proper capitalization
- Enhanced README with new features and update process

### Fixed
- Memory leak issue where timer was being duplicated every 30 seconds

## [0.1.0] - 2025-06-24

### Initial Release
- Basic battery monitoring for Hackberry Pi CM5
- Battery percentage display in GNOME top panel
- Voltage reading from MAX17048 fuel gauge IC
- Dynamic battery icon based on charge level
- Dropdown menu showing voltage and battery status
- Support for GNOME Shell versions 42-47