function Desktop(id) {

    var self = this;

    this.screens = [];
    for (var i = 0; i < workspace.numScreens; i++) {
        this.screens[i] = new Screen(i);
    }

    this.tile = function() {
        for (var i = 0; i < this.screens.length; i++) {
            this.screens[i].tile();
        }
    }

}