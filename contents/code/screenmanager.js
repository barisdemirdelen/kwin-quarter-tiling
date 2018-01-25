function ScreenManager(scr) {
    print("new ScreenManager");

    this.clients = [];
    this.layout = getLayout(readConfig("layout", 0), workspace.clientArea(0, scr, 0));

    this.tile = function () {
        print("ScreenManager.tile");
        this.layout.adjustTiles(this.clients.length);
        for (var c = 0; c < this.clients.length; c++) {
            this.clients[c].geometry = this.layout.tiles[c];
        }
    };

    this.finishMove = function (client) {
        var centers = [];
        var index = this.clientIndex(client);

        for (var i = 0; i < this.clients.length; i++) {

            if (i !== index) {
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

        var closestClient = centers[index];
        var closestDist = 99999;

        for (var i = 0; i < centers.length; i++) {
            var dist = Math.abs(geo.x - centers[i].x) + Math.abs(geo.y - centers[i].y);
            if (dist < closestDist) {
                closestDist = dist;
                closestClient = centers[i];
            }
        }

        if (centers.indexOf(closestClient) !== index) {
            this.swapClients(client, this.clients[centers.indexOf(closestClient)])
        }
    };

    this.isIndexEmpty = function (i) {
        return (this.clients[i] === undefined) ? true : false;
    };

    this.swapClients = function (client1, client2) {
        var i1 = this.clientIndex(client1);
        var i2 = this.clientIndex(client2);

        var tempClient = client1;

        this.clients[i1] = client2
        this.clients[i2] = tempClient;
    };

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