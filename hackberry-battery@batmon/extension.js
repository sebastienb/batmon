const { St, GLib, Gio, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let indicator;
let timeout;

class BatteryIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Hackberry Battery Indicator');
        
        // Create icon
        this.icon = new St.Icon({
            icon_name: 'battery-full-symbolic',
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
        
        // Start updates
        this._updateBattery();
    }
    
    _updateBattery() {
        try {
            let extensionPath = imports.misc.extensionUtils.getCurrentExtension().path;
            let batteryReaderPath = GLib.build_filenamev([extensionPath, 'battery-reader.py']);
            
            let proc = Gio.Subprocess.new(
                ['python3', batteryReaderPath],
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
                                
                                // Update icon based on percentage
                                let iconName;
                                if (data.percentage > 90) {
                                    iconName = 'battery-full-symbolic';
                                } else if (data.percentage > 70) {
                                    iconName = 'battery-good-symbolic';
                                } else if (data.percentage > 30) {
                                    iconName = 'battery-medium-symbolic';
                                } else if (data.percentage > 10) {
                                    iconName = 'battery-low-symbolic';
                                } else {
                                    iconName = 'battery-empty-symbolic';
                                }
                                this.icon.icon_name = iconName;
                            }
                            
                            // Update menu items
                            if (data.voltage !== null) {
                                this.voltageItem.label.set_text(`Voltage: ${data.voltage.toFixed(2)}V`);
                            }
                            if (data.status) {
                                this.statusItem.label.set_text(`Status: ${data.status}`);
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
        timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
            this._updateBattery();
            return GLib.SOURCE_CONTINUE;
        });
    }
    
    destroy() {
        if (timeout) {
            GLib.source_remove(timeout);
            timeout = null;
        }
        super.destroy();
    }
}

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