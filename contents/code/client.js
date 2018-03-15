function Client(kwinClient, desktop, screen) {

    var self = this;

    this.kwinClient = kwinClient;
    this.id = kwinClient.windowId;
    this.geometry = kwinClient.geometry;
    this.desktop = desktop;
    this.screen = screen;
    this.screenIndex = -1;

    this.setGeometry = function (geometry) {
        self.geometry.x = Math.round(geometry.x);
        self.geometry.y = Math.round(geometry.y);
        self.geometry.width = Math.round(geometry.width);
        self.geometry.height = Math.round(geometry.height);
    };

    this.isEligible = function () {
        var client = self.kwinClient;
        return !(client.comboBox || client.desktopWindow || client.dialog ||
            client.dndIcon || client.dock || client.dropdownMenu ||
            client.menu || client.notification || client.popupMenu ||
            client.specialWindow || client.splash || client.toolbar ||
            client.tooltip || client.utility || client.transient ||
            self.screen === null || self.desktop === null || self.screen.isFull());
    };

}