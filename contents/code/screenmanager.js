/**
 * Stores the layout and the clients on the screen
 * @class
 */
function ScreenManager(scr) {
    print("new ScreenManager");

    this.clients = [];
    this.layout = getLayout(readConfig("layout", 0), workspace.clientArea(0, scr, 0));

    /**
     * Tiles current screen
     */
    this.tile = function() {
        print("ScreenManager.tile");
        this.layout.adjustTiles(this.clients.length);
        for (var c = 0; c < this.clients.length; c++) {
            this.clients[c].geometry = this.layout.tiles[c];
        }
    };

    /**
     * Is the index of this.clients empty?
     * @param {int} i
     *  Index to be checked
     * @return
     *  Whether the this.clients[i] is empty or not
     */
    this.isIndexEmpty = function(i) {
        return (this.clients[i] === undefined) ? true : false;
    };

     /**
     * Get the current index of a client
     * @param {KWin.client} client
     *  The client to be found
     * @return
     *  The index of the client (-1 if not found)
     */
    this.clientIndex = function (client) {
        for (var i = 0; i < this.clients.length; i++) {
            if (client.windowId === this.clients[i].windowId) {
                return i;
            }
        }
        return -1;
    };

}
