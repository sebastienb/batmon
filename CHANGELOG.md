# Changelog

All notable changes to the Hackberry Battery Monitor extension will be documented in this file.

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