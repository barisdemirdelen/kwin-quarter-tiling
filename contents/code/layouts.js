/** @constructor */
function Layout(id, geometry) {
    var layouts = ["2x2", "1x2", "1x3"];
    switch (layouts[id]) {
        case("2x2"):
            return new QuarterLayout(geometry, 4);
        case("1x2"):
            return new QuarterLayout(geometry, 3);
        case("1x3"):
            return new MasterLayout(geometry, 4);
    }
}

/** @constructor */
function QuarterLayout(geometry, max) {
    this.geometry = geometry;
    this.max = max;

    this.gaps = KWin.readConfig("gaps", 8);

    this.pane = {
        x: this.geometry.width / 2,
        y: this.geometry.height / 2
    };

    this.tiles = [];
    for (var i = 0; i < this.max; i++) {
        this.tiles.push(Qt.rect(0, 0, 0, 0));
    }

    this.tile = function (count) {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].x = (i === 0 || i === 3) ?
                this.geometry.x + this.gaps :
                this.geometry.x + this.pane.x + this.gaps / 2;
            this.tiles[i].y = (i === 0 || i === 1) ?
                this.geometry.y + this.gaps :
                this.geometry.y + this.pane.y + this.gaps / 2;
            this.tiles[i].width = (i === 0 || i === 3) ?
                this.pane.x - this.gaps * 1.5 :
                this.geometry.width - this.pane.x - this.gaps * 1.5;
            this.tiles[i].height = (i === 0 || i === 1) ?
                this.pane.y - this.gaps * 1.5 :
                this.geometry.height - this.pane.y - this.gaps * 1.5;
        }


        // Fill missing

        if (count !== 4)
            this.tiles[0].height += this.geometry.height - this.pane.y - this.gaps / 2;

        switch (count) {
            case (1):
                this.tiles[0].width += this.geometry.width - this.pane.x - this.gaps / 2;
                break;
            case (2):
                this.tiles[1].height += this.geometry.height - this.pane.y - this.gaps / 2;
                break;
        }

    };

    this.resize = function (index, newGeometry) {
        var tile = this.tiles[index];
        var dx = newGeometry.width - tile.width;
        var dy = newGeometry.height - tile.height;
        this.pane.x += (index === 0 || index === 3) ? dx : -dx;
        this.pane.y += (index === 0 || index === 1) ? dy : -dy;

        // Baby-proofing
        this.pane.x = clip(this.pane.x, 80, this.geometry.width - 80);
        this.pane.y = clip(this.pane.y, 80, this.geometry.height - 80);
    };
}

/** @constructor */
function MasterLayout(geometry, max) {
    this.geometry = geometry;
    this.max = max;

    this.gaps = KWin.readConfig("gaps", 8);

    this.pane = {
        x: this.geometry.width / 2,
        yt: this.geometry.height / 3,
        yb: this.geometry.height / 1.5
    };

    this.tiles = [];
    for (var i = 0; i < this.max; i++) {
        this.tiles.push(Qt.rect(0, 0, 0, 0));
    }

    this.tile = function (count) {
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].x = (i === 0) ?
                this.geometry.x + this.gaps :
                this.geometry.x + this.pane.x + this.gaps / 2;

            this.tiles[i].y = (i === 0 || i === 1) ?
                this.geometry.y + this.gaps :
                (i === 2) ?
                    this.geometry.y + this.pane.yt + this.gaps / 1.5 :
                    this.pane.yb + this.gaps / 3;

            this.tiles[i].width = (i === 0) ?
                this.pane.x - this.gaps * 1.5 :
                this.geometry.width - this.pane.x - this.gaps * 1.5;

            this.tiles[i].height = (i === 0) ?
                this.geometry.height - this.gaps * 2 :
                (i === 1) ?
                    this.pane.yt - this.gaps * 1.333 :
                    (i === 2) ?
                        this.pane.yb - this.pane.yt - this.gaps * 1.333 :
                        this.geometry.height - this.pane.yb - this.gaps * 1.33;
        }


        // Fill missing

        switch (count) {
            case (1):
                this.tiles[0].width += this.geometry.width - this.pane.x - this.gaps / 2;
                break;
            case (2):
                this.tiles[1].height += this.geometry.height - this.pane.yt - this.gaps / 1.5;
                break;
            case (3):
                this.tiles[1].height += (this.geometry.height - this.pane.yb - this.gaps / 1.5) / 2;
                this.tiles[2].height += (this.geometry.height - this.pane.yb - this.gaps / 1.5) / 2;
                this.tiles[2].y += (this.geometry.height - this.pane.yb) / 2;
                break;

        }

    };

    this.resize = function (index, newGeometry) {
        this.pane.x += (index === 0) ?
            newGeometry.width - this.tiles[index].width :
            this.tiles[index].width - newGeometry.width;

        switch (index) {
            case (1):
                this.pane.yt += newGeometry.height - this.tiles[index].height;
                break;
            case (2):
                if (client.geometry.y !== this.tiles[index].y)
                    this.pane.yt += newGeometry.y - this.tiles[index].y;
                else
                    this.pane.yb += newGeometry.height - this.tiles[index].height;
                break;
            case (3):
                this.pane.yb += this.tiles[index].height - newGeometry.height;
                break;
        }


        // Baby-proofing
        this.pane.x = clip(this.pane.x, 80, this.geometry.width - 80);
        this.pane.yt = Math.max(this.pane.yt, 80);
        this.pane.yb = Math.min(this.pane.yb, this.geometry.height - 80);

        if (this.pane.yb < this.pane.yt) {
            this.pane.yt = this.geometry.height / 3;
            this.pane.yb = this.geometry.height / 1.5;
        }

        if (this.pane.yt > this.pane.yb) {
            this.pane.yt = this.geometry.height / 3;
            this.pane.yb = this.geometry.height / 1.5;
        }

    };
}
