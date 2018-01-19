///////////////
// Shortcuts //
///////////////

const Ws = workspace;

function NumberOfDesktops() { return Ws.desktops; }
function NumberOfScreens() { return Ws.numScreens; }
const NumDesks = NumberOfDesktops();
const NumScrs = NumberOfScreens();

function CurrentActivity() { return Ws.currentActivity; }
function CurrentDesk() { return Ws.currentDesktop; }
function CurrentScreen() { return Ws.activeScreen; }
const CurAct = CurrentActivity();
const CurDesk = CurrentDesk();
const CurScr = CurrentScreen();

function ScreenGeo(scr) { return Ws.clientArea(0, scr, 0); }




/////////////
// Globals //
/////////////

WM = [];

// Initiate the desktops and screens
for (var desk = 1; desk <= NumDesks; desk++) {
    WM[desk] = [];
    for (var scr = 0; scr < NumScrs; scr++) {
        WM[desk][scr] = new Screen(ScreenGeo(scr));
    }
}

var Gap = 8;


/////////////
// Signals //
/////////////

function connectWorkspace() {
    Ws.clientAdded.connect(addClient);
    Ws.clientRemoved.connect(removeClient);
}

function addClient(client) {
    if (WM[client.desktop][client.screen].clients.length > 3) return;

    client.index = WM[client.desktop][client.screen].clients.length;
    client.startGeo = client.geometry;
    client.oldGeo = client.geometry;
    
    client.clientStartUserMovedResized.connect(startMove);
    client.clientStepUserMovedResized.connect(stepMove);
    client.clientFinishUserMovedResized.connect(endMove);

    WM[client.desktop][client.screen].clients.push(client);

    tileClients();
}

function removeClient(client) {
    client.index = null;
    client.startGeo = null;
    client.oldGeo = null;

    client.clientStartUserMovedResized.disconnect(startMove);
    client.clientStepUserMovedResized.disconnect(stepMove);
    client.clientFinishUserMovedResized.disconnect(endMove);

    WM[client.desktop][client.screen].clients.splice(WM[client.desktop][client.screen].clientIndex(client.windowId), 1);

    tileClients();
}

function floatClient(client) {
    client.geometry = client.oldGeo;
    
    removeClient(client);
}






function startMove(client) {
    client.startGeo = client.geometry;
    client.index = WM[client.desktop][client.screen].clientIndex(client.windowId);
}

function stepMove(client) {

}

function endMove(client) {    
    WM[client.desktop][client.screen].pane.x += (client.index === 0 || client.index === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
    WM[client.desktop][client.screen].pane.y += (client.index === 0 || client.index === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;

    tileClients();
}



function tileClients() {
    for (var scr = 0; scr < NumScrs; scr++) {
        WM[CurDesk][scr].tile();
        for (var c = 0; c < WM[CurDesk][scr].clients.length; c++) {
            WM[CurDesk][scr].clients[c].geometry = WM[CurDesk][scr].tiles[c];
        }
    }
}



/////////////
// Objects //
/////////////

function Desktop() {

}

function Screen(geometry) {
    this.geometry = geometry;
    this.orientation = (geometry.width > geometry.height) ? "horizontal" : "vertical";
    this.pane = { x: geometry.width / 2, y: geometry.height / 2 };
    this.clients = [];
    this.tiles = [ {}, {}, {}, {} ];

    this.tile = function() {
        for (var t = 0; t < this.tiles.length; t++) {
            this.tiles[t].x = (t === 0 || t === 3) ? this.geometry.x : this.geometry.x + this.pane.x;
            this.tiles[t].y = (t === 0 || t === 1) ? this.geometry.y : this.geometry.y + this.pane.y;
            this.tiles[t].width = (t === 0 || t === 3) ? this.pane.x : this.geometry.width - this.pane.x;
            this.tiles[t].height = (t === 0 || t === 1) ? this.pane.y : this.geometry.height - this.pane.y;
        }
    }

    this.clientIndex = function(id) {
        for(var c = 0; c < this.clients.length; c++) {
            if (id === this.clients[c].windowId) return c;
        }
        return -1;
    }
}




//////////
// Init //
//////////

function main() {
    connectWorkspace();
}

main();