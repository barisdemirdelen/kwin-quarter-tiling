/**
 * Desktop class, Desktops may contain multiple screens,
 * @constructor
 * @param {int} id - KWin id of the desktop.
 * */
function Desktop(id) {

    var self = this;

    /** @member {int} - Desktop id.*/
    this.id = id;
    /** @member {list} - List of screens in the desktop. */
    this.screens = [];

    for (var i = 0; i < workspace.numScreens; i++) {
        this.screens[i] = new Screen(i);
    }

    /**
     * Tiles all the screens the desktop contains.
     * */
    this.tile = function () {
        for (var i = 0; i < this.screens.length; i++) {
            this.screens[i].tile();
        }
    };

}