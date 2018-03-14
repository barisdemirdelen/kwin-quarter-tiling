function Screen(id) {

    var self = this;

    this.id = id;

    this.geometry = workspace.clientArea(0, id, 0);

    this.clients = [];
    this.layout = new Layout(KWin.readConfig("layout", 0), this.geometry);


    this.tile = function () {
        this.layout.tile(this.clients.length);
        for (var i = 0; i < this.clients.length; i++) {
            this.clients[i].setGeometry(this.layout.tiles[i]);
        }
    };

    this.move = function (client) {
        var geometry;
        var centers = [];
        for (var i = 0; i < this.clients.length; i++) {

            if (i !== client.screenIndex) {
                centers[i] = this.clients[i].getCenter();
            } else {
                geometry = this.layout.tiles[client.screenIndex];

                centers[i] = Qt.point(geometry.x + geometry.width / 2,
                    geometry.y + geometry.height / 2);
            }


        }

        var center = client.getCenter();

        var closestIndex = client.screenIndex;
        var distance = Infinity;

        for (var i = 0; i < centers.length; i++) {
            var d = Math.pow(center.x - centers[i].x, 2) + Math.pow(center.y - centers[i].y, 2);
            if (d < distance) {
                closestIndex = i;
                distance = d;
            }
        }

        if (client.screenIndex !== closestIndex) {
            this.swap(client.screenIndex, closestIndex)
        }

    };


    this.add = function (client) {
        self.clients.push(client);
        client.screenIndex = self.clients.length - 1;
        self.tile();
    };

    this.remove = function (client) {
        self.clients.splice(client.screenIndex, 1);
        client.screenIndex = -1;
        self.tile();
    };

    this.swap = function (i, j) {
        var temp = this.clients[i];

        this.clients[i] = this.clients[j];
        this.clients[j] = temp;

        this.clients[i].screenIndex = i;
        this.clients[j].screenIndex = j;

    };

    this.isFull = function () {
        return self.clients.length > self.layout.max - 1
    };


}