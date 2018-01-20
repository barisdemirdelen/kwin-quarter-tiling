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
/**
 * Manages client-related signals and functions
 * @class
 */
function ClientManager(tilingManager) {

    // Hack to let the inner connections call this
    var self = this;

    this.clientAdded = function(client) {
        print("ClientManager.clientAdded");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        if (screenManager.clients.length > screenManager.layout.max - 1) {
            return;
        }
    
        client.index = screenManager.clients.length;
        client.startGeo = client.geometry;
        client.oldGeo = client.geometry;
    
        client.clientStartUserMovedResized.connect(self.startMove);
        client.clientStepUserMovedResized.connect(self.stepMove);
        client.clientFinishUserMovedResized.connect(self.finishMove);
    
        screenManager.clients.push(client);
    
        tilingManager.tile();
    };
    
    this.clientRemoved = function(client) {
        print("ClientManager.clientRemoved");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        client.index = null;
        client.startGeo = null;
        client.oldGeo = null;
    
        client.clientStartUserMovedResized.disconnect(self.startMove);
        client.clientStepUserMovedResized.disconnect(self.stepMove);
        client.clientFinishUserMovedResized.disconnect(self.finishMove);
    
        screenManager.clients.splice(screenManager.clientIndex(client), 1);
    
        tilingManager.tile();
    };
    
    this.startMove = function(client) {
        print("ClientManager.startMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        client.startGeo = client.geometry;
        client.index = screenManager.clientIndex(client);
    };
    
    this.stepMove = function(client) {
    
    };
    
    this.finishMove = function(client) {
        print("ClientManager.finishMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        screenManager.layout.finishMove(client);
    
        tilingManager.tile();
    };


    workspace.clientAdded.connect(this.clientAdded);
    workspace.clientRemoved.connect(this.clientRemoved);

}
/**
 * Main class that contains all the script-related data
 * @class
 */
function TilingManager() {
    print ("new TilingManager");
    this.screenManagers = [];
    for (var desk = 1; desk <= workspace.desktops; desk++) {
        this.screenManagers[desk] = [];
        for (var scr = 0; scr < workspace.numScreens; scr++) {
            this.screenManagers[desk][scr] = new ScreenManager(scr);
        }
    }

    this.gaps = 8;

    this.tile = function () {
        print("TilingManager.tile");
        var screenManager = this.screenManagers[workspace.currentDesktop];
        for (var scr = 0; scr < screenManager.length; scr++) {
            screenManager = this.screenManagers[workspace.currentDesktop][scr];
            screenManager.tile();
        }
    };

    this.clientManager = new ClientManager(this);

}
/**
 * Manages clients on the screen
 * @class
 */
function ScreenManager(scr) {
    print("new ScreenManager");

    this.clients = [];
    this.layout = getLayout("2x2", workspace.clientArea(0, scr, 0));

    this.isEmpty = function(t) {
        return (this.clients[t] === undefined) ? true : false;
    };

    this.tile = function() {
        print("ScreenManager.tile");
        this.layout.adjustTiles(this.clients.length);
        for (var c = 0; c < this.clients.length; c++) {
            this.clients[c].geometry = this.layout.tiles[c];
        }
    };

    this.clientIndex = function (client) {
        for (var c = 0; c < this.clients.length; c++) {
            if (client.windowId === this.clients[c].windowId) {
                return c;
            }
        }
        return -1;
    };

}


var TilingManager = new TilingManager();
