function getLayout(layoutId, geo) {
    var ori = (geo.width > geo.height) ? "h" : "v";
    switch(layoutId + ori) {
        case "2x2h":
            return new Horizontal_2x2(geo);
        case "2x2v":
            return new Vertical_2x2(geo);
    }
}

/**
 * Manages tiles
 * @class
 */
function Horizontal_2x2(geo) {
    print("new Horizontal_2x2");
    
    this.geo = geo;
    this.max = 4;

    this.pane = {
        x: this.geo.width / 2,
        y: this.geo.height / 2
    };

    this.tiles = [];
    for (var t = 0; t < this.max; t++) {
        this.tiles.push({});
    }

    this.adjustTiles = function(c) {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geo.x : this.geo.x + this.pane.x;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geo.y : this.geo.y + this.pane.y;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x : this.geo.width - this.pane.x;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y : this.geo.height - this.pane.y;
        }

        // Fill missing
        this.tiles[0].width += (c === 1) ? this.geo.width - this.pane.x : 0;
        this.tiles[0].height += (c !== 4) ? this.geo.height - this.pane.y : 0;
        this.tiles[1].height += (c === 2) ? this.geo.height - this.pane.y : 0;
    };

    this.finishMove = function(client) {
        this.pane.x += (client.index === 0 || client.index === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
        this.pane.y += (client.index === 0 || client.index === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;
    }
    
}
