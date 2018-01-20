/**
 * Manages tiles and clients for a screen
 * @class
 */
function ScreenManager(scr) {

    this.geo = workspace.clientArea(0, scr, 0);
    this.ori = (this.geo.width > this.geo.height) ? "h" : "v";
    this.pane = {
        x: this.geo.width / 2,
        y: this.geo.height / 2
    };
    this.clients = [];
    this.tiles = [{}, {}, {}, {}];

    this.tile = function () {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geo.x : this.geo.x + this.pane.x;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geo.y : this.geo.y + this.pane.y;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x : this.geo.width - this.pane.x;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y : this.geo.height - this.pane.y;
        }
    };

    this.cIndex = function (client) {
        for (var c = 0; c < this.clients.length; c++) {
            if (client.windowId === this.clients[c].windowId) {
                return c;
            }
        }
        return -1;
    };

}