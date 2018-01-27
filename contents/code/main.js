Qt.include("desktop.js")
Qt.include("screen.js")
Qt.include("layouts.js")

function Activity() {

    // TL;DR: this.desktops[i].screens[j].clients[l].geometry = this.desktops[i].screens[j].layout.tiles[l]

    // A hack to access this from the inner functions
    var self = this;

    this.ignored = [
        "plasma",
        "plasma-desktop",
        "plasmashell"
    ];

    this.id = workspace.currentActivity.toString();

    this.desktops = [];
    for(var i = 1; i <= workspace.desktops; i++) {
        this.desktops[i] = new Desktop(i);
    }

    this.original = [];

    this.tile = function() {
        for (var i = 1; i <= this.desktops.length; i++) {
            this.desktops[i].tile();
        }
    };

    // Hire me?
    this.find = function(client) {
        for (var i = 1; i <= this.desktops.length; i++) {
            for (var j = 0; j < this.desktops[i].screens.length; j++) {
                for (var l = 0; l < this.desktops[i].screens[j].clients.length; l++) {
                    if (this.desktops[i].screens[j].clients[l].windowId === client.windowId || this.desktops[i].screens[j].frameId === client.frameId) {
                        return { screen: this.desktops[i].screens[j], index: l };
                    }
                }
            }
        }

        return { screen: -1, index: -1};
    };

    // Checks whether a client is eligible for tiling or not
    this.eligible = function (client) {
        return (client.comboBox || client.desktopWindow || client.dialog || 
                client.dndIcon || client.dock || client.dropdownMenu ||
                client.menu || client.notification || client.popupMenu || 
                client.specialWindow || client.splash || client.toolbar ||
                client.tooltip || client.utility || client.transient ||
                client.activities[0].toString() != this.id ||
                this.ignored.indexOf(client.resourceClass.toString()) > -1 ||
                this.ignored.indexOf(client.resourceName.toString()) > -1) ? 
                false : true;
    };

    this.add = function(client) { 
        if (!self.eligible(client)) return;
        self.original[client.windowId] = Qt.rect(client.geometry.x, client.geometry.y, client.geometry.width, client.geometry.height);

        client.clientFinishUserMovedResized.connect(self.move);

        var screen = self.desktops[client.desktop].screens[client.screen];
        screen.clients.push(client);
        screen.tile();
    };

    this.remove = function(client) {
        self.reset(client);

        client.clientFinishUserMovedResized.disconnect(self.move);

        var p = self.find(client);
        p.screen.clients.splice(p.index, 1);
        p.screen.tile();
    };

    this.reset = function(client) {
        var original = this.original[client.windowId];
        client.geometry.width = original.width;
        client.geometry.height = original.height;
    };

    this.move = function(client) {
        var p = self.find(client);

        if (client.geometry.width === p.screen.layout.tiles[p.index].width && client.geometry.height === p.screen.layout.tiles[p.index].height) {
            if (client.screen !== p.screen.id) {
                self.remove(client)
            }
            else {
                p.screen.move(client, p.index)
            }
        }
        else {
            p.screen.layout.move(client, p.index);
        }

        p.screen.tile(p.screen.clients.length);
    };

    workspace.clientAdded.connect(function(client) {
        self.add(client);
    });

    workspace.clientRemoved.connect(function(client) {
        self.remove(client);
    });

    workspace.desktopPresenceChanged.connect(function(client, desktop) {
        self.remove(client);
    });

    workspace.activitiesChanged.connect(function(client) {
        self.remove(client);
    });


    this.toggle = function() {
        var client = workspace.activeClient;

        try {
            self.remove(client);
        }
        catch (error) {
            self.add(client);
        }
        
    };

    KWin.registerShortcut("Quarter: Float On/Off", "Quarter: Float On/Off", "Meta+F", this.toggle);

}
