function Layout(id, geometry) {
    var layouts = ["2x2"]
    switch (layouts[id]) {
        case("2x2"):
            return new QuarterLayout(geometry);
    }
}


function QuarterLayout(geometry) {
    this.geometry = geometry;
    this.max = 4;

    this.gaps = KWin.readConfig("gaps", 8);
    
    this.pane = {
        x: this.geometry.width / 2,
        y: this.geometry.height / 2
    }

    this.tiles = [];
    for (var i = 0; i < this.max; i++) {
        this.tiles.push(Qt.rect(0,0,0,0));
    }

    this.tile = function(count) {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geometry.x + this.gaps : this.geometry.x + this.pane.x + this.gaps;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geometry.y + this.gaps : this.geometry.y + this.pane.y + this.gaps;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x - this.gaps : this.geometry.width - this.pane.x - this.gaps * 2;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y - this.gaps : this.geometry.height - this.pane.y - this.gaps * 2;
        }

        // Fill missing
        this.tiles[0].width += (count === 1) ? this.geometry.width - this.pane.x - this.gaps : 0;
        this.tiles[0].height += (count !== 4) ? this.geometry.height - this.pane.y - this.gaps : 0;
        this.tiles[1].height += (count === 2) ? this.geometry.height - this.pane.y - this.gaps : 0;
    };

    this.move = function(client, index) {
        this.pane.x += (index === 0 || index === 3) ? client.geometry.width - this.tiles[index].width : this.tiles[index].width - client.geometry.width;
        this.pane.y += (index === 0 || index === 1) ? client.geometry.height - this.tiles[index].height : this.tiles[index].height - client.geometry.height;
    };
}
