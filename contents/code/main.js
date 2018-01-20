/**
 * Manages client-related signals and functions
 * @class
 */
function ClientManager(tilingManager) {
    var self = this;

    this.clientAdded = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        if (view.clients.length > 3) {
            return;
        }
    
        client.index = view.clients.length;
        client.startGeo = client.geometry;
        client.oldGeo = client.geometry;
    
        client.clientStartUserMovedResized.connect(self.startMove);
        client.clientStepUserMovedResized.connect(self.stepMove);
        client.clientFinishUserMovedResized.connect(self.finishMove);
    
        view.clients.push(client);
    
        tilingManager.tile();
    };
    
    this.clientRemoved = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        client.index = null;
        client.startGeo = null;
        client.oldGeo = null;
    
        client.clientStartUserMovedResized.disconnect(self.startMove);
        client.clientStepUserMovedResized.disconnect(self.stepMove);
        client.clientFinishUserMovedResized.disconnect(self.finishMove);
    
        view.clients.splice(view.cIndex(client), 1);
    
        tilingManager.tile();
    };
    
    this.startMove = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        client.startGeo = client.geometry;
        client.index = view.cIndex(client);
    };
    
    this.stepMove = function(client) {
    
    };
    
    this.finishMove = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        view.pane.x += (client.index === 0 || client.index === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
        view.pane.y += (client.index === 0 || client.index === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;
    
        tilingManager.tile();
    };


    workspace.clientAdded.connect(this.clientAdded);
    workspace.clientRemoved.connect(this.clientRemoved);

}/**
 * Manages tiles and clients for a screen
 * @class
 */
function ScreenManager(scr) {

    this.geo = workspace.clientArea(0, scr, 0);
    this.ori = (this.geo.width > this.geo.height) ? "h" : "v";
    this.pane = {
        x: this.geo.width / 2,
        y: this.geo.height / 2
    };
    this.clients = [];
    this.tiles = [{}, {}, {}, {}];

    this.tile = function () {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geo.x : this.geo.x + this.pane.x;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geo.y : this.geo.y + this.pane.y;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x : this.geo.width - this.pane.x;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y : this.geo.height - this.pane.y;
        }
    };

    this.cIndex = function (client) {
        for (var c = 0; c < this.clients.length; c++) {
            if (client.windowId === this.clients[c].windowId) {
                return c;
            }
        }
        return -1;
    };

}/**
 * Main class that contains all the script-related data
 * @class
 */
function TilingManager() {

    this.views = [];
    for (var desk = 1; desk <= workspace.desktops; desk++) {
        this.views[desk] = [];
        for (var scr = 0; scr < workspace.numScreens; scr++) {
            this.views[desk][scr] = new ScreenManager(scr);
        }
    }

    this.gaps = 8;

    this.tile = function () {
        var view = this.views[workspace.currentDesktop];
        for (var scr = 0; scr < view.length; scr++) {
            view = this.views[workspace.currentDesktop][scr];
            view.tile();
            for (var c = 0; c < view.clients.length; c++) {
                view.clients[c].geometry = view.tiles[c];
            }
        }
    };

    this.clientManager = new ClientManager(this);

}

var TilingManager = new TilingManager();
