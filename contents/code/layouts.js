function Layout(id, geometry) {
    var layouts = ["2x2", "1x2", "1x3"]
    switch (layouts[id]) {
        case("2x2"):
            return new QuarterLayout(geometry, 4);
        case("1x2"):
            return new QuarterLayout(geometry, 3);
        case("1x3"):
            return new MasterLayout(geometry, 4);
    }
}


function QuarterLayout(geometry, max) {
    this.geometry = geometry;
    this.max = max;

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
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x - this.gaps * 1.5 : this.geometry.width - this.pane.x - this.gaps * 1.5;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y - this.gaps * 1.5 : this.geometry.height - this.pane.y - this.gaps * 1.5;
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

function MasterLayout(geometry, max) {
    this.geometry = geometry;
    this.max = max;

    this.gaps = KWin.readConfig("gaps", 8);
    
    this.pane = {
        x: this.geometry.width / 2,
        yt: this.geometry.height / 3,
        yb: this.geometry.height / 1.5
    }

    this.tiles = [];
    for (var i = 0; i < this.max; i++) {
        this.tiles.push(Qt.rect(0,0,0,0));
    }

    this.tile = function(count) {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0) ? this.geometry.x + this.gaps : this.geometry.x + this.pane.x + this.gaps;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geometry.y + this.gaps : (t === 2) ? this.geometry.y + this.pane.yt + this.gaps / 1.33 : this.pane.yb + this.gaps / 2;
            this.tiles[t].width = (t === 0) ? this.pane.x - this.gaps : this.geometry.width - this.pane.x - this.gaps * 2;
            this.tiles[t].height = (t === 0) ? this.geometry.height - this.gaps * 2 : 
                                   (t === 1) ? this.pane.yt - this.gaps * 1.5: 
                                   (t === 2) ? this.pane.yb - this.pane.yt - this.gaps * 1.5 : 
                                               this.geometry.height - this.pane.yb - this.gaps * 1.5;
        }

        switch (count) {
            case (1):
                this.tiles[0].width += this.geometry.width - this.pane.x;
                break;
            case (2):
                this.tiles[1].height += this.geometry.height - this.pane.yt - this.gaps / 2;
                break;
            case (3):
                this.tiles[1].height += (this.geometry.height - this.pane.yb) / 2;
                this.tiles[2].height += Math.ceil( (this.geometry.height - this.pane.yb) / 2 );
                this.tiles[2].y += (this.geometry.height - this.pane.yb) / 2 - this.gaps / 3;
                break;

        }

    };

    this.move = function(client, index) {
        this.pane.x += (index === 0) ? client.geometry.width - this.tiles[index].width : this.tiles[index].width - client.geometry.width;

        switch (index) {
            case (1):
                this.pane.yt += client.geometry.height - this.tiles[index].height;
                break;
            case (2):
                if (client.geometry.y !== this.tiles[index].y) 
                    this.pane.yt += client.geometry.y - this.tiles[index].y
                else
                    this.pane.yb += client.geometry.height - this.tiles[index].height;
                break;
            case (3):
                this.pane.yb += this.tiles[index].height - client.geometry.height;
                break;
        }
    };
}
