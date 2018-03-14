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
                geometry = this.clients[i].geometry;
            } else {
                geometry = new Rect(this.layout.tiles[client.screenIndex]);
            }
            centers[i] = geometry.getCenter();
        }

        var center = client.geometry.getCenter();
        var closestIndex = self.getLeastDistanceIndex(center, centers);

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


    this.getLeastDistanceIndex = function (center, centers) {
        var closestIndex = -1;
        var distance = Infinity;

        for (var i = 0; i < centers.length; i++) {
            var d = getDistance2(center, centers[i]);
            if (d < distance) {
                closestIndex = i;
                distance = d;
            }
        }
        return closestIndex;
    };


    this.isFull = function () {
        return self.clients.length > self.layout.max - 1
    };


}