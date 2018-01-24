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
    this.tile = function () {
        print("ScreenManager.tile");
        this.layout.adjustTiles(this.clients.length);
        for (var c = 0; c < this.clients.length; c++) {
            this.clients[c].geometry = this.layout.tiles[c];
        }
    };

    /**
     * Compares the current center of a client to the centers of other clients and swaps clients with the closest one
     * @param {KWin.client} client
     *  Client to be moved
     */
    this.finishMove = function (client) {
        var geo;
        var centers = [];

        for (var i = 0; i < this.clients.length; i++) {

            if (i !== client.index) {
                geo = this.clients[i].geometry;
            } else {
                geo = client.startGeo;
            }

            centers[i] = ({
                x: geo.x + geo.width / 2,
                y: geo.y + geo.height / 2
            });

        }

        geo = client.geometry;
        geo.x += geo.width / 2;
        geo.y += geo.height / 2;

        var closestClient = centers[client.index];
        var closestDist = 99999;

        for (var i = 0; i < centers.length; i++) {
            var dist = Math.abs(geo.x - centers[i].x) + Math.abs(geo.y - centers[i].y);
            if (dist < closestDist) {
                closestDist = dist;
                closestClient = centers[i];
            }
        }

        if (centers.indexOf(closestClient) !== this.clientIndex(client)) {
            this.swapClients(client, this.clients[centers.indexOf(closestClient)])
        }
    };

    /**
     * Is the index of this.clients empty?
     * @param {int} i
     *  Index to be checked
     * @return
     *  Whether the this.clients[i] is empty or not
     */
    this.isIndexEmpty = function (i) {
        return (this.clients[i] === undefined) ? true : false;
    };

    /**
     * Swaps the places of two clients in the array
     * @param {KWin.client} client1, client2
     *  Clients to be swapped
     */
    this.swapClients = function (client1, client2) {
        var tempClient = client1;

        this.clients[client1.index] = client2
        this.clients[client2.index] = tempClient;

        client1.index = this.clientIndex(client1);
        client2.index = this.clientIndex(client2);
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
            if (client.windowId === this.clients[i].windowId ||
                client.frameId === this.clients[i].frameId) {
                return i;
            }
        }
        return -1;
    };

}