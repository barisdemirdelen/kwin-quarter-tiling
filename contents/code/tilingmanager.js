/**
 * Main class that contains all the script-related data
 * @class
 */
function TilingManager() {

    this.views = [];
    for (var desk = 1; desk <= workspace.desktops; desk++) {
        this.views[desk] = [];
        for (var scr = 0; scr < workspace.numScreens; scr++) {
            this.views[desk][scr] = new ScreenManager(scr);
        }
    }

    this.gaps = 8;

    this.tile = function () {
        var view = this.views[workspace.currentDesktop];
        for (var scr = 0; scr < view.length; scr++) {
            view = this.views[workspace.currentDesktop][scr];
            view.tile();
            for (var c = 0; c < view.clients.length; c++) {
                view.clients[c].geometry = view.tiles[c];
            }
        }
    };

    this.clientManager = new ClientManager(this);

}