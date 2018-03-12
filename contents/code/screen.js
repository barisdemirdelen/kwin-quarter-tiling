function Screen(id) {

    var self = this;

    this.id = id;

    this.geometry = workspace.clientArea(0, id, 0);

    this.clients = [];
    this.layout = new Layout(KWin.readConfig("layout", 0), this.geometry);


    this.tile = function () {
        this.layout.tile(this.clients.length);
        for (var i = 0; i < this.clients.length; i++) {
            this.clients[i].geometry.x = Math.round(this.layout.tiles[i].x);
            this.clients[i].geometry.y = Math.round(this.layout.tiles[i].y);
            this.clients[i].geometry.width = Math.round(this.layout.tiles[i].width);
            this.clients[i].geometry.height = Math.round(this.layout.tiles[i].height);
        }
    };

    this.move = function (client, index) {
        var geometry;
        var centers = [];
        for (var i = 0; i < this.clients.length; i++) {

            if (i !== index) {
                geometry = this.clients[i].geometry;
            } else {
                geometry = this.layout.tiles[index];
            }

            centers[i] = Qt.point(geometry.x + geometry.width / 2, geometry.y + geometry.height / 2);

        }

        var center = Qt.point(client.geometry.x + geometry.width / 2, client.geometry.y + geometry.height / 2);

        var closestIndex = index;
        var distance = 999999;

        for (var i = 0; i < centers.length; i++) {
            var d = Math.pow(center.x - centers[i].x, 2) + Math.pow(center.y - centers[i].y, 2);
            if (d < distance) {
                closestIndex = i;
                distance = d;
            }
        }

        if (index !== closestIndex) {
            this.swap(index, closestIndex)
        }

    };

    this.swap = function (i, j) {
        var temp = this.clients[i];

        this.clients[i] = this.clients[j];
        this.clients[j] = temp;

    };


}