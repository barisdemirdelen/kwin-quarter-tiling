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
    this.removed = function (client) {
        print("ClientManager.removed");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];

        if (screenManager.clientIndex(client) === -1) {
            return;
        }

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
    this.startMove = function (client) {
        print("ClientManager.startMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];

        client.startGeo = client.geometry;
        client.index = screenManager.clientIndex(client);
    };

    /**
     * @param {KWin.client} client
     */
    this.stepMove = function (client) {
        // print("ClientManager.stepMove")
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
    this.finishMove = function (client) {
        print("ClientManager.finishMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];

        if (client.geometry.width === client.startGeo.width && client.geometry.height === client.startGeo.height) {
            screenManager.finishMove(client)
        } else {
            screenManager.layout.finishMove(client);
        }

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

    if (readConfig("auto", false).toString() === "true") {
        workspace.clientAdded.connect(this.added);
    }

    workspace.clientRemoved.connect(this.removed);

}