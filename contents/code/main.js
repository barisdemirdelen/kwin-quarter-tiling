Qt.include("util.js");
Qt.include("desktop.js");
Qt.include("screen.js");
Qt.include("layouts.js");

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

    // Hire me?
    this.find = function (client) {
        self.log("find");
        for (var i = 0; i < self.desktops.length; i++) {
            for (var j = 0; j < self.desktops[i].screens.length; j++) {
                for (var l = 0; l < self.desktops[i].screens[j].clients.length; l++) {
                    if (self.desktops[i].screens[j].clients[l].windowId === client.windowId ||
                        self.desktops[i].screens[j].frameId === client.frameId) {
                        return {screen: self.desktops[i].screens[j], index: l};
                    }
                }
            }
        }
        self.log("nofind");
        return {screen: -1, index: -1};
    };

    // Checks whether a client is eligible for tiling or not
    this.eligible = function (client) {
        self.log("eligible");
        return (!(client.comboBox || client.desktopWindow || client.dialog ||
            client.dndIcon || client.dock || client.dropdownMenu ||
            client.menu || client.notification || client.popupMenu ||
            client.specialWindow || client.splash || client.toolbar ||
            client.tooltip || client.utility || client.transient ||
            self.ignored.indexOf(client.resourceClass.toString()) > -1 ||
            self.ignored.indexOf(client.resourceName.toString()) > -1 ||
            self.desktops[client.desktop].screens[client.screen].clients.length >
            self.desktops[client.desktop].screens[client.screen].layout.max - 1));
    };

    this.add = function (client) {
        self.log("add");
        if (!self.eligible(client)) return;
        self.original[client.windowId] = Qt.rect(client.geometry.x, client.geometry.y,
            client.geometry.width, client.geometry.height);

        client.clientFinishUserMovedResized.connect(function () {
            self.move(client);
        });
        client.screenChanged.connect(function () {
            self.relocate(client);
        });
        if (isConfigSet("live")) {
            client.clientStepUserMovedResized.connect(function () {
                self.move(client);
            });
        }

        var screen = self.desktops[client.desktop].screens[client.screen];
        screen.clients.push(client);
        screen.tile();
    };

    this.remove = function (client) {
        self.log("remove");
        self.reset(client);

        client.clientFinishUserMovedResized.disconnect(function () {
            self.move(client);
        });
        client.screenChanged.disconnect(function () {
            self.relocate(client);
        });
        if (isConfigSet("live")) {
            client.clientStepUserMovedResized.disconnect(function () {
                self.move(client);
            });
        }

        var p = self.find(client);
        if (p.screen === -1) {
            return
        }
        p.screen.clients.splice(p.index, 1);
        p.screen.tile();
    };

    this.reset = function (client) {
        self.log("reset");
        var original = self.original[client.windowId];

        client.geometry.width = original.width;
        client.geometry.height = original.height;
    };

    this.resize = function (client) {
        self.log("resize");
        var p = self.find(client);
        if (p.screen === -1) {
            return
        }

        if (client.geometry.width === p.screen.layout.tiles[p.index].width &&
            client.geometry.height === p.screen.layout.tiles[p.index].height) {
            return;
        }
        else {
            p.screen.layout.move(client, p.index);
        }

        p.screen.tile(p.screen.clients.length);
    };

    this.move = function (client) {
        self.log("move");
        var p = self.find(client);
        if (p.screen === -1) {
            return
        }

        if (client.geometry.width === Math.round(p.screen.layout.tiles[p.index].width) &&
            client.geometry.height === Math.round(p.screen.layout.tiles[p.index].height)) {
            if (client.screen !== p.screen.id) {
                self.relocate(client)
            } else {
                p.screen.move(client, p.index)
            }
        } else {
            p.screen.layout.move(client, p.index);
        }

        p.screen.tile();
    };

    this.relocate = function (client) {
        self.log("relocate");
        var p = self.find(client);
        if (p.screen === -1) {
            return
        }

        p.screen.clients.splice(p.index, 1);
        p.screen.tile();

        if (self.eligible(client)) {
            var screen = self.desktops[client.desktop].screens[client.screen];
            screen.clients.push(client);
            screen.tile();
        } else {
            self.remove(client);
        }

    };


    this.toggle = function () {
        self.log("toggle");
        var client = workspace.activeClient;

        try {
            self.remove(client);
        } catch (error) {
            self.add(client);
        }

    };

    this.connectEvents = function () {

        if (isConfigSet("auto")) {
            workspace.clientAdded.connect(self.add);
        }


        workspace.desktopPresenceChanged.connect(function (client, desktop) {
            self.relocate(client);
        });

        workspace.currentDesktopChanged.connect(function (client, desktop) {
            self.tile();
        });

        workspace.activitiesChanged.connect(self.remove);
        workspace.clientMinimized.connect(self.remove);
        workspace.clientRemoved.connect(self.remove);

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


    this.init();
}
