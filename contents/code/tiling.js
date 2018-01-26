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

    this.tile = function() {
        for (var i = 1; i <= this.desktops.length; i++) {
            this.desktops[i].tile();
        }
    }

    // Hire me?
    this.find = function(client) {
        for (var i = 1; i <= this.desktops.length; i++) {
            for (var j = 0; j < this.desktops[i].screens.length; j++) {
                for (var l = 0; l < this.desktops[i].screens[j].clients.length; l++) {
                    if (this.desktops[i].screens[j].clients[l].windowId === client.windowId || this.desktops[i].screens[j].frameId === client.frameId) {
                        return [this.desktops[i].screens[j], l];
                    }
                }
            }
        }
    }

    // Checks whether a client is eligible for tiling or not
    this.eligible = function (client) {
        return (client.comboBox || client.desktopWindow || client.dialog || 
                client.dndIcon || client.dock || client.dropdownMenu ||
                client.menu || client.notification || client.popupMenu || 
                client.specialWindow || client.splash || client.toolbar ||
                client.tooltip || client.utility || client.transient || 
                this.ignored.indexOf(client.resourceClass.toString()) > -1 ||
                this.ignored.indexOf(client.resourceName.toString()) > -1) ? 
                false : true;
    };

    // Stores original geometries so clients can be restored
    this.original = [];

    workspace.clientAdded.connect(function(client) {
        if (!self.eligible(client)) return;

        self.original[client.windowId] = client.geometry;

        var screen = self.desktops[client.desktop].screens[client.screen];

        screen.clients.push(client);

        screen.tile();
    });

    workspace.clientRemoved.connect(function(client) {
        client.geometry = self.original[client.windowId];

        var screen = self.find(client);

        screen[0].clients.splice(screen[1], 1);
    
        screen[0].tile();
    });

    workspace.desktopPresenceChanged.connect(function(client, desktop) {
        var screen = self.find(client);

        screen[0].clients.splice(screen[1], 1);
    
        screen[0].tile();
    });

}