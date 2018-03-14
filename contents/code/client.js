function Client(kwinClient, desktop, screen) {

    var self = this;

    this.kwinClient = kwinClient;
    this.id = kwinClient.windowId;
    this.geometry = new Rect(kwinClient.geometry);
    this.desktop = desktop;
    this.screen = screen;
    this.screenIndex = -1;

    this.setGeometry = function (geometry) {
        self.kwinClient.geometry.x = Math.round(geometry.x);
        self.kwinClient.geometry.y = Math.round(geometry.y);
        self.kwinClient.geometry.width = Math.round(geometry.width);
        self.kwinClient.geometry.height = Math.round(geometry.height);
        self.geometry = new Rect(self.kwinClient.geometry);
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