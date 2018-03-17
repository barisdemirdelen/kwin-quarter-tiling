/**
 * Client wrapper for extended functionality over KWin clients.
 * @constructor
 * @param {KWin.Client} kwinClient - KWin client.
 * @param {Desktop} desktop - Desktop the client is currently in.
 * @param {Screen} screen - Screen the client is currently in.
 * */
function Client(kwinClient, desktop, screen) {

    var self = this;

    /** @member {KWin.Client} - KWin client.*/
    this.kwinClient = kwinClient;
    /** @member {int} - Window id.*/
    this.id = kwinClient.windowId;
    /** @member {Qt.rect} - Current geometry. */
    this.geometry = kwinClient.geometry;
    /** @member {Desktop} - Desktop the client is currently in.*/
    this.desktop = desktop;
    /** @member {Screen} - Screen the client is currently in.*/
    this.screen = screen;
    /** @member {int} - Current index of the client in the screen. */
    this.screenIndex = -1;
    /** @member {boolean} - Client added to tiling. */
    this.added = false;

    /**
     * Sets the geometry of the client to given geometry,
     * @param {Qt.rect} geometry - Geometry to set.
     */
    this.setGeometry = function (geometry) {
        self.geometry.x = Math.round(geometry.x);
        self.geometry.y = Math.round(geometry.y);
        self.geometry.width = Math.round(geometry.width);
        self.geometry.height = Math.round(geometry.height);
    };

    /**
     * Checks if the client is eligible to be tiled.
     * @return {boolean}
     */
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