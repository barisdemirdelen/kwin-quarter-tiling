/**
 * Contains all client-related signals and functions
 * @class
 */
function ClientManager(tilingManager) {
    print("new ClientManager")

    // Hack to let the inner connections call this
    var self = this;

    this.ignoredClients = [
        "plasma",
        "plasma-desktop",
        "plasmashell"
    ];

    /**
     * Adds a client to a ScreenManager and initiates new attributes necessary for the script
     * @param {KWin.client} client
     */
    this.added = function (client) {
        print("ClientManager.added");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];

        if (!self.eligible(client) || screenManager.clients.length > screenManager.layout.max - 1) {
            return;
        }

        // Keeping a separate (from KWin) track of these will make things easier 
        client.tiledDesk = client.desktop;
        client.tiledScr = client.screen;
        client.index = screenManager.clients.length;
        // Used to store pre-movement geometry
        client.startGeo = client.geometry;
        // Used to store the original geometry (used when a client is floated)
        client.oldGeo = client.geometry;

        // Necessary signal connections
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
    this.removed = function (client) {
        print("ClientManager.removed");
        var screenManager = tilingManager.screenManagers[client.tiledDesk][client.tiledScr];

        if (screenManager.clientIndex(client) === -1) {
            return;
        }

        // Necessary signal disconnections
        client.clientStartUserMovedResized.disconnect(self.startMove);
        client.clientFinishUserMovedResized.disconnect(self.finishMove);
        if (readConfig("live", false).toString() === "true") {
            client.clientStepUserMovedResized.disconnect(self.stepMove);
        }

        // Roll the indexes down
        for (var i = 0; i < screenManager.clients.length; i++) {
            if (screenManager.clients[i].index > client.index) {
                screenManager.clients[i].index -= 1;
            }
        }

        screenManager.clients.splice(client.index, 1);

        // Nullify these last as they might be used during the removal
        client.tiledScr = null;
        client.tiledDesk = null;
        client.index = null;
        client.startGeo = null;
        client.oldGeo = null;

        tilingManager.tile();
    };

    /**
     * Checks if the client is eligible for tiling or not
     * @param {KWin.client} client
     * @return
     *  Whether the client is eligible for tiling
     */
    this.eligible = function (client) {
        return (client.comboBox || client.desktopWindow || client.dialog || client.dndIcon || client.dock || client.dropdownMenu ||
            client.menu || client.notification || client.popupMenu || client.specialWindow || client.splash || client.toolbar ||
            client.tooltip || client.utility || client.transient || this.ignoredClients.indexOf(client.resourceClass.toString()) > -1 ||
            this.ignoredClients.indexOf(client.resourceName.toString()) > -1) ? false : true;
    };

    /**
     * Stores pre-movement position of a client and checks the client's index in a ScreenManager
     * @param {KWin.client} client
     */
    this.startMove = function (client) {
        print("ClientManager.startMove");
        var screenManager = tilingManager.screenManagers[client.tiledDesk][client.tiledScr];

        client.startGeo = client.geometry;
    };

    /** Similar to finishMove, but called every step of the event
     * @param {KWin.client} client
     */
    this.stepMove = function (client) {
        // print("ClientManager.stepMove")
        var screenManager = tilingManager.screenManagers[client.tiledDesk][client.tiledScr];

        screenManager.layout.finishMove(client);
        tilingManager.tile();
        
        client.startGeo = client.geometry;
    };

    /**
     * Calls for the ScreenManager's layout to adjust the tiles according to the movement
     * @param {KWin.client} client
     */
    this.finishMove = function (client) {
        print("ClientManager.finishMove");
        var screenManager = tilingManager.screenManagers[client.tiledDesk][client.tiledScr];

        if (client.geometry.width === client.startGeo.width && client.geometry.height === client.startGeo.height) {
            screenManager.finishMove(client)
        } else {
            screenManager.layout.finishMove(client);
        }

        tilingManager.tile();
    };

    this.currentDesktopChanged = function(desktop, client) {
        print("ClientManager.currentDesktopChanged");
        // TODO
    };

    this.desktopPresenceChanged = function(client, desktop) {
        print("ClientManager.desktopPresenceChanged");
        // TODO
    };

    if (readConfig("auto", false).toString() === "true") {
        workspace.clientAdded.connect(this.added);
    }

    workspace.clientRemoved.connect(this.removed);

    workspace.currentDesktopChanged.connect(this.currentDesktopChanged);
    workspace.desktopPresenceChanged.connect(this.desktopPresenceChanged);

}