const { St, GLib, Gio, Clutter, GObject } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let indicator;
let timeout;

const BatteryIndicator = GObject.registerClass(
class BatteryIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Hackberry Battery Indicator');
        
        // Create icon
        this.icon = new St.Icon({
            icon_name: 'battery-level-100-symbolic',
            style_class: 'system-status-icon'
        });
        
        // Create percentage label
        this.label = new St.Label({ 
            text: '--',
            y_align: Clutter.ActorAlign.CENTER 
        });
        
        // Add to panel
        let box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        box.add_child(this.icon);
        box.add_child(this.label);
        this.add_child(box);
        
        // Create menu items
        this.voltageItem = new PopupMenu.PopupMenuItem('Voltage: --');
        this.voltageItem.reactive = false;
        this.menu.addMenuItem(this.voltageItem);
        
        this.statusItem = new PopupMenu.PopupMenuItem('Status: --');
        this.statusItem.reactive = false;
        this.menu.addMenuItem(this.statusItem);
        
        this.chargeRateItem = new PopupMenu.PopupMenuItem('Charge Rate: --');
        this.chargeRateItem.reactive = false;
        this.menu.addMenuItem(this.chargeRateItem);
        
        // Add separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Add version info
        let metadata = imports.misc.extensionUtils.getCurrentExtension().metadata;
        let version = metadata['version-name'] || metadata['version'] || 'Unknown';
        this.versionItem = new PopupMenu.PopupMenuItem(`Version: ${version}`);
        this.versionItem.reactive = false;
        this.menu.addMenuItem(this.versionItem);
        
        // Start updates
        this._updateBattery();
        
        // Schedule periodic updates (every 15 seconds by default)
        timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 15, () => {
            this._updateBattery();
            return GLib.SOURCE_CONTINUE;
        });
    }
    
    _updateBattery() {
        try {
            let extensionPath = imports.misc.extensionUtils.getCurrentExtension().path;
            let batteryReaderPath = GLib.build_filenamev([extensionPath, 'battery-reader.py']);
            
            let proc = Gio.Subprocess.new(
                ['timeout', '2', 'python3', batteryReaderPath],  // 2 second timeout
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
            
            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                    
                    if (stdout) {
                        let data = JSON.parse(stdout);
                        
                        if (data.error) {
                            this.label.set_text('ERR');
                            this.icon.icon_name = 'battery-missing-symbolic';
                        } else {
                            // Update percentage
                            if (data.percentage !== null) {
                                this.label.set_text(` ${Math.round(data.percentage)}%`);
                                
                                // Update icon based on percentage and charging status
                                let iconName;
                                if (data.charging) {
                                    // Use modern charging icons with 10% increments
                                    if (data.percentage === 100) {
                                        iconName = 'battery-level-100-charged-symbolic';
                                    } else if (data.percentage >= 95) {
                                        iconName = 'battery-level-100-charging-symbolic';
                                    } else if (data.percentage >= 85) {
                                        iconName = 'battery-level-90-charging-symbolic';
                                    } else if (data.percentage >= 75) {
                                        iconName = 'battery-level-80-charging-symbolic';
                                    } else if (data.percentage >= 65) {
                                        iconName = 'battery-level-70-charging-symbolic';
                                    } else if (data.percentage >= 55) {
                                        iconName = 'battery-level-60-charging-symbolic';
                                    } else if (data.percentage >= 45) {
                                        iconName = 'battery-level-50-charging-symbolic';
                                    } else if (data.percentage >= 35) {
                                        iconName = 'battery-level-40-charging-symbolic';
                                    } else if (data.percentage >= 25) {
                                        iconName = 'battery-level-30-charging-symbolic';
                                    } else if (data.percentage >= 15) {
                                        iconName = 'battery-level-20-charging-symbolic';
                                    } else if (data.percentage >= 5) {
                                        iconName = 'battery-level-10-charging-symbolic';
                                    } else {
                                        iconName = 'battery-level-0-charging-symbolic';
                                    }
                                } else {
                                    // Use modern regular icons with 10% increments
                                    if (data.percentage === 100) {
                                        iconName = 'battery-level-100-symbolic';
                                    } else if (data.percentage >= 95) {
                                        iconName = 'battery-level-100-symbolic';
                                    } else if (data.percentage >= 85) {
                                        iconName = 'battery-level-90-symbolic';
                                    } else if (data.percentage >= 75) {
                                        iconName = 'battery-level-80-symbolic';
                                    } else if (data.percentage >= 65) {
                                        iconName = 'battery-level-70-symbolic';
                                    } else if (data.percentage >= 55) {
                                        iconName = 'battery-level-60-symbolic';
                                    } else if (data.percentage >= 45) {
                                        iconName = 'battery-level-50-symbolic';
                                    } else if (data.percentage >= 35) {
                                        iconName = 'battery-level-40-symbolic';
                                    } else if (data.percentage >= 25) {
                                        iconName = 'battery-level-30-symbolic';
                                    } else if (data.percentage >= 15) {
                                        iconName = 'battery-level-20-symbolic';
                                    } else if (data.percentage >= 5) {
                                        iconName = 'battery-level-10-symbolic';
                                    } else {
                                        iconName = 'battery-level-0-symbolic';
                                    }
                                }
                                log(`Battery: ${data.percentage}%, charging: ${data.charging}, icon: ${iconName}`);
                                
                                // Update the icon
                                this.icon.icon_name = iconName;
                            }
                            
                            // Update menu items
                            if (data.voltage !== null) {
                                this.voltageItem.label.set_text(`Voltage: ${data.voltage.toFixed(2)}V`);
                            }
                            if (data.status) {
                                let statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1);
                                this.statusItem.label.set_text(`Status: ${statusText}`);
                            }
                            if (data.charge_rate !== null) {
                                let rateText = data.charge_rate > 0 ? `+${data.charge_rate.toFixed(1)}%/hr` : `${data.charge_rate.toFixed(1)}%/hr`;
                                this.chargeRateItem.label.set_text(`Charge Rate: ${rateText}`);
                            }
                        }
                    }
                } catch (e) {
                    log('Battery extension error: ' + e);
                    this.label.set_text('ERR');
                }
            });
            
        } catch (e) {
            log('Battery extension error: ' + e);
        }
        
        // Schedule next update (every 30 seconds)
        // IMPORTANT: Don't schedule inside _updateBattery to prevent timer accumulation
        // This is now handled in the _init method
    }
    
    destroy() {
        if (timeout) {
            GLib.source_remove(timeout);
            timeout = null;
        }
        super.destroy();
    }
});

function init() {
}

function enable() {
    indicator = new BatteryIndicator();
    Main.panel.addToStatusArea('hackberry-battery-indicator', indicator);
}

function disable() {
    if (indicator) {
        indicator.destroy();
        indicator = null;
    }
}