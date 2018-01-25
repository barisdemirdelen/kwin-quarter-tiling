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
}