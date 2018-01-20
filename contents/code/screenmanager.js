/**
 * Manages clients on the screen
 * @class
 */
function ScreenManager(scr) {
    print("new ScreenManager");

    this.clients = [];
    this.layout = getLayout("2x2", workspace.clientArea(0, scr, 0));

    this.isEmpty = function(t) {
        return (this.clients[t] === undefined) ? true : false;
    };

    this.tile = function() {
        print("ScreenManager.tile");
        this.layout.adjustTiles(this.clients.length);
        for (var c = 0; c < this.clients.length; c++) {
            this.clients[c].geometry = this.layout.tiles[c];
        }
    };

    this.clientIndex = function (client) {
        for (var c = 0; c < this.clients.length; c++) {
            if (client.windowId === this.clients[c].windowId) {
                return c;
            }
        }
        return -1;
    };

}
