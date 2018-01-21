/**
 * Contains all client-related signals and functions
 * @class
 */
function ClientManager(tilingManager) {
    print("new ClientManager")
    
    // Hack to let the inner connections call this
    var self = this;

    /**
     * Adds a client to a ScreenManager and initiates new attributes necessary for the script
     * @param {KWin.client} client
     */
    this.added = function(client) {
        print("ClientManager.added");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        if (screenManager.clients.length > screenManager.layout.max - 1 || !self.eligible(client)) {
            return;
        }
    
        client.index = screenManager.clients.length;
        client.startGeo = client.geometry;
        client.oldGeo = client.geometry;
    
        client.clientStartUserMovedResized.connect(self.startMove);
        client.clientFinishUserMovedResized.connect(self.finishMove);
        if (readConfig("live", false).toString() === "true") {
            client.clientStepUserMovedResized.connect(self.stepMove);
        }
    
        screenManager.clients.push(client);
    
        tilingManager.tile();
    };
    
    /**
     * Removes a client from the ScreenManager and nullifies the attributes given by this.added
     * @param {KWin.client} client
     */
    this.removed = function(client) {
        print("ClientManager.removed");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        client.index = null;
        client.startGeo = null;
        client.oldGeo = null;
    
        client.clientStartUserMovedResized.disconnect(self.startMove);
        client.clientFinishUserMovedResized.disconnect(self.finishMove);
        if (readConfig("live", false).toString() === "true") {
            client.clientStepUserMovedResized.disconnect(self.stepMove);
        }
    
        screenManager.clients.splice(screenManager.clientIndex(client), 1);
    
        tilingManager.tile();
    };
    
    /**
     * Stores pre-movement position of a client and checks the client's index in a ScreenManager
     * @param {KWin.client} client
     */
    this.startMove = function(client) {
        print("ClientManager.startMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        client.startGeo = client.geometry;
        client.index = screenManager.clientIndex(client);
    };
    
    /**
     * @param {KWin.client} client
     */
    this.stepMove = function(client) {
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
        screenManager.layout.finishMove(client);
        tilingManager.tile();
        client.startGeo = client.geometry;
        client.index = screenManager.clientIndex(client);
    };
    
    /**
     * Calls for the ScreenManager's layout to adjust the tiles according to the movement
     * @param {KWin.client} client
     */
    this.finishMove = function(client) {
        print("ClientManager.finishMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];

        screenManager.layout.finishMove(client);

        tilingManager.tile();
    };

    /**
     * Checks if the client is eligible for tiling or not
     * @param {KWin.client} client
     * @return
     *  Whether the client is eligible for tiling
     */
    this.eligible = function(client) {
        if (client.comboBox ||
            client.desktopWindow ||
            client.dndIcon ||
            client.dock ||
            client.dropdownMenu ||
            client.menu ||
            client.notification ||
            client.popupMenu ||
            client.specialWindow ||
            client.splash ||
            client.toolbar ||
            client.tooltip ||
            client.utility ||
            client.transient ||
            client.geometry === workspace.clientArea(0, client.screen, 0)) {
            return false;
        }
        return true;
    };


    workspace.clientAdded.connect(this.added);
    workspace.clientRemoved.connect(this.removed);

}
/**
 * Stores the layout and the clients on the screen
 * @class
 */
function ScreenManager(scr) {
    print("new ScreenManager");

    this.clients = [];
    this.layout = getLayout(readConfig("layout", 0), workspace.clientArea(0, scr, 0));

    /**
     * Tiles current screen
     */
    this.tile = function() {
        print("ScreenManager.tile");
        this.layout.adjustTiles(this.clients.length);
        for (var c = 0; c < this.clients.length; c++) {
            this.clients[c].geometry = this.layout.tiles[c];
        }
    };

    /**
     * Is the index of this.clients empty?
     * @param {int} i
     *  Index to be checked
     * @return
     *  Whether the this.clients[i] is empty or not
     */
    this.isIndexEmpty = function(i) {
        return (this.clients[i] === undefined) ? true : false;
    };

     /**
     * Get the current index of a client
     * @param {KWin.client} client
     *  The client to be found
     * @return
     *  The index of the client (-1 if not found)
     */
    this.clientIndex = function (client) {
        for (var i = 0; i < this.clients.length; i++) {
            if (client.windowId === this.clients[i].windowId) {
                return i;
            }
        }
        return -1;
    };

}
/**
 * Main class that contains all the script-related data -
 * launch the script by creating a new TilingManager()
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

    this.gaps = readConfig("gaps", 8);

    /**
     * Tiles every screen on the current desktop
     */
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
function getLayout(layoutId, geo) {
    var layouts = [ "2x2", "1x2", "1x3" ]
    var ori = (geo.width > geo.height) ? "h" : "v";
    switch(layouts[layoutId] + ori) {
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


    /**
     * Adjusts the tiles to pane changes and the amount of clients on the screen
     * @param {int} count
     *  Screen's client count
     */
    this.adjustTiles = function(count) {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geo.x : this.geo.x + this.pane.x;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geo.y : this.geo.y + this.pane.y;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x : this.geo.width - this.pane.x;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y : this.geo.height - this.pane.y;
        }

        // Fill missing
        this.tiles[0].width += (count === 1) ? this.geo.width - this.pane.x : 0;
        this.tiles[0].height += (count !== 4) ? this.geo.height - this.pane.y : 0;
        this.tiles[1].height += (count === 2) ? this.geo.height - this.pane.y : 0;
    };

    this.finishMove = function(client) {
        this.pane.x += (client.index === 0 || client.index === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
        this.pane.y += (client.index === 0 || client.index === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;
    }
    
}


var TilingManager = new TilingManager();
