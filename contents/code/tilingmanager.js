/**
 * Main class that contains all the script-related data -
 * launch the script by creating a new TilingManager()
 * @class
 */
function TilingManager() {
    print("new TilingManager");

    this.screenManagers = [];
    for (var desk = 1; desk <= workspace.desktops; desk++) {
        this.screenManagers[desk] = [];
        for (var scr = 0; scr < workspace.numScreens; scr++) {
            this.screenManagers[desk][scr] = new ScreenManager(scr);
        }
    }
    
    /**
     * Tiles every screen on the current desktop
     */
    this.tile = function () {
        print("TilingManager.tile");
        var screenManager = this.screenManagers[workspace.currentDesktop];
        for (var scr = 0; scr < screenManager.length; scr++) {
            screenManager = this.screenManagers[workspace.currentDesktop][scr];
            screenManager.tile();
        }
    };

    this.clientManager = new ClientManager(this);

}