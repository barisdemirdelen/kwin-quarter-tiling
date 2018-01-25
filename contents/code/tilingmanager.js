function TilingManager() {
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

}