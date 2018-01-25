function getLayout(layoutId, geo) {
    var layouts = ["2x2", "1x2", "1x3"]
    var ori = (geo.width > geo.height) ? "h" : "v";
    switch (layouts[layoutId] + ori) {
        case "2x2h":
            return new Horizontal_2x2(geo);
        case "2x2v":
            return new Vertical_2x2(geo);
    }
}

function Horizontal_2x2(geo) {
    print("new Horizontal_2x2");

    this.geo = geo;
    this.max = 4;
    
    this.gaps = readConfig("gaps", 8);

    this.pane = {
        x: this.geo.width / 2,
        y: this.geo.height / 2
    };

    this.tiles = [];
    for (var t = 0; t < this.max; t++) {
        this.tiles.push({});
    }

    this.adjustTiles = function (count) {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geo.x + this.gaps : this.geo.x + this.pane.x + this.gaps;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geo.y + this.gaps : this.geo.y + this.pane.y + this.gaps;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x - this.gaps : this.geo.width - this.pane.x - this.gaps * 2;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y - this.gaps : this.geo.height - this.pane.y - this.gaps * 2;
        }

        // Fill missing
        this.tiles[0].width += (count === 1) ? this.geo.width - this.pane.x - this.gaps : 0;
        this.tiles[0].height += (count !== 4) ? this.geo.height - this.pane.y - this.gaps : 0;
        this.tiles[1].height += (count === 2) ? this.geo.height - this.pane.y - this.gaps : 0;
    };

    this.finishMove = function (client, i) {
        this.pane.x += (i === 0 || i === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
        this.pane.y += (i === 0 || i === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;
    }

}


/**
 * Manages tiles
 * @class
 */
function Vertical_2x2(geo) {
    print("new Horizontal_2x2");

    this.geo = geo;
    this.max = 4;
    
    this.gaps = readConfig("gaps", 8);

    this.pane = {
        x: this.geo.width / 2,
        y: this.geo.height / 2
    };

    this.tiles = [];
    for (var t = 0; t < this.max; t++) {
        this.tiles.push({});
    }

    this.adjustTiles = function (count) {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geo.x + this.gaps : this.geo.x + this.pane.x + this.gaps;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geo.y + this.gaps : this.geo.y + this.pane.y + this.gaps;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x - this.gaps : this.geo.width - this.pane.x - this.gaps * 2;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y - this.gaps : this.geo.height - this.pane.y - this.gaps * 2;
        }

        // Fill missing
        this.tiles[0].width += (count === 1) ? this.geo.width - this.pane.x - this.gaps : 0;
        this.tiles[0].height += (count !== 4) ? this.geo.height - this.pane.y - this.gaps : 0;
        this.tiles[1].height += (count === 2) ? this.geo.height - this.pane.y - this.gaps : 0;
    };

    this.finishMove = function (client, i) {
        this.pane.x += (i === 0 || i === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
        this.pane.y += (i === 0 || i === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;
    }

}