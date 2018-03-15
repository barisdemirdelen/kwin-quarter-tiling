Qt.include("util.js");
Qt.include("rect.js");
Qt.include("client.js");
Qt.include("layouts.js");
Qt.include("screen.js");
Qt.include("desktop.js");

function Activity() {

    // TL;DR: this.desktops[i].screens[j].clients[l].geometry = this.desktops[i].screens[j].layout.tiles[l]

    // A hack to access this from the inner functions
    var self = this;

    this.ignored = ["albert", "kazam", "krunner", "ksmserver", "lattedock",
        "pinentry", "Plasma", "plasma", "plasma-desktop", "plasmashell",
        "plugin-container", "simplescreenrecorder", "yakuake"];
    this.id = workspace.currentActivity.toString();
    this.original = [];
    this.desktops = [];
    this.clients = {};
    this.debug = true;

    this.init = function () {
        self.log("init");
        for (var i = 0; i < workspace.desktops; i++) {
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
        self.log("add");
        if (kwinClient.screen < 0 || kwinClient.desktop < 0) {
            return false;
        }
        var client = new Client(kwinClient, self.desktops[kwinClient.desktop],
            self.desktops[kwinClient.desktop].screens[kwinClient.screen]);
        self.clients[client.id] = client;
        if (!self.isEligible(client)) {
            return false;
        }
        self.original[client.id] = getRectCopy(client.geometry);

        client.kwinClient.clientFinishUserMovedResized.connect(function () {
            self.move(client);
        });
        client.kwinClient.screenChanged.connect(function () {
            self.relocate(client);
        });
        if (isConfigSet("live")) {
            client.kwinClient.clientStepUserMovedResized.connect(function () {
                self.move(client);
            });
        }

        client.screen.add(client);
        return true;
    };

    this.remove = function (client) {
        self.log("remove");
        self.reset(client);

        client.kwinClient.clientFinishUserMovedResized.disconnect(function () {
            self.move(client);
        });
        client.kwinClient.screenChanged.disconnect(function () {
            self.relocate(client);
        });
        if (isConfigSet("live")) {
            client.kwinClient.clientStepUserMovedResized.disconnect(function () {
                self.move(client);
            });
        }

        client.screen.remove(client);
        client.screen = null;
        return true
    };

    this.reset = function (client) {
        self.log("reset");
        var original = self.original[client.id];
        client.setGeometry(Qt.rect(client.geometry.x, client.geometry.y, original.rect.width, original.rect.height));
    };

    this.move = function (client) {
        self.log("move");

        var screen = client.screen;
        if (client.geometry.width === Math.round(screen.layout.tiles[client.screenIndex].width) &&
            client.geometry.height === Math.round(screen.layout.tiles[client.screenIndex].height)) {
            if (client.screen.id !== client.kwinClient.screen || client.desktop.id !== client.kwinClient.desktop) {
                self.relocate(client)
            } else {
                self.log("screen move");
                screen.move(client)
            }
        } else {
            self.log("layout move");
            screen.layout.move(client);
        }

        screen.tile();
    };

    this.relocate = function (client) {
        self.log("relocate");


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
        self.log("toggle");
        var kwinClient = workspace.activeClient;
        var client = self.clients[kwinClient.windowId];

        if (!self.remove(client)) {
            self.add(client);
        }

    };

    this.connectEvents = function () {

        if (isConfigSet("auto")) {
            workspace.clientAdded.connect(self.add);
        }


        workspace.desktopPresenceChanged.connect(function (client, desktop) {
            self.relocate(self.clients[client.windowId]);
        });

        workspace.currentDesktopChanged.connect(function (client, desktop) {
            self.tile();
        });

        workspace.activitiesChanged.connect(function (client) {
            self.remove(self.clients[client.windowId]);
        });
        workspace.clientMinimized.connect(function (client) {
            self.remove(self.clients[client.windowId]);
        });
        workspace.clientRemoved.connect(function (client) {
            self.remove(self.clients[client.windowId]);
        });

        workspace.clientMaximizeSet.connect(function (client, h, v) {
            // TODO
        });

        workspace.numberDesktopsChanged(function (oldDesktops) {
            // TODO
        });

    };

    this.registerShortcuts = function () {
        KWin.registerShortcut("Quarter: Float On/Off", "Quarter: Float On/Off", "Meta+F", self.toggle);
    };

    this.log = function (str) {
        if (self.debug) {
            print("Activity: " + str);
        }
    };

    this.addInitialClients = function () {
        self.log("addInitialClients");
        var clients = workspace.clientList();
        for (var i = 0; i < clients.length; i++) {
            self.add(clients[i]);
        }
    };

    // Checks whether a client is eligible for tiling or not
    this.isEligible = function (client) {
        self.log("eligible");
        var clientEligible = client.isEligible();
        return clientEligible && !self.isIgnored(client);
    };

    this.isIgnored = function (client) {
        return self.ignored.indexOf(client.kwinClient.resourceClass.toString()) > -1 ||
            self.ignored.indexOf(client.kwinClient.resourceName.toString()) > -1
    };


    this.init();
}
