function Screen(id) {

    var self = this;

    this.geometry = workspace.clientArea(0, id, 0)

    this.clients = [];
    this.layout = new Layout(0, this.geometry);


    this.tile = function() {
        this.layout.tile(this.clients.length);
        for (var i = 0; i < this.clients.length; i++) {;
            this.clients[i].geometry.x = this.layout.tiles[i].x;
            this.clients[i].geometry.y = this.layout.tiles[i].y;
            this.clients[i].geometry.width = this.layout.tiles[i].width;
            this.clients[i].geometry.height = this.layout.tiles[i].height;
        }
    }


}