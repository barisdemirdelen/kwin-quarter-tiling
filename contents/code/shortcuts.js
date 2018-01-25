function ShortcutManager() {

    this.toggleFloat = function() {
        var client = workspace.activeClient;
        if (TilingManager.screenManagers[client.desktop][client.screen].clientIndex(client) === -1) {
            TilingManager.clientManager.added(client);
        } else {
            TilingManager.clientManager.removed(client);
        }
    };

    registerShortcut('Quarter: Float On/Off', 'Quarter: Float On/Off', 'Meta+F', this.toggleFloat);

}