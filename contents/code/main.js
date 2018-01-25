function ClientManager(parent) {
    print("new ClientManager")

    // Hack to let the inner connections call this
    var self = this;

    this.ignoredClients = [
        "plasma",
        "plasma-desktop",
        "plasmashell"
    ];

    // Store original geometries here, so clients can be reset
    this.originalGeos = [];
    
    // Called whenever a new client is added
    this.added = function (client) {
        print("ClientManager.added");
        if (!self.eligible(client)) return;
        var screenManager = parent.screenManagers[client.desktop][client.screen];

        self.originalGeos[client.windowId] = client.geometry;
        client.startGeo = client.geometry;

        // Necessary signal connections
        client.clientStartUserMovedResized.connect(self.startMove);
        client.clientFinishUserMovedResized.connect(self.finishMove);
        if (readConfig("live", false).toString() === "true") {
            client.clientStepUserMovedResized.connect(self.stepMove);
        }

        screenManager.clients.push(client);

        parent.tile();
    };

    // Called whenever a new client is removed
    this.removed = function (client) {
        print("ClientManager.removed");
        var screenManager = parent.findScreenManager(client);
        if (screenManager === null) return;

        client.geometry = self.originalGeos[client.windowId];
        client.startGeo = null;

        // Necessary signal disconnections
        client.clientStartUserMovedResized.disconnect(self.startMove);
        client.clientFinishUserMovedResized.disconnect(self.finishMove);
        if (readConfig("live", false).toString() === "true") {
            client.clientStepUserMovedResized.disconnect(self.stepMove);
        }

        // Roll the indexes down
        for (var i = 0; i < screenManager.clients.length; i++) {
            if (screenManager.clients[i].index > screenManager.clientIndex(client)) {
                screenManager.clients[i].index -= 1;
            }
        }

        screenManager.clients.splice(screenManager.clientIndex(client), 1);

        parent.tile();
    };

    // Checks whether a tile is to be tiled or not
    this.eligible = function (client) {
        return (client.comboBox || client.desktopWindow || client.dialog || client.dndIcon || client.dock || client.dropdownMenu ||
            client.menu || client.notification || client.popupMenu || client.specialWindow || client.splash || client.toolbar ||
            client.tooltip || client.utility || client.transient || this.ignoredClients.indexOf(client.resourceClass.toString()) > -1 ||
            this.ignoredClients.indexOf(client.resourceName.toString()) > -1) ? false : true;
    };

    // Called when a movement event is initiated
    this.startMove = function (client) {
        print("ClientManager.startMove");
        var screenManager = parent.findScreenManager(client)

        client.startGeo = client.geometry;
    };

    // Called each step of the movement event
    this.stepMove = function (client) {
        // print("ClientManager.stepMove")
        var screenManager = parent.findScreenManager(client)

        screenManager.layout.finishMove(client, screenManager.clientIndex(client));
        parent.tile();
        
        client.startGeo = client.geometry;
    };
    
    // Called when a movement event is finished
    this.finishMove = function (client) {
        print("ClientManager.finishMove");
        var screenManager = parent.findScreenManager(client)

        if (client.geometry.width === client.startGeo.width && client.geometry.height === client.startGeo.height) {
            if (client.screen === parent.screenManagers[client.desktop].indexOf(screenManager)) {
                screenManager.finishMove(client)
            } else {
                self.removed(client);
            }
        } else {
            screenManager.layout.finishMove(client, screenManager.clientIndex(client));
        }

        parent.tile();
    };

    // Called whenever the desktop presence changes
    this.desktopPresenceChanged = function (client, desktop) {
        print("ClientManager.desktopPresenceChanged")
        self.removed(client);
    };


    // Necessary workspace signals

    if (readConfig("auto", true).toString() === "true") workspace.clientAdded.connect(this.added);
    workspace.clientRemoved.connect(this.removed);
    workspace.desktopPresenceChanged.connect(this.desktopPresenceChanged);
}function ShortcutManager() {

    this.toggleFloat = function() {
        var client = workspace.activeClient;
        if (TilingManager.screenManagers[client.desktop][client.screen].clientIndex(client) === -1) {
            TilingManager.clientManager.added(client);
        } else {
            TilingManager.clientManager.removed(client);
        }
    };

    registerShortcut('Quarter: Float On/Off', 'Quarter: Float On/Off', 'Meta+F', this.toggleFloat);

}function ScreenManager(scr) {
    print("new ScreenManager");

    this.clients = [];
    this.layout = getLayout(readConfig("layout", 0), workspace.clientArea(0, scr, 0));

    this.tile = function () {
        print("ScreenManager.tile");
        this.layout.adjustTiles(this.clients.length);
        for (var c = 0; c < this.clients.length; c++) {
            this.clients[c].geometry = this.layout.tiles[c];
        }
    };

    this.finishMove = function (client) {
        var centers = [];
        var index = this.clientIndex(client);

        for (var i = 0; i < this.clients.length; i++) {

            if (i !== index) {
                geo = this.clients[i].geometry;
            } else {
                geo = client.startGeo;
            }

            centers[i] = ({
                x: geo.x + geo.width / 2,
                y: geo.y + geo.height / 2
            });

        }

        geo = client.geometry;
        geo.x += geo.width / 2;
        geo.y += geo.height / 2;

        var closestClient = centers[index];
        var closestDist = 99999;

        for (var i = 0; i < centers.length; i++) {
            var dist = Math.abs(geo.x - centers[i].x) + Math.abs(geo.y - centers[i].y);
            if (dist < closestDist) {
                closestDist = dist;
                closestClient = centers[i];
            }
        }

        if (centers.indexOf(closestClient) !== index) {
            this.swapClients(client, this.clients[centers.indexOf(closestClient)])
        }
    };

    this.isIndexEmpty = function (i) {
        return (this.clients[i] === undefined) ? true : false;
    };

    this.swapClients = function (client1, client2) {
        var i1 = this.clientIndex(client1);
        var i2 = this.clientIndex(client2);

        var tempClient = client1;

        this.clients[i1] = client2
        this.clients[i2] = tempClient;
    };

    this.clientIndex = function (client) {
        for (var i = 0; i < this.clients.length; i++) {
            if (client.windowId === this.clients[i].windowId ||
                client.frameId === this.clients[i].frameId) {
                return i;
            }
        }
        return -1;
    };

}function TilingManager() {
    print("new TilingManager");
    this.screenManagers = [];
    
    for (var desk = 1; desk <= workspace.desktops; desk++) {
        this.screenManagers[desk] = [];

        for (var scr = 0; scr < workspace.numScreens; scr++) {
            this.screenManagers[desk][scr] = new ScreenManager(scr);
        }

    }
    
    this.tile = function () {
        print("TilingManager.tile");
        var screenManager = this.screenManagers[workspace.currentDesktop];

        for (var scr = 0; scr < screenManager.length; scr++) {
            screenManager = this.screenManagers[workspace.currentDesktop][scr];
            screenManager.tile();
        }

    };

    this.findScreenManager = function(client) {
        if (this.screenManagers[client.desktop][client.screen].clientIndex(client) !== -1) {
            return this.screenManagers[client.desktop][client.screen];
        } 
        
        else {
            for (var desk = 1; desk <= workspace.desktops; desk++) {
                for (var scr = 0; scr < workspace.numScreens; scr++) {
                    if (this.screenManagers[desk][scr].clientIndex(client) !== -1) {
                        return this.screenManagers[desk][scr];
                    }
                }
            }
        }

        return null;
    }

    this.clientManager = new ClientManager(this);
    this.shortcutManager = new ShortcutManager();

}function getLayout(layoutId, geo) {
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

var TilingManager = new TilingManager();
