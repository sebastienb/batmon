const { Adw, Gio, Gtk, GObject } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;

function init() {
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.hackberry-battery');
    
    const page = new Adw.PreferencesPage({
        title: 'General',
        icon_name: 'dialog-information-symbolic',
    });
    window.add(page);

    const group = new Adw.PreferencesGroup({
        title: 'Battery Monitor Settings',
        description: 'Configure how the battery monitor displays and updates',
    });
    page.add(group);

    // Refresh interval setting
    const refreshRow = new Adw.ActionRow({
        title: 'Refresh Interval',
        subtitle: 'How often to update battery information (in seconds)',
    });
    
    const spinButton = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 5,
            upper: 60,
            step_increment: 1,
            page_increment: 5,
            value: settings.get_int('refresh-interval'),
        }),
        valign: Gtk.Align.CENTER,
    });
    
    settings.bind(
        'refresh-interval',
        spinButton,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    
    refreshRow.add_suffix(spinButton);
    group.add(refreshRow);

    // Display mode setting
    const displayModeRow = new Adw.ActionRow({
        title: 'Display Mode',
        subtitle: 'Choose what to show in the panel',
    });

    const displayModeCombo = new Gtk.ComboBoxText({
        valign: Gtk.Align.CENTER,
    });
    
    displayModeCombo.append('icon', 'Icon Only');
    displayModeCombo.append('percentage', 'Percentage Only');
    displayModeCombo.append('both', 'Icon and Percentage');
    
    displayModeCombo.set_active_id(settings.get_string('display-mode'));
    
    displayModeCombo.connect('changed', () => {
        settings.set_string('display-mode', displayModeCombo.get_active_id());
    });
    
    displayModeRow.add_suffix(displayModeCombo);
    group.add(displayModeRow);
    
    // Add note about display mode changes
    const noteLabel = new Gtk.Label({
        label: '<small>Note: If you don\'t see changes after changing display mode, disable and re-enable the extension</small>',
        use_markup: true,
        wrap: true,
        xalign: 0,
        margin_top: 5,
        margin_bottom: 10,
        margin_start: 20,
        margin_end: 20,
    });
    noteLabel.add_css_class('dim-label');
    group.add(noteLabel);
}