Qt.include("util.js");
Qt.include("rect.js");
Qt.include("client.js");
Qt.include("layouts.js");
Qt.include("screen.js");
Qt.include("desktop.js");

/**
 * Main Activity class for the quarter tiling script.
 * Manages signals from KWin and passes them to desktops/screens/clients that are in need of managing.
 * TL;DR: this.desktops[i].screens[j].clients[l].geometry = this.desktops[i].screens[j].layout.tiles[l]
 * @constructor
 * */
function Activity() {

    // A hack to access this from the inner functions
    var self = this;

    this.workspace = workspace;
    this.options = options;
    this.id = this.workspace.currentActivity.toString();
    this.original = [];
    this.desktops = [];
    this.clients = {};
    this.debug = true;

    this.ignored = ["albert", "kazam", "krunner", "ksmserver", "lattedock",
        "pinentry", "Plasma", "plasma", "plasma-desktop", "plasmashell",
        "plugin-container", "simplescreenrecorder", "yakuake"];

    this.init = function () {
        self.log("init");
        for (var i = 0; i < self.workspace.desktops; i++) {
            self.desktops[i] = new Desktop(i);
        }

        self.connectEvents();
        self.registerShortcuts();
        self.addInitialClients();
    };


    this.tile = function () {
        self.log("tile");
        for (var i = 0; i < self.desktops.length; i++) {
            self.desktops[i].tile();
        }
    };

    this.add = function (kwinClient) {
        self.log("add " + kwinClient.windowId);
        if (kwinClient.screen < 0 || kwinClient.desktop < 0) {
            return false;
        }
        var client = new Client(kwinClient, self.desktops[kwinClient.desktop],
            self.desktops[kwinClient.desktop].screens[kwinClient.screen]);
        if (!self.isEligible(client)) {
            self.log(kwinClient.windowId + " not eligible");
            return false;
        }

        self.clients[client.id] = client;
        self.original[client.id] = getRectCopy(client.geometry);

        client.onScreenChanged = function () {
            self.relocate(client);
        };

        client.onFinishUserMovedResized = function () {
            self.move(client);
        };

        client.onFinishUserMovedResized = function () {
            self.move(client);
        };

        client.onStepUserMovedResized = function () {
            self.move(client);
        };


        client.kwinClient.screenChanged.connect(client.onScreenChanged);
        client.kwinClient.clientFinishUserMovedResized.connect(client.onFinishUserMovedResized);
        if (isConfigSet("live")) {
            client.kwinClient.clientStepUserMovedResized.connect(client.onStepUserMovedResized)
        }

        client.screen.add(client);
        client.added = true;
        return true;
    };

    this.remove = function (client) {
        self.log("remove " + client.id);

        self.reset(client);

        client.kwinClient.screenChanged.disconnect(client.onScreenChanged);
        client.kwinClient.clientFinishUserMovedResized.disconnect(client.onFinishUserMovedResized);
        if (isConfigSet("live")) {
            client.kwinClient.clientStepUserMovedResized.disconnect(client.onStepUserMovedResized);
        }

        client.screen.remove(client);
        client.screen = null;
        client.desktop = null;
        client.added = false;
        return true
    };

    this.reset = function (client) {
        self.log("reset " + client.id);
        var original = self.original[client.id];
        client.setGeometry(Qt.rect(client.geometry.x, client.geometry.y, original.width, original.height));
    };

    this.move = function (client) {
        self.log("move " + client.id);

        var screen = client.screen;
        if (client.geometry.width === Math.round(screen.layout.tiles[client.screenIndex].width) &&
            client.geometry.height === Math.round(screen.layout.tiles[client.screenIndex].height)) {
            if (client.needsRelocating()) {
                self.relocate(client)
            } else {
                self.log("screen move " + client.id);
                screen.move(client)
            }
        } else {
            self.log("layout move " + client.id);
            screen.layout.move(client);
        }

        screen.tile();
    };

    this.relocate = function (client) {
        self.log("relocate " + client.id);

        client.screen.remove(client);

        client.desktop = self.desktops[client.kwinClient.desktop];
        client.screen = self.desktops[client.kwinClient.desktop].screens[client.kwinClient.screen];

        if (self.isEligible(client)) {
            client.screen.add(client);
        } else {
            self.remove(client);
        }
    };


    this.toggle = function () {
        var kwinClient = self.workspace.activeClient;
        self.log("toggle " + kwinClient.windowId);
        var client = self.clients[kwinClient.windowId];
        if (client != null && client.added) {
            self.remove(client)
        } else {
            self.add(kwinClient);
        }

    };

    this.connectEvents = function () {

        if (isConfigSet("auto")) {
            self.workspace.clientAdded.connect(self.add);
        }


        self.workspace.currentDesktopChanged.connect(function (client, desktop) {
            self.tile();
        });

        self.workspace.desktopPresenceChanged.connect(self.onRelocate);
        self.workspace.activitiesChanged.connect(self.onRemove);
        self.workspace.clientMinimized.connect(self.onRemove);
        self.workspace.clientRemoved.connect(self.onRemove);
        self.workspace.clientUnminimized.connect(self.add);

        self.workspace.clientMaximizeSet.connect(function (client, h, v) {
            // TODO
        });

        self.workspace.numberDesktopsChanged(function (oldDesktops) {
            // TODO
        });

    };

    this.registerShortcuts = function () {
        KWin.registerShortcut("Quarter: Float On/Off", "Quarter: Float On/Off", "Meta+F", self.toggle);
    };

    this.log = function (str) {
        if (self.debug) {
            print("KWinQuarterTiling.Activity - " + str);
        }
    };

    this.addInitialClients = function () {
        self.log("addInitialClients");
        var clients = self.workspace.clientList();
        for (var i = 0; i < clients.length; i++) {
            self.add(clients[i]);
        }
    };

    // Checks whether a client is eligible for tiling or not
    this.isEligible = function (client) {
        self.log("isEligible " + client.id);
        var clientEligible = client.isEligible();
        return clientEligible && !self.isIgnored(client);
    };

    this.isIgnored = function (client) {
        return self.ignored.indexOf(client.kwinClient.resourceClass.toString()) > -1 ||
            self.ignored.indexOf(client.kwinClient.resourceName.toString()) > -1
    };

    this.onRemove = function (kwinClient) {
        var client = self.clients[kwinClient.windowId];
        if (client == null || !client.added) {
            return
        }
        self.remove(client)
    };

    this.onRelocate = function (kwinClient) {
        var client = self.clients[kwinClient.windowId];
        if (client == null || !client.added) {
            return
        }
        self.relocate(client)
    };


    /**
     * Ticks at every interval defined in main.qml to check if stuff changed.
     * Useful for when the Kwin signals aren't good enough or working.
     * Currently is only used when the screen geometry is updated.
     */
    this.tick = function () {
        for (var i = 0; i < self.desktops.length; i++) {
            var currentDesktop = self.desktops[i];
            for (var j = 0; j < currentDesktop.screens.length; j++) {
                currentDesktop.screens[j].tick();
            }
        }
    };

    this.init();
}
