///////////////
// tiling.js //
///////////////

/**
 * Main class that contains all the script-related data
 * @class
 */
function ViewManager() {
    this.numDesks = function () {
        return workspace.desktops;
    };

    this.numScrs = function () {
        return workspace.numScreens;
    };

    this.curAct = function () {
        return workspace.currentActivity;
    };

    this.curDesk = function () {
        return workspace.currentDesktop;
    };

    this.curScr = function () {
        return workspace.activeScreen;
    };

    this.views = [];
    for (var desk = 1; desk <= this.numDesks(); desk++) {
        this.views[desk] = [];
        for (var scr = 0; scr < this.numScrs(); scr++) {
            this.views[desk][scr] = new ScreenManager(scr);
        }
    }

    this.gaps = 8;

    this.tile = function () {
        var view = this.views[this.curDesk()];
        for (var scr = 0; scr < view.length; scr++) {
            view = this.views[this.curDesk()][scr];
            view.tile();
            for (var c = 0; c < view.clients.length; c++) {
                view.clients[c].geometry = view.tiles[c];
            }
        }
    };

    this.clientManager = new ClientManager(this);

}





///////////////
// signals.js //
///////////////

/**
 * Manages client-related signals and functions
 * @class
 */
function ClientManager(viewManager) {

    this.clientAdded = function(client) {
        var view = viewManager.views[client.desktop][client.screen];
    
        if (view.clients.length > 3) {
            return;
        }
    
        client.index = view.clients.length;
        client.startGeo = client.geometry;
        client.oldGeo = client.geometry;
    
        client.clientStartUserMovedResized.connect(viewManager.clientManager.startMove);
        client.clientStepUserMovedResized.connect(viewManager.clientManager.stepMove);
        client.clientFinishUserMovedResized.connect(viewManager.clientManager.finishMove);
    
        view.clients.push(client);
    
        viewManager.tile();
    };
    
    this.clientRemoved = function(client) {
        var view = viewManager.views[client.desktop][client.screen];
    
        client.index = null;
        client.startGeo = null;
        client.oldGeo = null;
    
        client.clientStartUserMovedResized.disconnect(viewManager.clientManager.startMove);
        client.clientStepUserMovedResized.disconnect(viewManager.clientManager.stepMove);
        client.clientFinishUserMovedResized.disconnect(viewManager.clientManager.finishMove);
    
        view.clients.splice(view.cIndex(client), 1);
    
        viewManager.tile();
    };
    
    this.startMove = function(client) {
        var view = viewManager.views[client.desktop][client.screen];
    
        client.startGeo = client.geometry;
        client.index = view.cIndex(client);
    };
    
    this.stepMove = function(client) {
    
    };
    
    this.finishMove = function(client) {
        var view = viewManager.views[client.desktop][client.screen];
    
        view.pane.x += (client.index === 0 || client.index === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
        view.pane.y += (client.index === 0 || client.index === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;
    
        viewManager.tile();
    };


    workspace.clientAdded.connect(this.clientAdded);
    workspace.clientRemoved.connect(this.clientRemoved);
}





///////////////
// screen.js //
///////////////

// Returns the area of the screen scr
function Geo(scr) {
    return workspace.clientArea(0, scr, 0);
}

/**
 * Manages tiles and clients for a screen
 * @class
 */
function ScreenManager(scr) {
    this.geo = Geo(scr);
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
}

var ViewManager = new ViewManager();